import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, CheckSquare, Square } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { assignProposalReviewersAuto, getProposalById } from "./proposal.api";
import { Proposal } from "./proposal.types";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

const statusBadgeMap: Record<string, string> = {
  REVIEW: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  SUBMITTED: "bg-orange-100 text-orange-600",
  APPROVED: "bg-green-100 text-green-600",
  ACCEPTED: "bg-green-100 text-green-600",
  DRAFT: "bg-gray-100 text-gray-500",
  REVISION: "bg-red-100 text-red-600",
  REJECTED: "bg-red-100 text-red-700",
};

const getStatusKey = (status: string) =>
  status
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getStatusLabel = (status: string) => {
  const key = getStatusKey(status);

  const map: Record<string, string> = {
    REVIEW: "Review",
    UNDER_REVIEW: "Under Review",
    SUBMITTED: "Submitted",
    APPROVED: "Approved",
    ACCEPTED: "Accepted",
    DRAFT: "Draft",
    REVISION: "Revision",
    REJECTED: "Rejected",
  };

  return map[key] || status;
};

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message || fallback;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
};

// =====================================================================
// Checklist dokumen — UI ONLY, belum ada API. State lokal murni tampilan,
// tidak dikirim ke server. Ganti dengan data/endpoint asli begitu tersedia.
// =====================================================================
type ChecklistItem = {
  id: string;
  label: string;
};

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: "dokumen_proposal", label: "Dokumen Proposal Lengkap" },
  { id: "rab_format", label: "RAB Sesuai Format" },
  { id: "surat_pernyataan", label: "Surat Pernyataan Dilampirkan" },
  { id: "template_lppm", label: "Template LPPM Digunakan" },
];

export default function ProposalVerifyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const proposalId = Number(id);

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  // State UI-only untuk checklist & catatan administrasi (belum ada API)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    {},
  );
  const [catatanAdministrasi, setCatatanAdministrasi] = useState("");

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

  const handleAutoAssign = async () => {
    if (!proposal) return;

    if (!isSubmitted) {
      setFeedback({
        type: "error",
        message:
          "Plotting reviewer otomatis hanya tersedia untuk proposal berstatus SUBMITTED.",
      });
      return;
    }

    setIsAssigning(true);
    setFeedback(null);

    try {
      const res = await assignProposalReviewersAuto(proposal.id);
      setProposal(res.data);
      setFeedback({ type: "success", message: res.message });
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

  const toggleChecklist = (itemId: string) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        Memuat detail proposal...
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="space-y-4 p-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {feedback?.message || "Proposal tidak ditemukan."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Detail Verifikasi Proposal
          </h1>
          <p className="text-sm text-gray-500">
            Pemeriksaan kelengkapan administrasi proposal
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* KIRI: Info Proposal + Checklist */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Judul Proposal
            </p>

            <h2 className="mb-5 text-lg font-bold text-gray-900">
              {proposal.title}
            </h2>

            <div className="grid grid-cols-2 gap-5 border-t border-gray-100 pt-5 text-sm">
              <div>
                <p className="text-xs text-gray-400">Nama Peneliti</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {proposal.user?.name ||
                    `ID Peneliti: ${proposal.lead_researcher_id}`}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Tahun Anggaran</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {proposal.submitted_at
                    ? new Date(proposal.submitted_at).getFullYear()
                    : new Date(proposal.created_at).getFullYear()}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Skema</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {proposal.skema}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Status Saat Ini</p>
                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    statusBadgeMap[statusKey] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {getStatusLabel(proposal.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Checklist Kelengkapan Dokumen — UI ONLY, belum ada API */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <CheckSquare size={16} className="text-gray-400" />
              Checklist Kelengkapan Dokumen
            </h3>

            <div className="space-y-2">
              {CHECKLIST_ITEMS.map((item) => {
                const checked = !!checkedItems[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleChecklist(item.id)}
                    className="flex w-full items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    {checked ? (
                      <CheckSquare size={18} className="flex-shrink-0 text-red-600" />
                    ) : (
                      <Square size={18} className="flex-shrink-0 text-gray-300" />
                    )}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* KANAN: Catatan Administrasi + Aksi */}
        <div className="space-y-4">
          {/* Catatan Administrasi — UI ONLY, belum ada API */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-gray-900">
              Catatan Administrasi
            </p>
            <textarea
              value={catatanAdministrasi}
              onChange={(e) => setCatatanAdministrasi(e.target.value)}
              rows={5}
              placeholder="Tuliskan catatan untuk peneliti jika ada revisi atau hal yang perlu diperhatikan..."
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>

          {/* Tombol Verifikasi / Tolak — UI ONLY, belum ada API */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 cursor-pointer"
          >
            Verifikasi Proposal
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
          >
            Tolak / Revisi
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}