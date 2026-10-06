import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Download,
  FileText,
  Info,
  ListChecks,
  Loader2,
  MessageSquare,
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

type TabKey = "informasi" | "tim" | "dokumen" | "riwayat" | "review";

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

const formatDateISO = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toISOString().split("T")[0];
};

// ─── Review notes parser (mirrors ReviewDetailPage serialize/deserialize) ───────
type ParsedReviewNotes = {
  comments: {
    perumusan: string;
    tinjauan: string;
    metode: string;
    anggaran: string;
    luaran: string;
  };
  decisionOpt: "APPROVED" | "REVISION_MINOR" | "REVISION_MAJOR" | "REJECTED" | "";
  generalNotes: string;
};

const parseReviewNotes = (serialized: string | null | undefined): ParsedReviewNotes => {
  const result: ParsedReviewNotes = {
    comments: { perumusan: "", tinjauan: "", metode: "", anggaran: "", luaran: "" },
    decisionOpt: "",
    generalNotes: "",
  };
  if (!serialized) return result;
  const parts = serialized.split(/^--- (CATATAN INDIKATOR|KEPUTUSAN OPTION|CATATAN TAMBAHAN REVIEWER) ---$/m);
  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i];
    const content = parts[i + 1] ? parts[i + 1].trim() : "";
    if (name === "CATATAN INDIKATOR") {
      const pick = (label: string) => {
        const m = content.match(new RegExp(`${label}:\\s*(.*)`));
        if (!m) return "";
        const v = m[1].trim();
        return v === "-" ? "" : v;
      };
      result.comments.perumusan = pick("Perumusan Masalah");
      result.comments.tinjauan = pick("Tinjauan Pustaka");
      result.comments.metode = pick("Metode Penelitian");
      result.comments.anggaran = pick("Kelayakan Anggaran");
      result.comments.luaran = pick("Luaran & Kontribusi");
    } else if (name === "KEPUTUSAN OPTION") {
      if (
        content === "ACCEPTED" ||
        content === "APPROVED" ||
        content === "REVISION_MINOR" ||
        content === "REVISION_MAJOR" ||
        content === "REJECTED"
      ) {
        result.decisionOpt = (content === "ACCEPTED" ? "APPROVED" : content) as ParsedReviewNotes["decisionOpt"];
      }
    } else if (name === "CATATAN TAMBAHAN REVIEWER") {
      result.generalNotes = content;
    }
  }
  if (parts.length <= 1) result.generalNotes = serialized.trim();
  return result;
};

const getRekomCardStyle = (decision: string) => {
  const d = decision.toUpperCase();
  if (d === "APPROVED" || d === "ACCEPTED") return "bg-green-50 border-green-200 text-green-800";
  if (d === "REJECTED") return "bg-red-50 border-red-200 text-red-800";
  if (d === "REVISION_MAJOR") return "bg-orange-50 border-orange-200 text-orange-800";
  // REVISION_MINOR default — matches screenshot mint green
  return "bg-[#e8f5e9] border-[#c8e6c9] text-green-900";
};

const INDICATOR_ROWS: { key: keyof ParsedReviewNotes["comments"]; label: string }[] = [
  { key: "perumusan", label: "Perumusan Masalah" },
  { key: "tinjauan", label: "Tinjauan Pustaka" },
  { key: "metode", label: "Metode Penelitian" },
  { key: "anggaran", label: "Kelayakan Anggaran" },
  { key: "luaran", label: "Luaran & Kontribusi" },
];

