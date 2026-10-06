import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  X,
  Calendar,
  Upload,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  createProposal,
  deleteProposal,
  getMyProposals,
  submitProposal,
  updateProposal,
  Dosen,
  Mahasiswa,
  getFakultasList,
  Fakultas,
} from "./proposal.api";
import { Proposal } from "./proposal.types";
import {
  DosenProposalStatusFilter,
  ProposalApiError,
  ProposalFormMode,
  ProposalFormValues,
} from "./ProposalDosen.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DosenAutocomplete from "./components/DosenAutocomplete";
import MahasiswaAutocomplete from "./components/MahasiswaAutocomplete";
import { Card, CardContent } from "@/components/ui/card";
import { getUsers } from "@/features/users/Users.api";

const PAGE_SIZE = 5;

const defaultFormValues: ProposalFormValues = {
  title: "",
  faculty: "",
  prodi: "",
  skema: "",
  sumber_data_penelitian: "",
  detail_sumber_penelitian: "",
  instansi: "",
  dosen_terlibat: "",
  nidn_dosen_terlibat: "",
  nama_anggota: "",
  nim_anggota: "",
  funding_request_amount: "",
  proposal_file: null,
  rab_file: null,
};

const statusLabelMap: Record<string, string> = {
  REVIEW: "Review",
  UNDER_REVIEW: "Under Review",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  ACCEPTED: "Accepted",
  DRAFT: "Draft",
  REVISION: "Revision",
  REJECTED: "Rejected",
  ADMIN_VERIFIED: "Admin Verified",
};

const statusStyleMap: Record<string, string> = {
  REVIEW: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  SUBMITTED: "bg-orange-100 text-orange-600",
  APPROVED: "bg-green-100 text-green-600",
  ACCEPTED: "bg-green-100 text-green-600",
  DRAFT: "bg-gray-100 text-gray-600",
  REVISION: "bg-red-100 text-red-600",
  REJECTED: "bg-red-100 text-red-700",
  ADMIN_VERIFIED: "bg-blue-100 text-blue-700",
};

const normalizeStatus = (status: string) =>
  status
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getStatusLabel = (status: string) => {
  const key = normalizeStatus(status);
  return statusLabelMap[key] || status;
};

const getStatusClass = (status: string) => {
  const key = normalizeStatus(status);
  return statusStyleMap[key] || "bg-gray-100 text-gray-600";
};

const formatSkemaLabel = (value?: string | null) => {
  if (!value) return "-";
  return value
    .toLowerCase()
    .split(/[_-]+/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getFileNameFromPath = (path?: string | null) => {
  if (!path) return "";

  const normalized = path.split("?")[0].split("#")[0];
  const segments = normalized.split("/");
  const fileName = segments[segments.length - 1] || "";

  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
};

const resolveExistingFile = (
  directPath?: string | null,
  info?: {
    previous_path?: string | null;
    previous_name?: string | null;
    current_path?: string | null;
    current_name?: string | null;
  },
) => {
  const link = info?.current_path || info?.previous_path || directPath || null;
  const name =
    info?.current_name ||
    info?.previous_name ||
    getFileNameFromPath(link) ||
    "";

  return { link, name };
};

const isPdfFile = (file: File) => {
  if (file.type === "application/pdf") return true;
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension === "pdf";
};

const isRabFileAllowed = (file: File) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  if (allowedMimeTypes.includes(file.type)) return true;
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension === "pdf" || extension === "xls" || extension === "xlsx";
};

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    const responseData = err.response?.data as ProposalApiError | undefined;

    if (responseData?.errors) {
      const firstEntry = Object.values(responseData.errors)[0];
      if (Array.isArray(firstEntry) && firstEntry.length > 0) {
        return firstEntry[0];
      }
      if (typeof firstEntry === "string") {
        return firstEntry;
      }
    }

    return responseData?.message || err.message || fallback;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
};

