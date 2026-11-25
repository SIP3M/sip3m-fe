import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CheckSquare,
  FileText,
  History,
  Lock,
  Square,
  Undo2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import { getProposalById } from "@/features/proposals/proposal.api";
import type { Proposal } from "@/features/proposals/proposal.types";
import {
  claimAdminVerification,
  getAdminVerificationChecklist,
  releaseAdminVerificationClaim,
  revokeAdminVerification,
  submitAdminVerification,
  type AdminChecklistItem,
  type AdminVerificationDecision,
} from "./adminVerification.api";

type Feedback = { type: "success" | "error"; message: string } | null;

const statusLabel: Record<string, string> = {
  SUBMITTED: "Menunggu Verifikasi",
  ADMIN_REVISION: "Revisi Administrasi",
  ADMIN_VERIFIED: "Lolos Administrasi",
  UNDER_REVIEW: "Dalam Review",
  REJECTED: "Ditolak",
};

const statusClass: Record<string, string> = {
  SUBMITTED: "bg-orange-100 text-orange-700",
  ADMIN_REVISION: "bg-red-100 text-red-700",
  ADMIN_VERIFIED: "bg-emerald-100 text-emerald-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  REJECTED: "bg-red-100 text-red-700",
};

const decisionLabel: Record<string, string> = {
  LOLOS: "Lolos Administrasi",
  REVISI: "Minta Revisi",
  TOLAK: "Ditolak",
  TARIK_KEMBALI: "Ditarik Kembali",
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRupiah = (value?: number | null) =>
  typeof value === "number"
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(value)
    : "-";

const getErrorMessage = (err: unknown, fallback: string) =>
  axios.isAxiosError(err)
    ? err.response?.data?.message || err.message || fallback
    : err instanceof Error
      ? err.message
      : fallback;

export default function AdminVerificationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const proposalId = Number(id);

  const user = useAuthStore((state) => state.user);
  const roleName = (user?.roles as unknown as { roles?: string } | undefined)
    ?.roles;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [checklist, setChecklist] = useState<AdminChecklistItem[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [catatan, setCatatan] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const status = proposal?.status ?? "";
  const isQueueStatus = status === "SUBMITTED" || status === "ADMIN_REVISION";
  const isVerified = status === "ADMIN_VERIFIED";
  const claimedByMe = proposal?.admin_verifier_id === user?.id;
  const claimedByOther =
    !!proposal?.admin_verifier_id && proposal.admin_verifier_id !== user?.id;

  const allChecked =
    checklist.length > 0 && checklist.every((item) => checked[item.kode]);
  const checkedCount = checklist.filter((item) => checked[item.kode]).length;

  const loadProposal = async () => {
    const res = await getProposalById(proposalId);
    setProposal(res.data);
    return res.data;
  };

  useEffect(() => {
    if (!Number.isInteger(proposalId) || proposalId <= 0) {
      setFeedback({ type: "error", message: "ID proposal tidak valid." });
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setFeedback(null);
      try {
        const [data, items] = await Promise.all([
          loadProposal(),
          getAdminVerificationChecklist(),
        ]);
        if (cancelled) return;
        setChecklist(items);

        // Klaim otomatis saat halaman dibuka untuk proposal yang masih di
        // antrean dan belum dipegang verifikator lain.
        if (
          (data.status === "SUBMITTED" || data.status === "ADMIN_REVISION") &&
          !data.admin_verifier_id
        ) {
          try {
            await claimAdminVerification(proposalId);
            await loadProposal();
          } catch (claimErr) {
            if (!cancelled) {
              setFeedback({
                type: "error",
                message: getErrorMessage(
                  claimErr,
                  "Proposal ini baru saja diklaim verifikator lain.",
                ),
              });
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setFeedback({
            type: "error",
            message: getErrorMessage(err, "Gagal memuat detail proposal."),
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId]);

  const riwayat = useMemo(
    () => proposal?.adminVerifications ?? [],
    [proposal?.adminVerifications],
  );

  const handleDecision = async (keputusan: AdminVerificationDecision) => {
    if (!proposal) return;

    if (keputusan !== "LOLOS" && !catatan.trim()) {
      setFeedback({
        type: "error",
        message:
          keputusan === "REVISI"
            ? "Catatan wajib diisi saat meminta revisi administrasi."
            : "Alasan wajib diisi saat menolak proposal.",
      });
      return;
    }

    if (keputusan === "LOLOS" && !allChecked) {
      setFeedback({
        type: "error",
        message:
          "Semua item checklist wajib dicentang sebelum menetapkan Lolos Administrasi.",
      });
      return;
    }

    if (
      keputusan === "TOLAK" &&
      !window.confirm(
        "Tolak proposal ini? Pengusul akan menerima notifikasi penolakan beserta alasan Anda.",
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await submitAdminVerification(proposal.id, {
        keputusan,
        catatan: catatan.trim() || undefined,
        checklist: checklist.map((item) => ({
          kode: item.kode,
          checked: Boolean(checked[item.kode]),
        })),
      });

      setFeedback({ type: "success", message: res.message });
      await loadProposal();
      setChecked({});
      setCatatan("");
    } catch (err) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Gagal menyimpan keputusan verifikasi."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRelease = async () => {
    if (!proposal) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await releaseAdminVerificationClaim(proposal.id);
      setFeedback({ type: "success", message: res.message });
      navigate("/reviewer-administrasi-dashboard/antrean");
    } catch (err) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Gagal melepas klaim."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (!proposal) return;
    if (
      !window.confirm(
        "Tarik kembali verifikasi administrasi proposal ini? Proposal akan kembali ke antrean verifikasi.",
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await revokeAdminVerification(
        proposal.id,
        catatan.trim() || undefined,
      );
      setFeedback({ type: "success", message: res.message });
      await loadProposal();
    } catch (err) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Gagal menarik verifikasi."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        Memuat detail verifikasi...
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="space-y-4 p-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600"
        >
          <ArrowLeft size={18} /> Kembali
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {feedback?.message || "Proposal tidak ditemukan."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Verifikasi Administrasi
          </h1>
          <p className="text-sm text-gray-500">
            Pemeriksaan kelengkapan berkas sebelum penugasan reviewer substansi.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {claimedByOther && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Lock size={16} />
          Proposal ini sedang diperiksa oleh{" "}
          <span className="font-semibold">
            {proposal.admin_verifier?.name ?? "verifikator lain"}
          </span>
          . Anda hanya dapat melihat.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Judul Proposal
              </p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusClass[status] ?? "bg-gray-100 text-gray-700"
                }`}
              >
                {statusLabel[status] ?? status}
              </span>
            </div>

            <h2 className="mb-5 text-lg font-bold text-gray-900">
              {proposal.title}
            </h2>

            <div className="grid grid-cols-2 gap-5 border-t border-gray-100 pt-5 text-sm">
              <div>
                <p className="text-xs text-gray-400">Nama Peneliti</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {proposal.user?.name ??
                    `ID Peneliti: ${proposal.lead_researcher_id}`}
                </p>
                {proposal.user?.nidn_nip && (
                  <p className="text-xs text-gray-400">
                    NIDN/NIP {proposal.user.nidn_nip}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400">Fakultas</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {proposal.faculty || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Skema</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {proposal.skema}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Dana Diajukan</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {formatRupiah(proposal.funding_request_amount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Ketua Peneliti</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {proposal.nama_ketua || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Tanggal Submit</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {proposal.submitted_at
                    ? formatDateTime(proposal.submitted_at)
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <FileText size={16} className="text-gray-400" />
              Dokumen Pengajuan
            </h3>

            <div className="flex flex-wrap gap-3">
              {proposal.proposal_file_path ? (
                <a
                  href={proposal.proposal_file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Buka Dokumen Proposal
                </a>
              ) : (
                <span className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  Dokumen proposal belum diunggah
                </span>
              )}

              {proposal.rab_file_path ? (
                <a
                  href={proposal.rab_file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Buka RAB
                </a>
              ) : (
                <span className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  RAB belum diunggah
                </span>
              )}
            </div>

            <dl className="mt-5 space-y-4 border-t border-gray-100 pt-5 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Abstrak</dt>
                <dd className="mt-1 whitespace-pre-line text-gray-700">
                  {proposal.abstrak || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Tujuan Penelitian</dt>
                <dd className="mt-1 whitespace-pre-line text-gray-700">
                  {proposal.tujuan_penelitian || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Metode Penelitian</dt>
                <dd className="mt-1 whitespace-pre-line text-gray-700">
                  {proposal.metode_penelitian || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">
                  Sumber &amp; Detail Data Penelitian
                </dt>
                <dd className="mt-1 whitespace-pre-line text-gray-700">
                  {proposal.sumber_data_penelitian || "-"}
                  {proposal.detail_sumber_penelitian
                    ? ` — ${proposal.detail_sumber_penelitian}`
                    : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Anggota Tim</dt>
                <dd className="mt-1 whitespace-pre-line text-gray-700">
                  {proposal.dosen_terlibat || "-"}
                  {proposal.nama_anggota ? ` | ${proposal.nama_anggota}` : ""}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <CheckSquare size={16} className="text-gray-400" />
              Checklist Kelengkapan Dokumen
            </h3>
            <p className="mb-4 text-xs text-gray-400">
              {checkedCount}/{checklist.length} item dicentang · seluruh item
              wajib lengkap untuk Lolos Administrasi.
            </p>

            {checklist.length === 0 ? (
              <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Master checklist belum diatur. Minta Admin LPPM menambahkan opsi
                pada Master Referensi → jenis CHECKLIST_ADMINISTRASI.
              </div>
            ) : (
              <div className="space-y-2">
                {checklist.map((item) => {
                  const isChecked = Boolean(checked[item.kode]);
                  const disabled = !isQueueStatus || claimedByOther;
                  return (
                    <button
                      key={item.kode}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        setChecked((prev) => ({
                          ...prev,
                          [item.kode]: !prev[item.kode],
                        }))
                      }
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${
                        isChecked
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                    >
                      {isChecked ? (
                        <CheckSquare
                          size={18}
                          className="flex-shrink-0 text-emerald-600"
                        />
                      ) : (
                        <Square
                          size={18}
                          className="flex-shrink-0 text-gray-300"
                        />
                      )}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-gray-900">
              Catatan Verifikasi
            </p>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={5}
              disabled={!isQueueStatus || claimedByOther}
              placeholder="Tuliskan berkas yang perlu diperbaiki atau alasan penolakan..."
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:bg-gray-50"
            />
          </div>

          {isQueueStatus && !claimedByOther && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => void handleDecision("LOLOS")}
                disabled={!allChecked || isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Lolos Administrasi
              </button>

              <button
                type="button"
                onClick={() => void handleDecision("REVISI")}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-60"
              >
                Minta Revisi
              </button>

              <button
                type="button"
                onClick={() => void handleDecision("TOLAK")}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                Tolak Proposal
              </button>

              {claimedByMe && (
                <button
                  type="button"
                  onClick={() => void handleRelease()}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 py-2 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-60"
                >
                  <Undo2 size={14} /> Lepas klaim verifikasi
                </button>
              )}
            </div>
          )}

          {isVerified && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
              Proposal sudah lolos verifikasi administrasi dan dapat di-plotting
              ke reviewer substansi oleh Staff LPPM.
            </div>
          )}

          {isVerified && roleName === "KETUA_LPPM" && (
            <button
              type="button"
              onClick={() => void handleRevoke()}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Tarik Kembali Verifikasi
            </button>
          )}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <History size={16} className="text-gray-400" />
              Riwayat Verifikasi
            </p>

            {riwayat.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada keputusan.</p>
            ) : (
              <ul className="space-y-3">
                {riwayat.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-gray-800">
                        {decisionLabel[row.decision] ?? row.decision}
                      </span>
                      <span className="text-gray-400">
                        {formatDateTime(row.created_at)}
                      </span>
                    </div>
                    <p className="mt-1">{row.verifier.name}</p>
                    {row.catatan && (
                      <p className="mt-1 text-red-600">{row.catatan}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
