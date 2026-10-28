import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  FileText,
  Loader2,
  Target,
  XCircle,
} from "lucide-react";
import axios from "axios";
import {
  getMonitoringProjectById,
  updatePengabdianProjectStatus,
  verifyPengabdianDocument,
} from "./project.api";
import { MonitoringDocument, MonitoringProjectDetail } from "./project.types";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth.store";
import { APP_ROLES } from "@/constant/roles";

const getStatusClassName = (status: string) => {
  const key = status
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (key === "ON_TRACK") return "bg-green-100 text-green-600";
  if (key === "DELAYED") return "bg-red-100 text-red-600";
  if (key === "COMPLETED") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
};

const getDocStatusClassName = (status: string) => {
  const key = status.trim().toUpperCase();

  if (key === "APPROVED") return "bg-green-100 text-green-700";
  if (key === "REJECTED") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
};

const formatDate = (value: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Contoh: 01 Sep 2023
const formatShortDate = (value: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Contoh: 2026-09-10 (jika format di luar ISO, jatuh ke format tanggal biasa)
const formatMilestoneDate = (value: string | null) => {
  if (!value) return "-";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return formatDate(value);
};

const formatCurrencyIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const toFileUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  return `https://sip3m-be.vercel.app/${path.replace(/^\/+/, "")}`;
};

/**
 * URL dokumen untuk tombol "Lihat".
 * - Utama: `public_url` (URL publik Supabase Storage) dari backend.
 * - Fallback: `file_path` (kompatibel dengan backend yang belum deploy).
 */
const toDocumentUrl = (
  doc: Pick<MonitoringDocument, "file_path" | "public_url">,
) => doc.public_url || toFileUrl(doc.file_path);

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const projectId = Number(id);
  const user = useAuthStore((state) => state.user);
  const isAdminOrStaff =
    user?.roles?.roles === APP_ROLES.ADMIN_LPPM ||
    user?.roles?.roles === APP_ROLES.STAFF_LPPM;

  const [project, setProject] = useState<MonitoringProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isVerifyingDocId, setIsVerifyingDocId] = useState<number | null>(null);
  const [rejectDocId, setRejectDocId] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await getMonitoringProjectById(projectId);
      setProject(res.data);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ||
          err.message ||
          "Gagal memuat detail monitoring proyek."
        : err instanceof Error
          ? err.message
          : "Gagal memuat detail monitoring proyek.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!Number.isInteger(projectId) || projectId <= 0) {
      setError("ID proyek tidak valid.");
      setIsLoading(false);
      return;
    }

    void loadDetail();
  }, [projectId, loadDetail]);

  const normalizedStatus = useMemo(
    () =>
      project?.status
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_") || "",
    [project?.status],
  );

  const isPendingStatus =
    normalizedStatus === "PENDING" ||
    normalizedStatus === "MENUNGGU_PERSETUJUAN";

  const handleStartProject = async () => {
    if (!project || !isAdminOrStaff) return;

    setIsStarting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await updatePengabdianProjectStatus(project.id, {
        status: "SEDANG_BERJALAN",
      });

      setSuccessMessage(response.message || "Proyek berhasil dimulai.");
      setIsStartModalOpen(false);
      await loadDetail();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message || "Gagal memulai proyek."
        : err instanceof Error
          ? err.message
          : "Gagal memulai proyek.";

      setError(message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleVerifyDocument = async (
    documentId: number,
    status: "APPROVED" | "REJECTED",
    notes?: string,
  ) => {
    if (!isAdminOrStaff) return;

    setIsVerifyingDocId(documentId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await verifyPengabdianDocument(documentId, {
        status,
        notes: notes?.trim() || undefined,
      });

      setSuccessMessage(response.message || "Dokumen berhasil diverifikasi.");
      await loadDetail();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ||
          err.message ||
          "Gagal memverifikasi dokumen."
        : err instanceof Error
          ? err.message
          : "Gagal memverifikasi dokumen.";

      setError(message);
    } finally {
      setIsVerifyingDocId(null);
    }
  };

  const openRejectModal = (documentId: number) => {
    setRejectDocId(documentId);
    setRejectNotes("");
  };

  // Milestone diurutkan berdasarkan urutan; milestone aktif = yang pertama belum COMPLETED
  const sortedMilestones = useMemo(
    () => [...(project?.milestones ?? [])].sort((a, b) => a.sequence - b.sequence),
    [project?.milestones],
  );

  const activeMilestoneId = useMemo(
    () => sortedMilestones.find((m) => m.status !== "COMPLETED")?.id ?? null,
    [sortedMilestones],
  );

  if (isLoading) {
    return (
      <div className="space-y-4 p-8">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4 p-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Detail proyek tidak ditemukan."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* HEADER */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {project.title}
            </h1>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${getStatusClassName(project.calculated_status)}`}
            >
              {project.calculated_status.replace(/_/g, " ")}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Kode Proyek: {project.project_code} &bull; Dimulai{" "}
            {formatShortDate(project.start_date)}
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-3">
        {/* KIRI */}
        <div className="space-y-6 lg:col-span-2">
          {/* MILESTONE */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {sortedMilestones.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-500">
                Belum ada milestone.
              </p>
            )}

            <div className="space-y-6">
              {sortedMilestones.map((milestone) => {
                const isCompleted = milestone.status === "COMPLETED";
                const isActive = milestone.id === activeMilestoneId;

                return (
                  <div key={milestone.id} className="flex items-start gap-4">
                    {/* ikon status */}
                    <div className="mt-0.5 shrink-0">
                      {isCompleted && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-green-500">
                          <Check
                            size={12}
                            strokeWidth={3}
                            className="text-green-500"
                          />
                        </div>
                      )}
                      {isActive && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-blue-500">
                          <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        </div>
                      )}
                      {!isCompleted && !isActive && (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-200" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p
                          className={`text-sm ${
                            isActive
                              ? "font-bold text-blue-700"
                              : isCompleted
                                ? "font-medium text-gray-900"
                                : "font-medium text-gray-500"
                          }`}
                        >
                          {milestone.title}
                        </p>
                        <span className="shrink-0 text-xs text-gray-400">
                          {formatMilestoneDate(milestone.due_date)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3">
                        <span className="flex items-center gap-2 text-xs text-gray-500">
                          <Target size={14} className="text-gray-400" />
                          Target progres {milestone.target_percentage}%
                        </span>

                        {isCompleted && (
                          <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                            Terverifikasi
                          </span>
                        )}
                        {isActive && (
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            Menunggu Upload
                          </span>
                        )}
                        {!isCompleted && !isActive && (
                          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
                            Terkunci
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INFO PENELITI */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-400">Ketua Peneliti</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {project.user?.name || "-"}
                </p>
              </div>

              {/* UI placeholder: belum ada field anggota & luaran di data proyek */}
              <div>
                <p className="text-xs text-gray-400">Anggota Peneliti</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">-</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Luaran Wajib</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">-</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Luaran Tambahan</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">-</p>
              </div>
            </div>
          </div>

          {/* DOKUMEN (daftar terpisah, verifikasi tetap berfungsi) */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-gray-900">Dokumen</h2>

            {project.documents.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-500">
                Belum ada dokumen.
              </p>
            )}

            <div className="space-y-2">
              {project.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText size={16} className="shrink-0 text-gray-400" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {doc.document_type} &bull;{" "}
                        {(doc.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getDocStatusClassName(doc.verification_status)}`}
                    >
                      {doc.verification_status}
                    </span>

                    <a
                      href={toDocumentUrl(doc)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Lihat
                    </a>

                    {isAdminOrStaff && doc.verification_status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            void handleVerifyDocument(doc.id, "APPROVED")
                          }
                          disabled={isVerifyingDocId === doc.id}
                          className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {isVerifyingDocId === doc.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={12} />
                          )}
                          Setujui
                        </button>

                        <button
                          type="button"
                          onClick={() => openRejectModal(doc.id)}
                          disabled={isVerifyingDocId === doc.id}
                          className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircle size={12} />
                          Tolak
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KANAN */}
        <div className="space-y-4">
          {/* DANA TEREALISASI */}
          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-green-400" />
              <h2 className="text-sm font-bold">Dana Terealisasi</h2>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Total yang telah direalisasikan
            </p>
            <p className="mt-1 text-3xl font-bold">
              {formatCurrencyIDR(project.realized_amount)}
            </p>

            <p className="mt-4 text-xs text-slate-400">Status pencairan:</p>
            <p className="mt-0.5 text-xs text-white">
              {project.disbursement_status}
            </p>
          </div>

          {/* AKSI — UI placeholder, belum terhubung ke fungsi apa pun */}
          <div className="space-y-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <FileText size={15} className="text-gray-500" />
              Download Kontrak
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <ExternalLink size={15} className="text-gray-500" />
              Lihat di Repository
            </button>
          </div>
        </div>
      </div>

      {isAdminOrStaff && isPendingStatus && (
        <div className="flex justify-end">
          <Button
            type="button"
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => setIsStartModalOpen(true)}
          >
            Setujui & Mulai Proyek
          </Button>
        </div>
      )}

      {isAdminOrStaff && isStartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800">
              Mulai Proyek
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Apakah Anda yakin ingin memulai proyek ini? Pastikan kontrak fisik
              telah ditandatangani.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isStarting) return;
                  setIsStartModalOpen(false);
                }}
              >
                Batal
              </Button>

              <Button
                type="button"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => void handleStartProject()}
                disabled={isStarting}
              >
                {isStarting ? "Memproses..." : "Ya, Mulai Proyek"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isAdminOrStaff && rejectDocId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800">
              Tolak Dokumen
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Tambahkan catatan penolakan agar pengunggah dapat memperbaiki.
            </p>

            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Tulis catatan penolakan (opsional)..."
              className="mt-4 h-28 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-red-400"
            />

            <div className="mt-5 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectDocId(null)}
              >
                Batal
              </Button>

              <Button
                type="button"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  if (rejectDocId === null) return;
                  void handleVerifyDocument(
                    rejectDocId,
                    "REJECTED",
                    rejectNotes,
                  );
                  setRejectDocId(null);
                  setRejectNotes("");
                }}
                disabled={rejectDocId === null}
              >
                Tolak Dokumen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}