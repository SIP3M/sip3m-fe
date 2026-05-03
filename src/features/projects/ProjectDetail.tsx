import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  CheckCircle2,
  XCircle,
  Loader2,
  UserRound,
} from "lucide-react";
import axios from "axios";
import {
  getMonitoringProjectById,
  updatePengabdianProjectStatus,
  verifyPengabdianDocument,
} from "./project.api";
import { MonitoringProjectDetail } from "./project.types";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const progress = useMemo(
    () => Math.max(0, Math.min(100, project?.progress_percentage || 0)),
    [project?.progress_percentage],
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          <h1 className="text-3xl font-semibold text-gray-800">
            {project.title}
          </h1>
          <p className="text-sm text-gray-500">
            Kode Proyek: {project.project_code}
          </p>
        </div>

        <span
          className={`inline-flex rounded-full px-4 py-1.5 text-sm font-medium ${getStatusClassName(project.calculated_status)}`}
        >
          {project.calculated_status}
        </span>
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

      {project.summary && (
        <Card className="bg-white shadow-sm ring-gray-200/70">
          <CardContent className="p-6 text-sm text-gray-700">
            {project.summary}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white shadow-sm ring-gray-200/70">
          <CardContent className="space-y-2 p-5">
            <div className="flex items-center gap-2 text-gray-500">
              <UserRound className="h-4 w-4" /> Peneliti
            </div>
            <p className="font-medium text-gray-800">
              {project.user?.name || "-"}
            </p>
            <p className="text-xs text-gray-500">
              NIDN/NIP: {project.user?.nidn_nip || "-"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm ring-gray-200/70">
          <CardContent className="space-y-2 p-5">
            <div className="flex items-center gap-2 text-gray-500">
              <CalendarDays className="h-4 w-4" /> Periode
            </div>
            <p className="text-sm text-gray-800">
              {formatDate(project.start_date)}
            </p>
            <p className="text-xs text-gray-500">
              s/d {formatDate(project.end_date)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm ring-gray-200/70">
          <CardContent className="space-y-2 p-5">
            <div className="flex items-center gap-2 text-gray-500">
              <CircleDollarSign className="h-4 w-4" /> Dana Terealisasi
            </div>
            <p className="font-medium text-gray-800">
              {formatCurrencyIDR(project.realized_amount)}
            </p>
            <p className="text-xs text-gray-500">
              Status pencairan: {project.disbursement_status}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm ring-gray-200/70">
          <CardContent className="space-y-2 p-5">
            <p className="text-sm text-gray-500">Progress Proyek</p>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full ${progress >= 50 ? "bg-green-500" : "bg-red-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm font-medium text-gray-700">{progress}%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm ring-gray-200/70">
        <CardHeader>
          <CardTitle>Milestone</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-6 py-3">Urutan</th>
                <th className="px-6 py-3">Judul</th>
                <th className="px-6 py-3">Target</th>
                <th className="px-6 py-3">Deadline</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {project.milestones.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    Belum ada milestone.
                  </td>
                </tr>
              )}

              {project.milestones.map((milestone) => (
                <tr key={milestone.id} className="border-t">
                  <td className="px-6 py-3">{milestone.sequence}</td>
                  <td className="px-6 py-3">{milestone.title}</td>
                  <td className="px-6 py-3">{milestone.target_percentage}%</td>
                  <td className="px-6 py-3">
                    {formatDate(milestone.due_date)}
                  </td>
                  <td className="px-6 py-3">{milestone.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm ring-gray-200/70">
        <CardHeader>
          <CardTitle>Dokumen</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-6 py-3">Dokumen</th>
                <th className="px-6 py-3">Tipe</th>
                <th className="px-6 py-3">Ukuran</th>
                <th className="px-6 py-3">Verifikasi</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {project.documents.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    Belum ada dokumen.
                  </td>
                </tr>
              )}

              {project.documents.map((doc) => (
                <tr key={doc.id} className="border-t">
                  <td className="px-6 py-3 font-medium text-gray-700">
                    {doc.title}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {doc.document_type}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {(doc.file_size / 1024).toFixed(1)} KB
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {doc.verification_status}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={toFileUrl(doc.file_path)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        Lihat
                      </a>

                      {isAdminOrStaff &&
                        doc.verification_status === "PENDING" && (
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

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
