import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Send, Trash2 } from "lucide-react";
import axios from "axios";
import {
  createProposal,
  deleteProposal,
  getMyProposals,
  submitProposal,
  updateProposal,
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
import { Card, CardContent } from "@/components/ui/card";

const PAGE_SIZE = 5;

const defaultFormValues: ProposalFormValues = {
  title: "",
  faculty: "",
  skema: "",
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

  const openCreateForm = () => {
    resetForm();
    setFeedback(null);
    setError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (proposal: Proposal) => {
    setError(null);
    setFeedback(null);

    setFormMode("edit");
    setEditingProposalId(proposal.id);
    setFormValues({
      title: proposal.title,
      faculty: proposal.faculty || "",
      skema: proposal.skema || "",
      funding_request_amount: String(proposal.funding_request_amount || ""),
      proposal_file: null,
      rab_file: null,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: "proposal_file" | "rab_file",
  ) => {
    const file = e.target.files?.[0] || null;
    setFormValues((prev) => ({ ...prev, [field]: file }));
  };

  const buildPayload = (isDraft: boolean) => {
    const payload = {
      title: formValues.title.trim(),
      faculty: formValues.faculty.trim() || undefined,
      skema: formValues.skema.trim() || undefined,
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
          className="bg-red-600 text-white hover:bg-red-700"
          onClick={openCreateForm}
        >
          <Plus className="mr-2 h-4 w-4" /> Buat Proposal Baru
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
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-base font-semibold text-gray-800">
              {formMode === "create" ? "Buat Proposal" : "Edit Proposal"}
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm text-gray-600">Judul Proposal*</label>
                <Input
                  name="title"
                  value={formValues.title}
                  onChange={handleInputChange}
                  placeholder="Masukkan judul proposal"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-600">Fakultas</label>
                <Input
                  name="faculty"
                  value={formValues.faculty}
                  onChange={handleInputChange}
                  placeholder="Contoh: Teknik"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-600">Skema</label>
                <Input
                  name="skema"
                  value={formValues.skema}
                  onChange={handleInputChange}
                  placeholder="Contoh: Penelitian Dasar"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-600">Permintaan Dana</label>
                <Input
                  name="funding_request_amount"
                  value={formValues.funding_request_amount}
                  onChange={handleInputChange}
                  placeholder="Contoh: 15000000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-600">File Proposal</label>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <label
                      htmlFor="proposal-file-input"
                      className="cursor-pointer border-r border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Browse
                    </label>
                    <p className="min-w-0 flex-1 px-3 py-2 text-sm text-gray-500">
                      <span className="block truncate">
                        {formValues.proposal_file?.name ||
                          existingProposalFile.name ||
                          "No file selected"}
                      </span>
                    </p>
                  </div>
                  <input
                    id="proposal-file-input"
                    type="file"
                    onChange={(e) => handleFileChange(e, "proposal_file")}
                    className="hidden"
                  />
                </div>
                {existingProposalFile.link && (
                  <a
                    href={existingProposalFile.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Lihat file proposal sebelumnya
                  </a>
                )}
                {formMode === "edit" && !existingProposalFile.link && (
                  <p className="text-xs text-gray-500">
                    Belum ada file proposal tersimpan pada data ini.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-600">File RAB</label>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <label
                      htmlFor="rab-file-input"
                      className="cursor-pointer border-r border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Browse
                    </label>
                    <p className="min-w-0 flex-1 px-3 py-2 text-sm text-gray-500">
                      <span className="block truncate">
                        {formValues.rab_file?.name ||
                          existingRabFile.name ||
                          "No file selected"}
                      </span>
                    </p>
                  </div>
                  <input
                    id="rab-file-input"
                    type="file"
                    onChange={(e) => handleFileChange(e, "rab_file")}
                    className="hidden"
                  />
                </div>
                {existingRabFile.link && (
                  <a
                    href={existingRabFile.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Lihat file RAB sebelumnya
                  </a>
                )}
                {formMode === "edit" && !existingRabFile.link && (
                  <p className="text-xs text-gray-500">
                    Belum ada file RAB tersimpan pada data ini.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeForm}>
                Batal
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isSubmittingForm}
                onClick={() => void handleSaveProposal(true)}
              >
                Simpan Draf
              </Button>

              <Button
                type="button"
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={isSubmittingForm}
                onClick={() => void handleSaveProposal(false)}
              >
                {isSubmittingForm ? "Memproses..." : "Simpan & Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>
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

                      <td className="text-gray-600">{proposal.skema || "-"}</td>
                      <td className="text-gray-600">{submittedYear}</td>

                      <td>
                        <span
                          className={`rounded px-2 py-1 text-xs ${getStatusClass(proposal.status)}`}
                        >
                          {getStatusLabel(proposal.status)}
                        </span>
                      </td>

                      <td>
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
                            onClick={() => void handleDeleteProposal(proposal)}
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" /> Hapus
                          </Button>
                        </div>
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
