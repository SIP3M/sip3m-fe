import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { editProposalApi, getProposalById } from "./proposal.api";
import { SUMBER_PENDANAAN_OPTIONS, type SumberPendanaan } from "./proposal.types";
import axios from "axios";
import { normalizeNama, normalizeNidn, splitList } from "@/utils/proposal";

type SumberPendanaanValue = SumberPendanaan | "Pilih";

export default function EditProposalDosen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const proposalId = Number(id);
  const location = useLocation();

  // Mengambil data awal proposal yang dikirim dari halaman detail sebelumnya
  const existingProposal = location.state?.proposal as
    | {
        title?: string;
        faculty?: string;
        skema?: string;
        funding_request_amount?: number | string;
        sumber_data_penelitian?: string | null;
        sumber_pendanaan?: SumberPendanaan | string | null;
        nama_ketua?: string | null;
        nidn_ketua?: string | null;
        instansi?: string | null;
      }
    | undefined;

  const resolveInitialSumberPendanaan = (): SumberPendanaanValue => {
    const raw = (existingProposal?.sumber_pendanaan as string | null) ?? null;
    if (raw && (SUMBER_PENDANAAN_OPTIONS as string[]).includes(raw)) {
      return raw as SumberPendanaanValue;
    }
    return "Pilih";
  };

  // State Form — Opsi B: ketua dari Peran, tetap butuh field terpisah untuk submit
  const [title, setTitle] = useState(existingProposal?.title || "");
  const [faculty, setFaculty] = useState(existingProposal?.faculty || "");
  const [skema, setSkema] = useState(existingProposal?.skema || "");
  const [amount, setAmount] = useState(existingProposal?.funding_request_amount || "");
  const [sumberData, setSumberData] = useState(existingProposal?.sumber_data_penelitian || "");
  const [sumberPendanaan, setSumberPendanaan] = useState<SumberPendanaanValue>(
    resolveInitialSumberPendanaan(),
  );
  const [namaKetua, setNamaKetua] = useState(existingProposal?.nama_ketua || "");
  const [nidnKetua, setNidnKetua] = useState(existingProposal?.nidn_ketua || "");
  const [instansi, setInstansi] = useState(existingProposal?.instansi || "");
  // Simpan list dosen existing untuk validasi ketua vs anggota (BE f0be231)
  const [existingDosenTerlibat, setExistingDosenTerlibat] = useState(
    (existingProposal as { dosen_terlibat?: string | null })?.dosen_terlibat || "",
  );
  const [existingNidnTerlibat, setExistingNidnTerlibat] = useState(
    (existingProposal as { nidn_dosen_terlibat?: string | null })?.nidn_dosen_terlibat || "",
  );

  // State File Upload
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [rabFile, setRabFile] = useState<File | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(!existingProposal?.title);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const setFieldErrorsFromBe = (errors: Record<string, string[] | string>) => {
    const mapped: Record<string, string> = {};
    for (const [k, v] of Object.entries(errors)) {
      const msg = Array.isArray(v) ? v[0] : String(v);
      const key =
        k === "dosen_terlibat" ? "dosen_terlibat" :
        k === "nidn_dosen_terlibat" ? "nidn_dosen_terlibat" :
        k === "nama_anggota" ? "nama_anggota" :
        k === "nim_anggota" ? "nim_anggota" :
        k === "nama_ketua" ? "nama_ketua" :
        k === "nidn_ketua" ? "nidn_ketua" :
        k === "sumber_pendanaan" ? "sumber_pendanaan" : k;
      mapped[key] = msg;
    }
    setFieldErrors(mapped);
  };

  // Pre-fill dari GET /proposals/:id jika navigate tanpa state (refresh / direct link)
  useEffect(() => {
    if (existingProposal?.title) return;
    if (!Number.isInteger(proposalId) || proposalId <= 0) {
      setIsLoadingDetail(false);
      return;
    }

    let cancelled = false;

    const fetchDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const res = await getProposalById(proposalId);
        if (cancelled) return;
        const p = res.data;
        setTitle(p.title || "");
        setFaculty(p.faculty || "");
        setSkema(p.skema || "");
        setAmount(String(p.funding_request_amount ?? ""));
        setSumberData(p.sumber_data_penelitian || "");
        const raw = (p.sumber_pendanaan as string | null) ?? null;
        if (raw && (SUMBER_PENDANAAN_OPTIONS as string[]).includes(raw)) {
          setSumberPendanaan(raw as SumberPendanaanValue);
        } else {
          setSumberPendanaan("Pilih");
        }
        setNamaKetua((p as { nama_ketua?: string | null }).nama_ketua || "");
        setNidnKetua((p as { nidn_ketua?: string | null }).nidn_ketua || "");
        setInstansi(p.instansi || "");
        setExistingDosenTerlibat((p as { dosen_terlibat?: string | null }).dosen_terlibat || "");
        setExistingNidnTerlibat((p as { nidn_dosen_terlibat?: string | null }).nidn_dosen_terlibat || "");
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setErrorMsg(err.response?.data?.message || "Gagal memuat detail proposal.");
        }
      } finally {
        if (!cancelled) setIsLoadingDetail(false);
      }
    };

    void fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [existingProposal?.title, proposalId]);

  // Live client guard untuk Edit (ketua vs anggota existing) — BE f0be231
  const editKetuaNamaDup = (() => {
    const t = namaKetua.trim();
    if (!t) return null;
    const list = splitList(existingDosenTerlibat).map(normalizeNama);
    if (list.includes(normalizeNama(t))) return `Ketua peneliti "${t}" sudah ada di daftar anggota dosen. Tidak boleh double.`;
    return null;
  })();
  const editKetuaNidnDup = (() => {
    const t = nidnKetua.trim();
    if (!t) return null;
    const list = splitList(existingNidnTerlibat).map(normalizeNidn);
    if (list.includes(normalizeNidn(t))) return `NIDN ketua "${t}" sudah ada di daftar anggota.`;
    return null;
  })();
  const hasEditDup = Boolean(editKetuaNamaDup || editKetuaNidnDup);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    // Client-side anti-double sebelum fetch (BE f0be231)
    const ketuaNamaTrimGuard = namaKetua.trim();
    const ketuaNidnTrimGuard = nidnKetua.trim();
    if (ketuaNamaTrimGuard) {
      const dup = splitList(existingDosenTerlibat).map(normalizeNama).includes(normalizeNama(ketuaNamaTrimGuard));
      if (dup) {
        const msg = `Ketua peneliti "${ketuaNamaTrimGuard}" sudah ada di daftar anggota dosen. Tidak boleh double.`;
        setFieldErrors({ nama_ketua: msg });
        setErrorMsg(msg);
        return;
      }
    }
    if (ketuaNidnTrimGuard) {
      const dup = splitList(existingNidnTerlibat).map(normalizeNidn).includes(normalizeNidn(ketuaNidnTrimGuard));
      if (dup) {
        const msg = `NIDN ketua "${ketuaNidnTrimGuard}" sudah ada di daftar anggota.`;
        setFieldErrors({ nidn_ketua: msg });
        setErrorMsg(msg);
        return;
      }
    }

    setIsSaving(true);
    setErrorMsg("");

    // Gunakan FormData karena kita akan mengunggah file binary
    const formData = new FormData();
    formData.append("title", title);
    formData.append("faculty", faculty);
    formData.append("skema", skema);
    formData.append("funding_request_amount", String(amount));
    formData.append("sumber_data_penelitian", sumberData);
    // Field sumber_pendanaan: omit jika placeholder "Pilih", jangan kirim ""
    if (sumberPendanaan !== "Pilih") {
      formData.append("sumber_pendanaan", sumberPendanaan);
    }
    // Opsi B: ketua eksplisit — omit jika kosong (BE -> null), jangan kirim ""
    const ketuaNamaTrim = namaKetua.trim();
    const ketuaNidnTrim = nidnKetua.trim();
    if (ketuaNamaTrim) formData.append("nama_ketua", ketuaNamaTrim);
    if (ketuaNidnTrim) formData.append("nidn_ketua", ketuaNidnTrim);
    formData.append("instansi", instansi);
    formData.append("is_draft", "true"); // Tetap REVISION/DRAFT, nanti dosen submit ulangnya di halaman detail

    if (proposalFile) formData.append("proposal_file", proposalFile);
    if (rabFile) formData.append("rab_file", rabFile);

    try {
      await editProposalApi(proposalId, formData);
      alert("Perubahan proposal berhasil disimpan!");
      navigate(`/dosen-dashboard/proposals/${proposalId}`); // Balik ke halaman detail
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as
          | { message?: string; errors?: Record<string, string[] | string> }
          | undefined;
        if (data?.errors && typeof data.errors === "object") {
          setFieldErrorsFromBe(data.errors as Record<string, string[] | string>);
          const first = Object.values(data.errors)[0];
          const msg = Array.isArray(first) ? first[0] : String(first);
          setErrorMsg(msg || data.message || "Gagal menyimpan perubahan.");
          return;
        }
        setErrorMsg(data?.message || "Gagal menyimpan perubahan.");
      } else {
        setErrorMsg("Terjadi kesalahan.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingDetail) {
    return (
      <div className="space-y-6 p-8 max-w-3xl">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 max-w-3xl">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Edit & Perbaiki Proposal</h1>
        <p className="text-sm text-gray-500">Silakan perbarui data atau unggah file revisi yang diminta oleh Reviewer.</p>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700">Judul Proposal</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fakultas</label>
            <input
              type="text"
              required
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Skema Penelitian</label>
            <select
              required
              value={skema}
              onChange={(e) => setSkema(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none bg-white"
            >
              <option value="">Pilih</option>
              <option value="PENELITIAN_PENGEMBANGAN">Penelitian Pengembangan</option>
              <option value="PENELITIAN_TERAPAN">Penelitian Terapan</option>
              <option value="PENELITIAN_KOLABORASI">Penelitian Kolaborasi</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sumber Pendanaan</label>
            <select
              value={sumberPendanaan}
              onChange={(e) => setSumberPendanaan(e.target.value as SumberPendanaanValue)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none bg-white"
            >
              <option value="Pilih">Pilih</option>
              {SUMBER_PENDANAAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">Jika null (proposal lama) akan tampil &quot;Pilih&quot; / &quot;-&quot; di detail.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Dana Anggaran (IDR)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Ketua Peneliti</label>
            <input
              type="text"
              value={namaKetua}
              onChange={(e) => { setNamaKetua(e.target.value); if (fieldErrors.nama_ketua) setFieldErrors((p) => { const n = { ...p }; delete n.nama_ketua; return n; }); }}
              placeholder="Opsi B: isi sesuai baris Peran = Ketua Peneliti di form utama"
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none ${fieldErrors.nama_ketua || editKetuaNamaDup ? "border-red-300 focus:border-red-500 bg-red-50/40" : "border-gray-300 focus:border-red-500"}`}
            />
            {(fieldErrors.nama_ketua || editKetuaNamaDup) && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.nama_ketua || editKetuaNamaDup}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">Omit jika kosong — fallback ke peng-upload di Tugas Review.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">NIDN Ketua</label>
            <input
              type="text"
              value={nidnKetua}
              onChange={(e) => { setNidnKetua(e.target.value); if (fieldErrors.nidn_ketua) setFieldErrors((p) => { const n = { ...p }; delete n.nidn_ketua; return n; }); }}
              placeholder="NIDN ketua (opsional)"
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none ${fieldErrors.nidn_ketua || editKetuaNidnDup ? "border-red-300 focus:border-red-500 bg-red-50/40" : "border-gray-300 focus:border-red-500"}`}
            />
            {(fieldErrors.nidn_ketua || editKetuaNidnDup) && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.nidn_ketua || editKetuaNidnDup}</p>
            )}
          </div>
        </div>
        {/* Inline 400 mapping for other fields (render verbatim) */}
        {(fieldErrors.dosen_terlibat || fieldErrors.nidn_dosen_terlibat || fieldErrors.nama_anggota || fieldErrors.nim_anggota || fieldErrors.sumber_pendanaan) && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 space-y-1">
            {fieldErrors.dosen_terlibat && <p>{fieldErrors.dosen_terlibat}</p>}
            {fieldErrors.nidn_dosen_terlibat && <p>{fieldErrors.nidn_dosen_terlibat}</p>}
            {fieldErrors.nama_anggota && <p>{fieldErrors.nama_anggota}</p>}
            {fieldErrors.nim_anggota && <p>{fieldErrors.nim_anggota}</p>}
            {fieldErrors.sumber_pendanaan && <p>{fieldErrors.sumber_pendanaan}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Sumber Data Penelitian</label>
          <input
            type="text"
            value={sumberData}
            onChange={(e) => setSumberData(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-400">Field ini berbeda dari Sumber Pendanaan — jangan tertukar.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Instansi</label>
          <input
            type="text"
            value={instansi}
            onChange={(e) => setInstansi(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none"
          />
        </div>

        <hr className="my-4 border-gray-100" />

        {/* Upload Bagian File */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">File Proposal Baru (PDF) </label>
            <div className="mt-1 flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Upload size={14} />
                <span>Pilih File</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setProposalFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-gray-500 truncate max-w-xs">
                {proposalFile ? proposalFile.name : "Belum ada file baru dipilih"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">File RAB Baru (PDF/Excel) </label>
            <div className="mt-1 flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Upload size={14} />
                <span>Pilih File</span>
                <input
                  type="file"
                  accept=".pdf,.xls,.xlsx"
                  onChange={(e) => setRabFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-gray-500 truncate max-w-xs">
                {rabFile ? rabFile.name : "Belum ada file baru dipilih"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          {hasEditDup && (
            <p className="text-xs text-red-600">Perbaiki duplikasi ketua vs anggota sebelum menyimpan.</p>
          )}
          <button
            type="submit"
            disabled={isSaving || hasEditDup}
            title={hasEditDup ? (editKetuaNamaDup || editKetuaNidnDup || "") : undefined}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