const TABS: { key: TabKey; label: string }[] = [
  { key: "informasi", label: "Informasi Proposal" },
  { key: "tim", label: "Tim Peneliti" },
  { key: "dokumen", label: "Dokumen Proposal" },
  { key: "riwayat", label: "Riwayat Status" },
  { key: "review", label: "Catatan Reviewer" },
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
  const isUnderReview = statusKey === "REVIEW" || statusKey === "UNDER_REVIEW";

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

  const proposalCode = `PROP-${String(proposal.id).padStart(3, "0")}`;

  return (
    <div className="space-y-6 p-8">
      {isUnderReview && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4">
          <Clock size={18} className="mt-0.5 flex-shrink-0 text-yellow-600" />
          <div>
            <h3 className="text-sm font-bold text-yellow-800">
              Sedang Direview oleh Reviewer LPPM
            </h3>
            <p className="mt-0.5 text-xs text-yellow-700">
              Proposal tidak dapat diedit selama proses review berlangsung.
            </p>
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                statusBadgeMap[statusKey] || "bg-gray-100 text-gray-600"
              }`}
            >
              {getStatusLabel(proposal.status).toUpperCase()}
            </span>
            <span className="text-xs text-gray-400">{proposalCode}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={proposal.proposal_file_path || "#"}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                proposal.proposal_file_path
                  ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                  : "pointer-events-none border-gray-200 bg-gray-100 text-gray-400"
              }`}
            >
              <Download size={14} />
              Download Proposal
            </a>

            <a
              href={proposal.rab_file_path || "#"}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                proposal.rab_file_path
                  ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                  : "pointer-events-none border-gray-200 bg-gray-100 text-gray-400"
              }`}
            >
              <Download size={14} />
              Download RAB
            </a>
          </div>
        </div>

        <h2 className="mt-4 text-xl font-bold text-gray-900">
          {proposal.title}
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-gray-100 pt-5 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="text-xs text-gray-400">Nomor Proposal</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {proposalCode}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Tanggal Pengajuan</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {formatDateISO(proposal.submitted_at)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Skema Penelitian</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {formatSkemaLabel(proposal.skema)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Sumber Pendanaan</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {proposal.sumber_pendanaan || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Nominal Pengajuan</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {formatCurrencyIDR(proposal.funding_request_amount || 0)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Tahun Anggaran</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {tahunProposal}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="inline-flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
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

        <div className="mt-6">
          {activeTab === "informasi" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 border-b border-gray-100 pb-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Judul Proposal
                  </p>
                  <p className="mt-1 text-sm text-gray-800">{proposal.title}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Skema Penelitian / Hibah
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {formatSkemaLabel(proposal.skema)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 border-b border-gray-100 pb-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Sumber Pendanaan
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {proposal.sumber_pendanaan || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Instansi Pemberi Dana
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {proposal.instansi || "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 border-b border-gray-100 pb-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Nominal Pengajuan Dana
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {formatCurrencyIDR(proposal.funding_request_amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Sumber Data Penelitian
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {proposal.sumber_data_penelitian || "-"}
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-100 pb-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Abstrak / Deskripsi Penelitian
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                  {proposal.abstrak || "-"}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Tujuan Penelitian
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                  {proposal.tujuan_penelitian || "-"}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Metode Penelitian
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                  {proposal.metode_penelitian || "-"}
                </p>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <Info size={16} className="mt-0.5 flex-shrink-0 text-blue-600" />
                <p className="text-xs text-blue-700">
                  Data ditampilkan sesuai proposal yang telah diajukan. Hubungi
                  LPPM jika ada ketidaksesuaian.
                </p>
              </div>
            </div>
          )}

          {activeTab === "tim" && (
            <div className="space-y-6">
              <div>
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

              <div>
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
                (() => {
                  const parsed = parseReviewNotes(latestReview.notes);
                  const decisionLabel =
                    parsed.decisionOpt ||
                    (latestReview.status === "ACCEPTED"
                      ? "APPROVED"
                      : latestReview.status) ||
                    "-";
                  const rekomStyle = getRekomCardStyle(decisionLabel);
                  const generalNotesText =
                    parsed.generalNotes?.trim() || "-";
                  const hasIndicator = INDICATOR_ROWS.some(
                    (r) => parsed.comments[r.key]?.trim(),
                  );

                  return (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-400">Reviewer:</span>{" "}
                        <span className="font-semibold text-gray-700">
                          {latestReview.reviewer?.name || "Tim Reviewer"}
                        </span>
                      </p>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* ── Left column ── */}
                        <div className="space-y-4">
                          {/* Rekomendasi Akhir */}
                          <div
                            className={`rounded-xl border p-4 shadow-sm ${rekomStyle}`}
                          >
                            <p className="text-xs font-bold uppercase tracking-wide opacity-80">
                              Rekomendasi Akhir
                            </p>
                            <p className="mt-2 text-sm font-extrabold tracking-tight">
                              {decisionLabel}
                            </p>
                            {latestReview.rekomendasi_akhir && (
                              <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed opacity-80">
                                {latestReview.rekomendasi_akhir}
                              </p>
                            )}
                          </div>

                          {/* Catatan Perbaikan / Kelemahan */}
                          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50">
                                <AlertTriangle
                                  size={14}
                                  className="text-amber-600"
                                />
                              </span>
                              <p className="text-xs font-bold uppercase tracking-wide text-gray-700">
                                Catatan Perbaikan / Kelemahan
                              </p>
                            </div>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                              {latestReview.kelemahan_proposal?.trim() || "-"}
                            </p>
                          </div>
                        </div>

                        {/* ── Right column ── */}
                        <div className="space-y-4">
                          {/* Catatan Indikator */}
                          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2">
                              <ListChecks
                                size={16}
                                className="text-gray-400"
                              />
                              <p className="text-xs font-bold uppercase tracking-wide text-gray-700">
                                Catatan Indikator
                              </p>
                            </div>
                            <div className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-100">
                              {INDICATOR_ROWS.map((row) => {
                                const val =
                                  parsed.comments[row.key]?.trim() || "-";
                                const isEmpty = val === "-";
                                return (
                                  <div
                                    key={row.key}
                                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                                  >
                                    <span className="flex items-center gap-2 text-xs text-gray-500">
                                      <span
                                        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                                          isEmpty
                                            ? "border-gray-200 bg-white"
                                            : "border-green-200 bg-green-50"
                                        }`}
                                      >
                                        {!isEmpty && (
                                          <CheckCircle2
                                            size={10}
                                            className="text-green-600"
                                          />
                                        )}
                                      </span>
                                      {row.label}
                                    </span>
                                    <span
                                      className={`max-w-[52%] truncate text-right text-xs font-medium ${
                                        isEmpty
                                          ? "text-gray-400"
                                          : "text-gray-700"
                                      }`}
                                      title={val}
                                    >
                                      {val}
                                    </span>
                                  </div>
                                );
                              })}
                              {!hasIndicator && (
                                <p className="px-3 py-2 text-xs text-gray-400">
                                  Tidak ada catatan indikator.
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Catatan Tambahan Reviewer */}
                          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2">
                              <MessageSquare
                                size={16}
                                className="text-gray-400"
                              />
                              <p className="text-xs font-bold uppercase tracking-wide text-gray-700">
                                Catatan Tambahan Reviewer
                              </p>
                            </div>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                              {generalNotesText}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
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
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <ChevronLeft size={16} />
          Kembali ke Proposal Saya
        </button>

        <div className="flex flex-wrap items-center gap-3">
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
