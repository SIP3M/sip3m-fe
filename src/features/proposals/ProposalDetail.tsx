import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  FileText,
  Loader2,
  User,
  Calendar,
  DollarSign,
  Users2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  assignProposalReviewersAuto,
  getProposalById,
  submitProposal,
} from "./proposal.api";
import { Proposal } from "./proposal.types";
import { useAuthStore } from "@/features/auth/auth.store";
import { APP_ROLES } from "@/constant/roles";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

type TabKey = "informasi" | "dokumen" | "review" | "riwayat";

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

const TABS: { key: TabKey; label: string }[] = [
  { key: "informasi", label: "Informasi Umum" },
  { key: "dokumen", label: "Dokumen Proposal" },
  { key: "review", label: "Proses Review" },
  { key: "riwayat", label: "Riwayat Status" },
];

export default function ProposalDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const proposalId = Number(id);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.roles?.roles === APP_ROLES.ADMIN_LPPM;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("informasi");

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
  const isRevision = statusKey === "REVISION";
  const isDraft = statusKey === "DRAFT";
  const isDosen = user?.roles?.roles === APP_ROLES.DOSEN;
  const canEditRevise = isDosen && (isDraft || isRevision);

  const latestReview = useMemo(
    () =>
      proposal?.reviews && proposal.reviews.length > 0
        ? proposal.reviews[0]
        : null,
    [proposal?.reviews],
  );

  const tahunProposal = useMemo(() => {
    if (!proposal?.submitted_at) return "-";
    return new Date(proposal.submitted_at).getFullYear();
  }, [proposal?.submitted_at]);

  const handleAutoAssign = async () => {
    if (!isAdmin) return;
    if (!proposal) return;

    if (!isSubmitted) {
      setFeedback({
        type: "error",
        message:
          "Plotting reviewer otomatis hanya tersedia untuk proposal berstatus Submitted.",
      });
      return;
    }

    setIsAssigning(true);
    setFeedback(null);

    try {
      const res = await assignProposalReviewersAuto(proposal.id);

      setFeedback({ type: "success", message: res.message });
      setProposal(res.data);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          err,
          "Gagal melakukan plotting reviewer otomatis.",
        ),
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleEditProposal = () => {
    if (!proposal) return;
    navigate(`/dosen-dashboard/proposals/${proposal.id}/edit`, {
      state: { proposal },
    });
  };

  const handleSubmitProposal = async () => {
    if (!proposal) return;

    const confirmed = window.confirm(
      `Submit ulang proposal "${proposal.title}"? Proposal akan dikirim kembali ke reviewer.`,
    );
    if (!confirmed) return;

    setIsSubmittingProposal(true);
    setFeedback(null);

    try {
      const res = await submitProposal(proposal.id);
      setFeedback({ type: "success", message: res.message });
      setProposal(res.data);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Gagal melakukan submit ulang proposal."),
      });
    } finally {
      setIsSubmittingProposal(false);
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

  const dosenNames = (proposal.dosen_terlibat || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const dosenNidns = (proposal.nidn_dosen_terlibat || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const dosenRows = Math.max(dosenNames.length, dosenNidns.length);

  const anggotaNames = (proposal.nama_anggota || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const anggotaNims = (proposal.nim_anggota || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const anggotaRows = Math.max(anggotaNames.length, anggotaNims.length);

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Proposal</h1>
          <p className="text-sm text-gray-500">
            Informasi lengkap dan status proposal
          </p>
        </div>
      </div>

      {isRevision && latestReview && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
          <div className="mb-3 flex items-start gap-3">
            <AlertCircle
              size={20}
              className="mt-0.5 flex-shrink-0 text-amber-600"
            />
            <div>
              <h3 className="font-semibold text-amber-900">
                Catatan Revisi dari Reviewer
              </h3>
              <p className="mt-1 text-xs text-amber-700">
                Reviewer: {latestReview.reviewer?.name || "Tim Reviewer"}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-md bg-white px-3 py-3 text-sm text-gray-700">
            {latestReview.rekomendasi_akhir && (
              <div>
                <p className="font-semibold text-gray-900">
                  Rekomendasi Akhir:
                </p>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">
                  {latestReview.rekomendasi_akhir}
                </p>
              </div>
            )}

            {latestReview.kelemahan_proposal && (
              <div>
                <p className="font-semibold text-gray-900">
                  Catatan Perbaikan / Kelemahan:
                </p>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">
                  {latestReview.kelemahan_proposal}
                </p>
              </div>
            )}

            {latestReview.notes && (
              <div>
                <p className="font-semibold text-gray-900">Catatan Tambahan:</p>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">
                  {latestReview.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Judul Proposal
        </p>
        <h2 className="mt-1 text-xl font-bold text-gray-900">
          {proposal.title}
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-y-4 border-t border-gray-100 pt-5 md:grid-cols-5">
          <div>
            <p className="text-xs text-gray-400">Ketua Peneliti</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-800">
              <User size={14} className="text-gray-400" />
              {proposal.user?.name ||
                `ID Peneliti: ${proposal.lead_researcher_id}`}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Skema</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {formatSkemaLabel(proposal.skema)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Tahun</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-800">
              <Calendar size={14} className="text-gray-400" />
              {tahunProposal}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Total Anggaran</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {formatCurrencyIDR(proposal.funding_request_amount || 0)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Status Proposal</p>
            <span
              className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                statusBadgeMap[statusKey] || "bg-gray-100 text-gray-600"
              }`}
            >
              {getStatusLabel(proposal.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 inline-flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "informasi" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-400">
                  Ketua Peneliti
                </p>
                <p className="mt-1 font-medium text-gray-800">
                  {proposal.user?.name ||
                    `ID Peneliti: ${proposal.lead_researcher_id}`}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  NIDN/NIP: {proposal.user?.nidn_nip || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-400">
                  Fakultas &amp; Skema
                </p>
                <p className="mt-1 font-medium text-gray-800">
                  {proposal.faculty || "-"} &bull; {formatSkemaLabel(proposal.skema)}
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
                <p className="text-xs uppercase text-gray-400">
                  Dana Diajukan
                </p>
                <p className="mt-1 font-medium text-gray-800">
                  {formatCurrencyIDR(proposal.funding_request_amount || 0)}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs uppercase text-gray-400">
                  Diajukan Pada
                </p>
                <p className="mt-1 font-medium text-gray-800">
                  {proposal.submitted_at
                    ? new Date(proposal.submitted_at).toLocaleString("id-ID")
                    : "-"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Users2 size={16} className="text-gray-400" />
                Kelompok Dosen Terlibat
              </h3>

              {dosenRows === 0 ? (
                <p className="text-sm text-gray-500">
                  Tidak ada data dosen terlibat.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs uppercase text-gray-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">No</th>
                        <th className="px-4 py-3 font-medium">NIDN</th>
                        <th className="px-4 py-3 font-medium">Nama Dosen</th>
                        <th className="px-4 py-3 text-right font-medium">
                          Peran
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: dosenRows }).map((_, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {dosenNidns[i] || "-"}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {dosenNames[i] || "-"}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500">
                            {i === 0 ? "Ketua Peneliti" : "Anggota Peneliti"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Users2 size={16} className="text-gray-400" />
                Kelompok Anggota / Mahasiswa
              </h3>

              {anggotaRows === 0 ? (
                <p className="text-sm text-gray-500">
                  Tidak ada data anggota.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs uppercase text-gray-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">No</th>
                        <th className="px-4 py-3 font-medium">NIM</th>
                        <th className="px-4 py-3 font-medium">
                          Nama Anggota
                        </th>
                        <th className="px-4 py-3 text-right font-medium">
                          Peran
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: anggotaRows }).map((_, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {anggotaNims[i] || "-"}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {anggotaNames[i] || "-"}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500">
                            Anggota Mahasiswa
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "dokumen" && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <a
              href={proposal.proposal_file_path || "#"}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
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
              className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
                proposal.rab_file_path
                  ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                  : "pointer-events-none border-gray-200 bg-gray-100 text-gray-400"
              }`}
            >
              <FileText size={16} />
              Lihat/Download RAB
            </a>
          </div>
        )}

        {activeTab === "review" && (
          <div>
            {latestReview ? (
              <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-700">
                <p className="text-xs font-medium text-gray-400">
                  Reviewer: {latestReview.reviewer?.name || "Tim Reviewer"}
                </p>

                {latestReview.rekomendasi_akhir && (
                  <div>
                    <p className="font-semibold text-gray-900">
                      Rekomendasi Akhir:
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-gray-700">
                      {latestReview.rekomendasi_akhir}
                    </p>
                  </div>
                )}

                {latestReview.kelemahan_proposal && (
                  <div>
                    <p className="font-semibold text-gray-900">
                      Catatan Perbaikan / Kelemahan:
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-gray-700">
                      {latestReview.kelemahan_proposal}
                    </p>
                  </div>
                )}

                {latestReview.notes && (
                  <div>
                    <p className="font-semibold text-gray-900">
                      Catatan Tambahan:
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-gray-700">
                      {latestReview.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Belum ada proses review untuk proposal ini.
              </p>
            )}
          </div>
        )}

        {activeTab === "riwayat" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusBadgeMap[statusKey] || "bg-gray-100 text-gray-600"
                }`}
              >
                {getStatusLabel(proposal.status)}
              </span>
              <p className="text-sm text-gray-600">
                Status proposal saat ini
                {proposal.submitted_at &&
                  ` — diperbarui pada ${new Date(
                    proposal.submitted_at,
                  ).toLocaleString("id-ID")}`}
                .
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Riwayat perubahan status lengkap belum tersedia pada sistem ini.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          Kembali ke Daftar Proposal
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <DollarSign size={16} />
          Lihat Keuangan
        </button>

        {isDosen && canEditRevise && (
          <>
            <button
              type="button"
              onClick={handleEditProposal}
              disabled={isSubmittingProposal}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Edit Proposal
            </button>

            <button
              type="button"
              onClick={() => void handleSubmitProposal()}
              disabled={isSubmittingProposal}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {isSubmittingProposal && (
                <Loader2 size={14} className="animate-spin" />
              )}
              {isSubmittingProposal ? "Memproses..." : "Submit Ulang Proposal"}
            </button>
          </>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={() => navigate("/plotting-reviewer")}
            disabled={isAssigning || !isSubmitted}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
              isAssigning || !isSubmitted
                ? "cursor-not-allowed bg-red-200 text-white"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {isAssigning && <Loader2 size={14} className="animate-spin" />}
            {isAssigning ? "Memproses..." : "Plotting Reviewer"}
          </button>
        )}
      </div>

      {isDosen && canEditRevise && isRevision && (
        <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
          Proposal Anda telah ditandai untuk revisi. Silakan baca catatan dari
          reviewer dan lakukan perbaikan, kemudian submit kembali.
        </p>
      )}

      {isAdmin && !isSubmitted && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Plotting reviewer otomatis hanya tersedia untuk proposal berstatus
          Submitted.
        </p>
      )}
    </div>
  );
}