export default function ProposalDosen() {
  interface DosenRow {
    nidn: string;
    nama: string;
    peran: string;
  }

  interface MahasiswaRow {
    nim: string;
    nama: string;
    prodi: string;
    peran: string;
  }

  const [data, setData] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<DosenProposalStatusFilter>("ALL");

  const [page, setPage] = useState(1);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState<number | null>(
    null,
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<ProposalFormMode>("create");
  const [editingProposalId, setEditingProposalId] = useState<number | null>(
    null,
  );
  const [formValues, setFormValues] =
    useState<ProposalFormValues>(defaultFormValues);

  const [dosenRows, setDosenRows] = useState<DosenRow[]>([
    { nidn: "", nama: "", peran: "Ketua Peneliti" },
  ]);
  const [mahasiswaRows, setMahasiswaRows] = useState<MahasiswaRow[]>([
    { nim: "", nama: "", prodi: "", peran: "Anggota" },
  ]);
  const [sumberPendanaan, setSumberPendanaan] = useState("Pilih");
  const [fakultasList, setFakultasList] = useState<Fakultas[]>([]);
  const [fakultasLoading, setFakultasLoading] = useState(true);

  const editingProposal = useMemo(
    () => data.find((item) => item.id === editingProposalId) || null,
    [data, editingProposalId],
  );

  const existingProposalFile = useMemo(
    () =>
      resolveExistingFile(
        editingProposal?.proposal_file_path,
        editingProposal?.file_info?.proposal_file,
      ),
    [editingProposal],
  );

  const existingRabFile = useMemo(
    () =>
      resolveExistingFile(
        editingProposal?.rab_file_path,
        editingProposal?.file_info?.rab_file,
      ),
    [editingProposal],
  );

  useEffect(() => {
    const fetchFakultas = async () => {
      try {
        setFakultasLoading(true);
        const response = await getFakultasList();
        setFakultasList(response.data || []);
      } catch (err) {
        console.error("Gagal memuat daftar fakultas:", err);
        setFakultasList([]);
      } finally {
        setFakultasLoading(false);
      }
    };

    fetchFakultas();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const loadProposals = async (search: string) => {
    setLoading(true);
    setError(null);

    try {
      const first = await getMyProposals({ page: 1, search });
      const allData = [...first.data];
      const totalPages = first.meta.totalPages || 1;

      if (totalPages > 1) {
        const requests: ReturnType<typeof getMyProposals>[] = [];

        for (let i = 2; i <= totalPages; i++) {
          requests.push(getMyProposals({ page: i, search }));
        }

        const rest = await Promise.all(requests);
        rest.forEach((item) => allData.push(...item.data));
      }

      setData(allData);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Gagal memuat proposal."));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProposals(debouncedQuery);
  }, [debouncedQuery]);

  const filtered = useMemo(() => {
    return data.filter((proposal) => {
      if (statusFilter === "ALL") return true;
      return normalizeStatus(proposal.status) === normalizeStatus(statusFilter);
    });
  }, [data, statusFilter]);

  const totalPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPage) {
      setPage(1);
    }
  }, [page, totalPage]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetForm = () => {
    setFormValues(defaultFormValues);
    setEditingProposalId(null);
    setFormMode("create");
  };

  const syncDosenToForm = (rows: DosenRow[]) => {
    setFormValues((prev) => ({
      ...prev,
      nidn_dosen_terlibat: rows.map((r) => r.nidn.trim()).join("\n"),
      dosen_terlibat: rows.map((r) => r.nama.trim()).join("\n"),
    }));
  };

  const syncMahasiswaToForm = (rows: MahasiswaRow[]) => {
    setFormValues((prev) => ({
      ...prev,
      nim_anggota: rows.map((r) => r.nim.trim()).join("\n"),
      nama_anggota: rows.map((r) => r.nama.trim()).join("\n"),
    }));
  };

  const handleDosenChange = (
    index: number,
    field: keyof DosenRow,
    value: string,
  ) => {
    const next = [...dosenRows];
    next[index] = { ...next[index], [field]: value };
    setDosenRows(next);
    syncDosenToForm(next);

    if (field === "nidn") {
      void searchDosenUser(value, index);
    }
  };

  const searchDosenUser = async (nidn: string, index: number) => {
    if (nidn.trim().length < 3) return;
    try {
      const res = await getUsers({ search: nidn, roles: "DOSEN" });
      if (res.data && res.data.length > 0) {
        const matched = res.data.find(
          (u) => u.nidn === nidn || u.username === nidn,
        );
        if (matched) {
          const next = [...dosenRows];
          next[index] = { ...next[index], nama: matched.name };
          setDosenRows(next);
          syncDosenToForm(next);
        }
      }
    } catch (err) {
      console.error("Gagal memuat info dosen:", err);
    }
  };

  const handleMahasiswaChange = (
    index: number,
    field: keyof MahasiswaRow,
    value: string,
  ) => {
    const next = [...mahasiswaRows];
    next[index] = { ...next[index], [field]: value };
    setMahasiswaRows(next);
    syncMahasiswaToForm(next);

    if (field === "nim") {
      void searchMahasiswaUser(value, index);
    }
  };

  const handleDosenAutocompleteSelect = (dosen: Dosen, index: number) => {
    const next = [...dosenRows];
    next[index] = {
      ...next[index],
      nama: dosen.name,
      nidn: dosen.nidn,
    };
    setDosenRows(next);
    syncDosenToForm(next);
  };

  const handleMahasiswaAutocompleteSelect = (mahasiswa: Mahasiswa, index: number) => {
    const next = [...mahasiswaRows];
    next[index] = {
      ...next[index],
      nama: mahasiswa.name,
      nim: mahasiswa.nim,
      prodi: mahasiswa.program_studi.nama,
    };
    setMahasiswaRows(next);
    syncMahasiswaToForm(next);
  };

  const searchMahasiswaUser = async (nim: string, index: number) => {
    if (nim.trim().length < 3) return;
    try {
      const res = await getUsers({ search: nim });
      if (res.data && res.data.length > 0) {
        const matched = res.data.find(
          (u) => u.username === nim || u.nidn === nim,
        );
        if (matched) {
          const next = [...mahasiswaRows];
          next[index] = {
            ...next[index],
            nama: matched.name,
            prodi: matched.program_studi || "",
          };
          setMahasiswaRows(next);
          syncMahasiswaToForm(next);
        }
      }
    } catch (err) {
      console.error("Gagal memuat info mahasiswa:", err);
    }
  };

  const addDosenRow = () => {
    const next = [
      ...dosenRows,
      { nidn: "", nama: "", peran: "Anggota Peneliti" },
    ];
    setDosenRows(next);
    syncDosenToForm(next);
  };

  const removeDosenRow = (index: number) => {
    if (index === 0) return;
    const next = dosenRows.filter((_, i) => i !== index);
    setDosenRows(next);
    syncDosenToForm(next);
  };

  const addMahasiswaRow = () => {
    const next = [
      ...mahasiswaRows,
      { nim: "", nama: "", prodi: "", peran: "Anggota" },
    ];
    setMahasiswaRows(next);
    syncMahasiswaToForm(next);
  };

  const removeMahasiswaRow = (index: number) => {
    const next = mahasiswaRows.filter((_, i) => i !== index);
    setMahasiswaRows(next);
    syncMahasiswaToForm(next);
  };

  const openCreateForm = () => {
    resetForm();
    setDosenRows([{ nidn: "", nama: "", peran: "Ketua Peneliti" }]);
    setMahasiswaRows([{ nim: "", nama: "", prodi: "", peran: "Anggota" }]);
    setSumberPendanaan("Pilih");
    setFeedback(null);
    setError(null);
    setIsFormOpen(true);
  };

  const skemaOptions = [
    "Penelitian Pengembangan",
    "Penelitian Terapan",
    "Penelitian Kolaborasi",
  ];

  const openEditForm = (proposal: Proposal) => {
    setError(null);
    setFeedback(null);

    setFormMode("edit");
    setEditingProposalId(proposal.id);
    setFormValues({
      title: proposal.title,
      faculty: proposal.faculty || "",
      prodi: (proposal as any).prodi || "",
      skema: proposal.skema || "",
      sumber_data_penelitian: proposal.sumber_data_penelitian || "",
      detail_sumber_penelitian: (proposal as any).detail_sumber_penelitian || "",
      instansi: proposal.instansi || "",
      dosen_terlibat: proposal.dosen_terlibat || "",
      nidn_dosen_terlibat: proposal.nidn_dosen_terlibat || "",
      nama_anggota: proposal.nama_anggota || "",
      nim_anggota: proposal.nim_anggota || "",
      funding_request_amount: String(proposal.funding_request_amount || ""),
      proposal_file: null,
      rab_file: null,
    });
    setSumberPendanaan("Pilih");

    // PARSE DOSEN
    const nidns = proposal.nidn_dosen_terlibat
      ? proposal.nidn_dosen_terlibat.split("\n")
      : [];
    const namas = proposal.dosen_terlibat
      ? proposal.dosen_terlibat.split("\n")
      : [];
    const length = Math.max(nidns.length, namas.length, 1);
    const parsedDosen: DosenRow[] = [];
    for (let i = 0; i < length; i++) {
      parsedDosen.push({
        nidn: nidns[i] || "",
        nama: namas[i] || "",
        peran: i === 0 ? "Ketua Peneliti" : "Anggota Peneliti",
      });
    }
    setDosenRows(parsedDosen);

    // PARSE MAHASISWA
    const nims = proposal.nim_anggota ? proposal.nim_anggota.split("\n") : [];
    const namaMhs = proposal.nama_anggota
      ? proposal.nama_anggota.split("\n")
      : [];
    const mhsLength = Math.max(nims.length, namaMhs.length, 1);
    const parsedMhs: MahasiswaRow[] = [];
    for (let i = 0; i < mhsLength; i++) {
      parsedMhs.push({
        nim: nims[i] || "",
        nama: namaMhs[i] || "",
        prodi: "",
        peran: "Anggota",
      });
      if (nims[i]) {
        void (async (nimVal: string, idx: number) => {
          try {
            const res = await getUsers({ search: nimVal });
            const matched = res.data.find(
              (u) => u.username === nimVal || u.nidn === nimVal,
            );
            if (matched && matched.program_studi) {
              setMahasiswaRows((prev) => {
                const updated = [...prev];
                if (updated[idx]) {
                  updated[idx].prodi = matched.program_studi || "";
                }
                return updated;
              });
            }
          } catch { }
        })(nims[i], i);
      }
    }
    setMahasiswaRows(parsedMhs);

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: "proposal_file" | "rab_file",
  ) => {
    const file = e.target.files?.[0] || null;

    if (file && field === "proposal_file" && !isPdfFile(file)) {
      setError("File proposal harus PDF.");
      e.target.value = "";
      return;
    }

    if (file && field === "rab_file" && !isRabFileAllowed(file)) {
      setError("File RAB harus PDF atau Excel (.xls/.xlsx).");
      e.target.value = "";
      return;
    }

    setFormValues((prev) => ({ ...prev, [field]: file }));
  };

  const buildPayload = (isDraft: boolean) => {
    const payload = {
      title: formValues.title.trim(),
      faculty: formValues.faculty.trim() || undefined,
      prodi: formValues.prodi.trim() || undefined,
      skema: formValues.skema.trim() || undefined,
      sumber_data_penelitian:
        formValues.sumber_data_penelitian.trim() || undefined,
      detail_sumber_penelitian:
        formValues.detail_sumber_penelitian.trim() || undefined,
      instansi: formValues.instansi.trim() || undefined,
      dosen_terlibat: formValues.dosen_terlibat.trim() || undefined,
      nidn_dosen_terlibat: formValues.nidn_dosen_terlibat.trim() || undefined,
      nama_anggota: formValues.nama_anggota.trim() || undefined,
      nim_anggota: formValues.nim_anggota.trim() || undefined,
      funding_request_amount:
        formValues.funding_request_amount.trim() || undefined,
      is_draft: isDraft,
      proposal_file: formValues.proposal_file || undefined,
      rab_file: formValues.rab_file || undefined,
    };

    return payload;
  };

  const handleSaveProposal = async (isDraft: boolean) => {
    if (!formValues.title.trim()) {
      setError("Judul proposal wajib diisi.");
      return;
    }

    if (formValues.title.trim().length < 5) {
      setError("Judul proposal minimal 5 karakter.");
      return;
    }

    if (!formValues.skema.trim()) {
      setError("Skema proposal wajib dipilih.");
      return;
    }

    if (formValues.proposal_file && !isPdfFile(formValues.proposal_file)) {
      setError("File proposal harus PDF.");
      return;
    }

    if (formValues.rab_file && !isRabFileAllowed(formValues.rab_file)) {
      setError("File RAB harus PDF atau Excel (.xls/.xlsx).");
      return;
    }

    const proposalFileAvailable =
      Boolean(formValues.proposal_file) || Boolean(existingProposalFile.link);
    const rabFileAvailable =
      Boolean(formValues.rab_file) || Boolean(existingRabFile.link);

    if (!isDraft && (!proposalFileAvailable || !rabFileAvailable)) {
      setError("File Proposal dan RAB wajib diunggah untuk melakukan submit.");
      return;
    }

    setIsSubmittingForm(true);
    setError(null);
    setFeedback(null);

    try {
      if (formMode === "create") {
        const response = await createProposal(buildPayload(isDraft));
        setFeedback(response.message);
      } else if (editingProposalId) {
        const response = await updateProposal(
          editingProposalId,
          buildPayload(isDraft),
        );
        setFeedback(response.message);
      }

      closeForm();
      await loadProposals(debouncedQuery);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Gagal menyimpan proposal."));
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteProposal = async (proposal: Proposal) => {
    const confirmed = window.confirm(
      `Hapus proposal ${proposal.title}? Tindakan ini tidak bisa dibatalkan.`,
    );

    if (!confirmed) return;

    setIsSubmittingAction(proposal.id);
    setError(null);
    setFeedback(null);

    try {
      const response = await deleteProposal(proposal.id);
      setFeedback(response.message);
      await loadProposals(debouncedQuery);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Gagal menghapus proposal."));
    } finally {
      setIsSubmittingAction(null);
    }
  };

  const handleSubmitExistingProposal = async (proposal: Proposal) => {
    const confirmed = window.confirm(
      `Submit proposal ${proposal.title} sekarang?`,
    );
    if (!confirmed) return;

    setIsSubmittingAction(proposal.id);
    setError(null);
    setFeedback(null);

    try {
      const response = await submitProposal(proposal.id);
      setFeedback(response.message);
      await loadProposals(debouncedQuery);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Gagal submit proposal."));
    } finally {
      setIsSubmittingAction(null);
    }
  };

  return (
    <div className="min-h-screen space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Proposal Saya</h1>
          <p className="text-sm text-gray-500">
            Kelola usulan penelitian dan pengabdian Anda.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateForm}
          className="bg-red-600 hover:bg-red-700 text-sm text-white px-3 py-5 rounded-lg flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-2 h-3" />
          Buat Proposal Baru
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {feedback && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {feedback}
        </div>
      )}

      {isFormOpen && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={closeForm}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>

          {/* Banner Header Merah Muda */}
          <div className="rounded-xl border border-red-100 bg-[#FEF2F2] p-5 shadow-xs">
            <h2 className="text-base font-bold text-[#DC2626]">
              Buat Proposal Baru
            </h2>
            <p className="text-sm text-[#EF4444] mt-1 font-medium">
              Lengkapi semua bagian yang diperlukan untuk mengajukan proposal
              penelitian.
            </p>
          </div>

          {/* Card 1: Informasi Proposal */}
          <Card className="rounded-xl border border-gray-100 bg-white shadow-xs">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-800">
                Informasi Proposal
              </h3>

              <div className="space-y-4">
                {/* Judul Proposal */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Judul Proposal<span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="title"
                    value={formValues.title}
                    onChange={handleInputChange}
                    placeholder="Masukkan judul proposal"
                    className="h-11 rounded-xl w-full border border-gray-300 px-4"
                  />
                </div>

                {/* Fakultas/Bidang */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Fakultas/Bidang<span className="text-red-500">*</span>
                  </label>
                  {fakultasLoading ? (
                    <div className="h-11 rounded-xl w-full border border-gray-300 px-4 flex items-center text-gray-500">
                      Loading...
                    </div>
                  ) : (
                    <select
                      name="faculty"
                      value={formValues.faculty}
                      onChange={handleInputChange}
                      className="h-11 rounded-xl w-full border border-gray-300 px-4 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all"
                      required
                    >
                      <option value="">-- Pilih Fakultas --</option>
                      {fakultasList.map((fak) => (
                        <option key={fak.id} value={fak.nama}>
                          {fak.nama}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Sumber Data Penelitian */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Sumber Data Penelitian
                  </label>
                  <Input
                    name="sumber_data_penelitian"
                    value={formValues.sumber_data_penelitian}
                    onChange={handleInputChange}
                    placeholder="Contoh: Data Primer, Observasi Lapangan, BPS, Dataset Internal"
                    className="h-11 rounded-xl w-full border border-gray-300 px-4"
                  />
                </div>

                {/* Detail Sumber Data Penelitian */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Detail Sumber Data Penelitian
                  </label>
                  <textarea
                    name="detail_sumber_penelitian"
                    value={formValues.detail_sumber_penelitian}
                    onChange={handleInputChange}
                    placeholder="Jelaskan secara detail tentang sumber data penelitian, metodologi pengumpulan data, karakteristik data, dan relevansinya dengan penelitian ini... (Maksimal 2000 karakter)"
                    className="min-h-[110px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    maxLength={2000}
                  />
                  <div className={`text-xs font-medium ${formValues.detail_sumber_penelitian.length >= 1800 ? 'text-orange-500' : 'text-gray-400'}`}>
                    {formValues.detail_sumber_penelitian.length}/2000 karakter
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Pendanaan & Skema Penelitian */}
          <Card className="rounded-xl border border-gray-100 bg-white shadow-xs">
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-800">
                  Pendanaan & Skema Penelitian
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Informasi sumber pendanaan, skema penelitian, dan nominal
                  pengajuan proposal.
                </p>
              </div>

              {/* Grid Utama 2 Kolom - CUKUP SATU SAJA */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* 1. Sumber Pendanaan */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Sumber Pendanaan
                  </label>
                  <div className="relative">
                    <select
                      value={sumberPendanaan}
                      onChange={(e) => setSumberPendanaan(e.target.value)}
                      className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 pr-10 text-sm text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                    >
                      <option value="Pilih">Pilih</option>
                      <option value="Internal Kampus">Internal Kampus</option>
                      <option value="Kemendikbudristek">Kemendikbudristek</option>
                      <option value="Mandiri">Mandiri</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <svg
                        className="h-4 w-4 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 2. Skema Penelitian / Hibah */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Skema Penelitian / Hibah
                  </label>
                  <div className="relative">
                    <select
                      name="skema"
                      value={formValues.skema}
                      onChange={handleInputChange}
                      className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 pr-10 text-sm text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                    >
                      <option value="">Pilih</option>
                      {skemaOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <svg
                        className="h-4 w-4 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 3. Instansi Pemberi Dana */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Instansi Pemberi Dana
                  </label>
                  <Input
                    name="instansi"
                    value={formValues.instansi}
                    onChange={handleInputChange}
                    placeholder="Contoh: LPPM UMC, Kemendikbudristek, ..."
                    className="h-11 w-full rounded-xl border border-gray-300 px-4"
                  />
                </div>

                {/* 4. Nominal Pengajuan Dana */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Nominal Pengajuan Dana <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-semibold text-gray-500">
                      Rp.
                    </span>
                    <Input
                      name="funding_request_amount"
                      value={formValues.funding_request_amount}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, "");
                        setFormValues((prev) => ({
                          ...prev,
                          funding_request_amount: cleaned,
                        }));
                      }}
                      placeholder="15.000.000"
                      className="h-11 w-full pl-12 rounded-xl border border-gray-300"
                    />
                  </div>
                </div>

              </div>


            </CardContent>
          </Card>

          {/* Card 3: Tim Dosen Peneliti */}
          <div className="space-y-6">
            {/* Card 3: Tim Dosen Peneliti */}
            <Card className="rounded-2xl border border-gray-200/80 bg-white shadow-xs">
              <CardContent className="p-6 space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-800">
                    Tim Dosen Peneliti
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Dosen-dosen yang terlibat dalam penelitian atau pengabdian, dll.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-left text-sm border-collapse">
                    <thead>
                      <tr className="text-xs font-semibold text-gray-500">
                        <th className="pb-3 font-semibold" style={{ width: "22%" }}>
                          NIDN
                        </th>
                        <th className="pb-3 font-semibold" style={{ width: "48%" }}>
                          Nama Dosen
                        </th>
                        <th className="pb-3 font-semibold" style={{ width: "23%" }}>
                          Peran
                        </th>
                        <th className="pb-3 font-semibold text-center" style={{ width: "7%" }}>
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dosenRows.map((row, idx) => (
                        <tr key={idx} className="align-middle">
                          <td className="py-2 pr-2">
                            <Input
                              value={row.nidn}
                              onChange={(e) =>
                                handleDosenChange(idx, "nidn", e.target.value)
                              }
                              placeholder="NIDN otomatis muncul"
                              disabled
                              className="w-full h-10 text-xs rounded-xl bg-gray-50/80 border border-gray-200 text-gray-600 shadow-none px-4 cursor-not-allowed"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <DosenAutocomplete
                              onSelect={(dosen) => handleDosenAutocompleteSelect(dosen, idx)}
                              placeholder="Cari atau ketik nama dosen..."
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <div className="h-10 w-full flex items-center rounded-xl border border-gray-300 bg-white px-3 text-xs font-medium text-gray-800 shadow-none">
                              {row.peran}
                            </div>
                          </td>
                          <td className="py-2 text-center">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => removeDosenRow(idx)}
                              className="p-1.5 rounded-lg border border-transparent text-gray-300 hover:text-red-500 disabled:opacity-20 disabled:hover:text-gray-300 cursor-pointer transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDosenRow}
                    className="h-10 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-none"
                  >
                    <Plus size={14} />
                    Tambah Dosen
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Mahasiswa Terlibat */}
            <Card className="rounded-2xl border border-gray-200/80 bg-white shadow-xs">
              <CardContent className="p-6 space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-800">
                    Mahasiswa Terlibat
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Daftar mahasiswa yang terlibat dalam penelitian. (Opsional)
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-left text-sm border-collapse">
                    <thead>
                      <tr className="text-xs font-semibold text-gray-500">
                        <th className="pb-3 font-semibold" style={{ width: "20%" }}>
                          NIM
                        </th>
                        <th className="pb-3 font-semibold" style={{ width: "35%" }}>
                          Nama Mahasiswa
                        </th>
                        <th className="pb-3 font-semibold" style={{ width: "25%" }}>
                          Program Studi
                        </th>
                        <th className="pb-3 font-semibold" style={{ width: "13%" }}>
                          Peran
                        </th>
                        <th className="pb-3 font-semibold text-center" style={{ width: "7%" }}>
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mahasiswaRows.map((row, idx) => (
                        <tr key={idx} className="align-middle">
                          <td className="py-2 pr-2">
                            <Input
                              value={row.nim}
                              onChange={(e) =>
                                handleMahasiswaChange(idx, "nim", e.target.value)
                              }
                              placeholder="NIM otomatis muncul"
                              disabled
                              className="w-full h-10 text-xs rounded-xl bg-gray-50/80 border border-gray-200 text-gray-600 shadow-none px-4 cursor-not-allowed"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <MahasiswaAutocomplete
                              onSelect={(mahasiswa) => handleMahasiswaAutocompleteSelect(mahasiswa, idx)}
                              placeholder="Cari atau ketik nama mahasiswa..."
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              value={row.prodi}
                              onChange={(e) =>
                                handleMahasiswaChange(idx, "prodi", e.target.value)
                              }
                              placeholder="Prodi otomatis muncul"
                              className="w-full h-10 text-xs rounded-xl bg-gray-50/80 border border-gray-200 text-gray-600 shadow-none px-4 cursor-not-allowed"
                              disabled
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <div className="h-10 w-full flex items-center rounded-xl border border-gray-300 bg-white px-3 text-xs font-medium text-gray-800 shadow-none">
                              {row.peran}
                            </div>
                          </td>
                          <td className="py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeMahasiswaRow(idx)}
                              className="p-1.5 rounded-lg border border-transparent text-gray-300 hover:text-red-500 cursor-pointer transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMahasiswaRow}
                    className="h-10 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-none"
                  >
                    <Plus size={14} />
                    Tambah Mahasiswa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card 5: Upload Dokumen */}
          <Card className="rounded-xl border border-gray-100 bg-white shadow-xs">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-800">
                Upload Dokumen
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* File Proposal */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    File Proposal<span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center justify-between border border-dashed border-gray-300 rounded-xl bg-gray-50/50 p-4 transition-all hover:bg-gray-50">
                    <label
                      htmlFor="proposal-file-input"
                      className="flex items-center gap-3 cursor-pointer flex-1 py-1"
                    >
                      <Upload className="text-gray-400" size={18} />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-600">
                          {formValues.proposal_file?.name ||
                            existingProposalFile.name ? (
                            <span className="text-gray-900 truncate max-w-xs block">
                              {formValues.proposal_file?.name ||
                                existingProposalFile.name}
                            </span>
                          ) : (
                            "Pilih file atau drag & drop"
                          )}
                        </p>
                      </div>
                    </label>
                    <span className="text-xs font-semibold text-gray-400 bg-white border border-gray-200 rounded px-2.5 py-1">
                      PDF
                    </span>
                    <input
                      id="proposal-file-input"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => handleFileChange(e, "proposal_file")}
                      className="hidden"
                    />
                  </div>
                  {existingProposalFile.link && (
                    <div className="mt-1">
                      <a
                        href={existingProposalFile.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Lihat file proposal sebelumnya
                      </a>
                    </div>
                  )}
                  {formMode === "edit" && !existingProposalFile.link && (
                    <p className="text-xs text-gray-400">
                      Belum ada file proposal tersimpan pada data ini.
                    </p>
                  )}
                </div>

                {/* File RAB */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    File RAB<span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center justify-between border border-dashed border-gray-300 rounded-xl bg-gray-50/50 p-4 transition-all hover:bg-gray-50">
                    <label
                      htmlFor="rab-file-input"
                      className="flex items-center gap-3 cursor-pointer flex-1 py-1"
                    >
                      <Upload className="text-gray-400" size={18} />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-600">
                          {formValues.rab_file?.name || existingRabFile.name ? (
                            <span className="text-gray-900 truncate max-w-xs block">
                              {formValues.rab_file?.name ||
                                existingRabFile.name}
                            </span>
                          ) : (
                            "Pilih file atau drag & drop"
                          )}
                        </p>
                      </div>
                    </label>
                    <span className="text-xs font-semibold text-gray-400 bg-white border border-gray-200 rounded px-2.5 py-1">
                      PDF / Excel
                    </span>
                    <input
                      id="rab-file-input"
                      type="file"
                      accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={(e) => handleFileChange(e, "rab_file")}
                      className="hidden"
                    />
                  </div>
                  {existingRabFile.link && (
                    <div className="mt-1">
                      <a
                        href={existingRabFile.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Lihat file RAB sebelumnya
                      </a>
                    </div>
                  )}
                  {formMode === "edit" && !existingRabFile.link && (
                    <p className="text-xs text-gray-400">
                      Belum ada file RAB tersimpan pada data ini.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tombol Aksi di Bagian Bawah */}
          <div className="flex flex-wrap justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={closeForm}
              className="h-10 px-5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-xs font-semibold"
            >
              <X size={15} />
              Batal
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isSubmittingForm}
              onClick={() => void handleSaveProposal(true)}
              className="h-10 px-5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-xs font-semibold"
            >
              <Calendar size={15} />
              Simpan Draft
            </Button>

            <Button
              type="button"
              disabled={isSubmittingForm}
              onClick={() => void handleSaveProposal(false)}
              className="h-10 px-5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center gap-2 cursor-pointer text-xs font-semibold border-0"
            >
              <Send size={15} />
              {isSubmittingForm ? "Memproses..." : "Simpan & Submit"}
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-lg border px-3 md:w-80">
              <Search size={16} className="text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0"
                placeholder="Cari judul proposal..."
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as DosenProposalStatusFilter);
                setPage(1);
              }}
              className="h-8 rounded-lg border border-input px-3 text-sm"
            >
              <option value="ALL">Semua</option>
              <option value="REVIEW">Review</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ADMIN_VERIFIED">Admin Verified</option>
              <option value="APPROVED">Approved</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DRAFT">Draft</option>
              <option value="REVISION">Revision</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <table className="w-full text-sm">
            <thead className="border-b text-left text-gray-400">
              <tr>
                <th className="pb-3">Judul Proposal</th>
                <th>Skema</th>
                <th>Tahun</th>
                <th>Status</th>
                <th className="w-44">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    Memuat proposal...
                  </td>
                </tr>
              )}

              {!loading && paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    Proposal tidak ditemukan.
                  </td>
                </tr>
              )}

              {!loading &&
                paginated.map((proposal) => {
                  const status = normalizeStatus(proposal.status);
                  const canEdit = status === "DRAFT";
                  const canDelete = status === "DRAFT";
                  const canSubmit = status === "DRAFT" || status === "REVISION";
                  const isDraft = status === "DRAFT";
                  const submittedYear = proposal.submitted_at
                    ? new Date(proposal.submitted_at).getFullYear()
                    : new Date(proposal.created_at).getFullYear();

                  return (
                    <tr
                      key={proposal.id}
                      className="border-b last:border-0 transition hover:bg-gray-50"
                    >
                      <td className="py-4">
                        <div className="font-medium text-gray-800">
                          {proposal.title}
                        </div>
                        <div className="text-xs text-gray-400">
                          PROP-{proposal.id}
                        </div>
                      </td>

                      <td className="text-gray-600">
                        {formatSkemaLabel(proposal.skema)}
                      </td>
                      <td className="text-gray-600">{submittedYear}</td>

                      <td>
                        <span
                          className={`rounded px-2 py-1 text-xs ${getStatusClass(proposal.status)}`}
                        >
                          {getStatusLabel(proposal.status)}
                        </span>
                      </td>

                      <td>
                        {isDraft ? (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={
                                !canEdit || isSubmittingAction === proposal.id
                              }
                              onClick={() => void openEditForm(proposal)}
                            >
                              <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={
                                !canSubmit || isSubmittingAction === proposal.id
                              }
                              onClick={() =>
                                void handleSubmitExistingProposal(proposal)
                              }
                            >
                              <Send className="mr-1 h-3.5 w-3.5" /> Submit
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              disabled={
                                !canDelete || isSubmittingAction === proposal.id
                              }
                              onClick={() =>
                                void handleDeleteProposal(proposal)
                              }
                            >
                              <Trash2 className="mr-1 h-3.5 w-3.5" /> Hapus
                            </Button>
                          </div>
                        ) : (
                          <Link
                            to={`/dosen-dashboard/proposals/${proposal.id}`}
                            className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            <FileText className="h-4 w-4" /> Lihat Detail
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          <div className="mt-4 flex items-center justify-end gap-2 text-sm">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Prev
            </Button>

            {Array.from({ length: totalPage }).map((_, idx) => (
              <Button
                key={idx}
                type="button"
                variant={page === idx + 1 ? "default" : "outline"}
                size="sm"
                className={page === idx + 1 ? "bg-red-600 text-white" : ""}
                onClick={() => setPage(idx + 1)}
              >
                {idx + 1}
              </Button>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page === totalPage}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}