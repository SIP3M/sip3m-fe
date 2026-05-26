import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getProposalById, updateProposalStatus } from "./proposal.api";
import { Proposal } from "./proposal.types";
import { useAuthStore } from "@/features/auth/auth.store";
import { APP_ROLES } from "@/constant/roles";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

const formatCurrencyIDR = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
};

const statusBadgeMap: Record<string, string> = {
  REVIEW: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  SUBMITTED: "bg-orange-100 text-orange-600",
  APPROVED: "bg-green-100 text-green-600",
  ACCEPTED: "bg-green-100 text-green-600",
  DRAFT: "bg-gray-100 text-gray-500",
  REVISION: "bg-red-100 text-red-600",
  REJECTED: "bg-red-100 text-red-700",
  ADMIN_VERIFIED: "bg-blue-100 text-blue-700",
};

const getStatusKey = (status: string) =>
  status
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getStatusLabel = (status: string) => {
  const key = getStatusKey(status);

  const statusLabel: Record<string, string> = {
    REVIEW: "Review",
    UNDER_REVIEW: "Under Review",
    SUBMITTED: "Submitted",
    APPROVED: "Approved",
    ACCEPTED: "Approved",
    ADMIN_VERIFIED: "Admin Verified",
    DRAFT: "Draft",
    REVISION: "Revision",
    REJECTED: "Rejected",
  };

  return statusLabel[key] || status;
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

export default function ProposalDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const proposalId = Number(id);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.roles?.roles === APP_ROLES.ADMIN_LPPM;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");

  const loadProposal = async () => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await getProposalById(proposalId);
      setProposal(res.data);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Gagal memuat detail proposal."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isInteger(proposalId) || proposalId <= 0) {
      setFeedback({ type: "error", message: "ID proposal tidak valid." });
      setIsLoading(false);
      return;
    }

    void loadProposal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId]);

  const statusKey = useMemo(
    () => getStatusKey(proposal?.status || ""),
    [proposal?.status],
  );

  const isSubmitted = statusKey === "SUBMITTED";

  const handleVerifySubmit = async () => {
    if (!isAdmin) return;
    if (!proposal) return;

    setIsVerifying(true);
    setFeedback(null);

    try {
      const res = await updateProposalStatus(proposal.id, {
        status: "ADMIN_VERIFIED",
      });

      setFeedback({ type: "success", message: res.message });
      setProposal(res.data);
      setIsVerifyModalOpen(false);

      setTimeout(() => {
        navigate("/plotting-reviewer");
      }, 600);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Gagal memverifikasi proposal."),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!isAdmin) return;
    if (!proposal) return;
    const notes = rejectionNotes.trim();

    if (!notes) {
      setFeedback({
        type: "error",
        message: "Catatan penolakan wajib diisi.",
      });
      return;
    }

    setIsRejecting(true);
    setFeedback(null);

    try {
      const res = await updateProposalStatus(proposal.id, {
        status: "REJECTED",
        notes,
      });

      setFeedback({ type: "success", message: res.message });
      setIsRejectModalOpen(false);
      setRejectionNotes("");

      setTimeout(() => {
        navigate("/proposals");
      }, 600);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Gagal menolak proposal."),
      });
    } finally {
      setIsRejecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="h-6 w-56 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-28 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-28 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-28 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-28 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="space-y-4 p-8">
        {feedback && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {feedback.message}
          </div>
        )}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Detail Proposal
        </h1>
        <p className="text-sm text-gray-500">
          Pemeriksaan administratif proposal oleh Admin LPPM.
        </p>
      </div>

      {feedback && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-800">
            {proposal.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              ID: PROP-{proposal.id}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeMap[statusKey] || "bg-gray-100 text-gray-600"}`}
            >
              {getStatusLabel(proposal.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase text-gray-400">Ketua Peneliti</p>
            <p className="mt-1 font-medium text-gray-800">
              {proposal.user?.name ||
                `ID Peneliti: ${proposal.lead_researcher_id}`}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              NIDN/NIP: {proposal.user?.nidn_nip || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase text-gray-400">Fakultas & Skema</p>
            <p className="mt-1 font-medium text-gray-800">
              {proposal.faculty || "-"} • {formatSkemaLabel(proposal.skema)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase text-gray-400">
              Sumber Data Penelitian
            </p>
            <p className="mt-1 font-medium text-gray-800">
              {proposal.sumber_data_penelitian || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase text-gray-400">Instansi</p>
            <p className="mt-1 font-medium text-gray-800">
              {proposal.instansi || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase text-gray-400">Dana Diajukan</p>
            <p className="mt-1 font-medium text-gray-800">
              {formatCurrencyIDR(proposal.funding_request_amount || 0)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase text-gray-400">Diajukan Pada</p>
            <p className="mt-1 font-medium text-gray-800">
              {proposal.submitted_at
                ? new Date(proposal.submitted_at).toLocaleString("id-ID")
                : "-"}
            </p>
          </div>
        </div>

        {/* Dosen Terlibat & Anggota Tables */}
        <div className="mt-5 grid grid-cols-1 gap-6">
          {/* Dosen Terlibat */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Kelompok Dosen Terlibat
            </h3>
            {(() => {
              const names = (proposal.dosen_terlibat || "")
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean);
              const nidns = (proposal.nidn_dosen_terlibat || "")
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean);
              const rows = Math.max(names.length, nidns.length);

              if (rows === 0) {
                return (
                  <p className="text-sm text-gray-500">
                    Tidak ada data dosen terlibat.
                  </p>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b text-left text-gray-400">
                      <tr>
                        <th className="pb-2 pr-4">No</th>
                        <th className="pb-2 pr-4">Nama Dosen</th>
                        <th className="pb-2">NIDN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: rows }).map((_, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 pr-4">{i + 1}</td>
                          <td className="py-2 pr-4">{names[i] || "-"}</td>
                          <td className="py-2">{nidns[i] || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* Anggota / Mahasiswa */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Kelompok Anggota / Mahasiswa
            </h3>
            {(() => {
              const names = (proposal.nama_anggota || "")
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean);
              const nims = (proposal.nim_anggota || "")
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean);
              const rows = Math.max(names.length, nims.length);

              if (rows === 0) {
                return (
                  <p className="text-sm text-gray-500">
                    Tidak ada data anggota.
                  </p>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b text-left text-gray-400">
                      <tr>
                        <th className="pb-2 pr-4">No</th>
                        <th className="pb-2 pr-4">Nama Anggota</th>
                        <th className="pb-2">NIM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: rows }).map((_, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 pr-4">{i + 1}</td>
                          <td className="py-2 pr-4">{names[i] || "-"}</td>
                          <td className="py-2">{nims[i] || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <a
            href={proposal.proposal_file_path || "#"}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium ${
              proposal.proposal_file_path
                ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                : "pointer-events-none border-gray-200 bg-gray-100 text-gray-400"
            }`}
          >
            <FileText size={16} />
            Lihat/Download Proposal
          </a>

          <a
            href={proposal.rab_file_path || "#"}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium ${
              proposal.rab_file_path
                ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                : "pointer-events-none border-gray-200 bg-gray-100 text-gray-400"
            }`}
          >
            <FileText size={16} />
            Lihat/Download RAB
          </a>
        </div>
      </div>

      {isAdmin && (
        <>
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(true)}
              disabled={isRejecting || isVerifying || !isSubmitted}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                isRejecting || isVerifying || !isSubmitted
                  ? "cursor-not-allowed bg-red-200 text-white"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              Tolak Proposal
            </button>

            <button
              type="button"
              onClick={() => setIsVerifyModalOpen(true)}
              disabled={isVerifying || isRejecting || !isSubmitted}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                isVerifying || isRejecting || !isSubmitted
                  ? "cursor-not-allowed bg-blue-200 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isVerifying && <Loader2 size={14} className="animate-spin" />}
              {isVerifying ? "Memverifikasi..." : "Verifikasi Proposal"}
            </button>
          </div>

          {!isSubmitted && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Aksi verifikasi/penolakan hanya tersedia untuk proposal berstatus
              Submitted.
            </p>
          )}
        </>
      )}

      {isAdmin && isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800">
              Verifikasi Proposal
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Proposal akan diubah ke status
              <span className="font-semibold text-blue-700">
                {" "}
                Admin Verified
              </span>
              dan siap untuk proses plotting reviewer.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isVerifying) return;
                  setIsVerifyModalOpen(false);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => void handleVerifySubmit()}
                disabled={isVerifying}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white ${
                  isVerifying
                    ? "cursor-not-allowed bg-blue-300"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isVerifying && <Loader2 size={14} className="animate-spin" />}
                {isVerifying ? "Memverifikasi..." : "Ya, Verifikasi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800">
              Tolak Proposal
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Berikan alasan penolakan agar peneliti dapat menindaklanjuti.
            </p>

            <textarea
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              placeholder="Tulis catatan penolakan (wajib diisi)..."
              className="mt-4 h-32 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-red-400"
            />

            <p className="mt-2 text-right text-xs text-gray-400">
              {rejectionNotes.trim().length}/500 karakter
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isRejecting) return;
                  setIsRejectModalOpen(false);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => void handleRejectSubmit()}
                disabled={isRejecting || !rejectionNotes.trim()}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white ${
                  isRejecting || !rejectionNotes.trim()
                    ? "cursor-not-allowed bg-red-300"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isRejecting && <Loader2 size={14} className="animate-spin" />}
                {isRejecting ? "Menyimpan..." : "Submit Penolakan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
