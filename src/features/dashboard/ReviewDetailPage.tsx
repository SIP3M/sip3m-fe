import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/features/auth/auth.store";
import {
  ArrowLeft,
  FileText,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Star,
  Check,
  Download,
  Eye,
} from "lucide-react";
import {
  evaluateProposal,
  getAssignedProposals,
  getProposalReviews,
} from "@/features/reviews/review.api";
import type {
  AssignedProposal,
  EvaluatePayloadDraft,
  EvaluatePayloadFinal,
  ReviewHistoryItem,
  ReviewDecision,
} from "@/features/reviews/review.types";

// ─── Score Criteria & Info ───────────────────────────────────────────────────
const CRITERIA = [
  {
    key: "score_perumusan" as const,
    label: "Perumusan Masalah",
    weight: "20%",
    desc: "Kejelasan, urgensi, dan relevansi rumusan masalah penelitian.",
  },
  {
    key: "score_tinjauan" as const,
    label: "Tinjauan Pustaka",
    weight: "20%",
    desc: "Kelengkapan referensi, kemutakhiran pustaka, dan relevansi tinjauan pustaka.",
  },
  {
    key: "score_metode" as const,
    label: "Metode Penelitian",
    weight: "25%",
    desc: "Kesesuaian metode penelitian dengan tujuan dan luaran yang ditargetkan.",
  },
  {
    key: "score_anggaran" as const,
    label: "Kelayakan Anggaran",
    weight: "15%",
    desc: "Kesesuaian anggaran terhadap aktivitas penelitian.",
  },
  {
    key: "score_luaran" as const,
    label: "Luaran & Kontribusi",
    weight: "20%",
    desc: "Target luaran penelitian dan dampak serta kontribusi kepada masyarakat.",
  },
] as const;

type ScoreKey = (typeof CRITERIA)[number]["key"];
type Scores = Record<ScoreKey, number>;

const EMPTY_SCORES: Scores = {
  score_perumusan: 0,
  score_tinjauan: 0,
  score_metode: 0,
  score_anggaran: 0,
  score_luaran: 0,
};

// ─── Serialization Helpers for Indicator Comments ────────────────────────────
const serializeNotes = (
  comments: {
    perumusan: string;
    tinjauan: string;
    metode: string;
    anggaran: string;
    luaran: string;
  },
  decisionOpt: string,
  generalNotes: string
) => {
  return `--- CATATAN INDIKATOR ---
Perumusan Masalah: ${comments.perumusan || "-"}
Tinjauan Pustaka: ${comments.tinjauan || "-"}
Metode Penelitian: ${comments.metode || "-"}
Kelayakan Anggaran: ${comments.anggaran || "-"}
Luaran & Kontribusi: ${comments.luaran || "-"}
--- KEPUTUSAN OPTION ---
${decisionOpt}
--- CATATAN TAMBAHAN REVIEWER ---
${generalNotes}`;
};

const deserializeNotes = (serialized: string) => {
  const result = {
    comments: {
      perumusan: "",
      tinjauan: "",
      metode: "",
      anggaran: "",
      luaran: "",
    },
    decisionOpt: "" as "APPROVED" | "REVISION_MINOR" | "REVISION_MAJOR" | "REJECTED" | "",
    generalNotes: "",
  };

  if (!serialized) return result;

  // Split string based on headers
  const parts = serialized.split(/^--- (CATATAN INDIKATOR|KEPUTUSAN OPTION|CATATAN TAMBAHAN REVIEWER) ---$/m);
  
  for (let i = 1; i < parts.length; i += 2) {
    const sectionName = parts[i];
    const sectionContent = parts[i + 1] ? parts[i + 1].trim() : "";

    if (sectionName === "CATATAN INDIKATOR") {
      const perumusanMatch = sectionContent.match(/Perumusan Masalah:\s*(.*)/);
      const tinjauanMatch = sectionContent.match(/Tinjauan Pustaka:\s*(.*)/);
      const metodeMatch = sectionContent.match(/Metode Penelitian:\s*(.*)/);
      const anggaranMatch = sectionContent.match(/Kelayakan Anggaran:\s*(.*)/);
      const luaranMatch = sectionContent.match(/Luaran & Kontribusi:\s*(.*)/);

      if (perumusanMatch) result.comments.perumusan = perumusanMatch[1].trim() === "-" ? "" : perumusanMatch[1].trim();
      if (tinjauanMatch) result.comments.tinjauan = tinjauanMatch[1].trim() === "-" ? "" : tinjauanMatch[1].trim();
      if (metodeMatch) result.comments.metode = metodeMatch[1].trim() === "-" ? "" : metodeMatch[1].trim();
      if (anggaranMatch) result.comments.anggaran = anggaranMatch[1].trim() === "-" ? "" : anggaranMatch[1].trim();
      if (luaranMatch) result.comments.luaran = luaranMatch[1].trim() === "-" ? "" : luaranMatch[1].trim();
    } else if (sectionName === "KEPUTUSAN OPTION") {
      if (
        sectionContent === "ACCEPTED" ||
        sectionContent === "APPROVED" ||
        sectionContent === "REVISION_MINOR" ||
        sectionContent === "REVISION_MAJOR" ||
        sectionContent === "REJECTED"
      ) {
        // backward-compat: ACCEPTED -> APPROVED for decision
        result.decisionOpt = (sectionContent === "ACCEPTED" ? "APPROVED" : sectionContent) as typeof result.decisionOpt;
      }
    } else if (sectionName === "CATATAN TAMBAHAN REVIEWER") {
      result.generalNotes = sectionContent;
    }
  }

  // If it does not match splitting syntax, treat the whole string as general notes
  if (parts.length <= 1) {
    result.generalNotes = serialized.trim();
  }

  return result;
};

// ─── Format & Design Helpers ──────────────────────────────────────────────────
const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

function scoreColor(val: number) {
  if (val >= 80) return "text-green-600";
  if (val >= 60) return "text-blue-500";
  if (val >= 40) return "text-yellow-500";
  if (val > 0) return "text-red-500";
  return "text-gray-400";
}

const getSliderFillColor = (value: number) => {
  if (value >= 80) return "#22c55e"; // green-500
  if (value >= 60) return "#3b82f6"; // blue-500
  if (value >= 40) return "#f59e0b"; // yellow-500
  return "#ef4444"; // red-500
};

const hasStoredReviewData = (review: ReviewHistoryItem) =>
  Boolean(
    review.score_perumusan !== null ||
    review.score_tinjauan !== null ||
    review.score_metode !== null ||
    review.score_anggaran !== null ||
    review.score_luaran !== null ||
    review.kekuatan_proposal ||
    review.kelemahan_proposal ||
    review.rekomendasi_akhir ||
    review.notes,
  );

const mapReviewToForm = (review: ReviewHistoryItem) => ({
  scores: {
    score_perumusan: review.score_perumusan ?? 0,
    score_tinjauan: review.score_tinjauan ?? 0,
    score_metode: review.score_metode ?? 0,
    score_anggaran: review.score_anggaran ?? 0,
    score_luaran: review.score_luaran ?? 0,
  },
  kekuatan: review.kekuatan_proposal ?? "",
  kelemahan: review.kelemahan_proposal ?? "",
  rekomendasi: review.rekomendasi_akhir ?? "",
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const proposalId = id ? parseInt(id, 10) : NaN;

  // ── Proposal data ─────────────────────────────────────────────────────────
  const [proposal, setProposal] = useState<AssignedProposal | null>(null);
  const [loadingProposal, setLoadingProposal] = useState(true);
  const [proposalError, setProposalError] = useState<string | null>(null);

  // ── Form State ────────────────────────────────────────────────────────────
  const [scores, setScores] = useState<Scores>(EMPTY_SCORES);
  const [commentPerumusan, setCommentPerumusan] = useState("");
  const [commentTinjauan, setCommentTinjauan] = useState("");
  const [commentMetode, setCommentMetode] = useState("");
  const [commentAnggaran, setCommentAnggaran] = useState("");
  const [commentLuaran, setCommentLuaran] = useState("");

  const [kekuatan, setKekuatan] = useState("");
  const [kelemahan, setKelemahan] = useState("");
  const [rekomendasi, setRekomendasi] = useState("");
  const [notes, setNotes] = useState("");
  const [decisionOption, setDecisionOption] = useState<"APPROVED" | "REVISION_MINOR" | "REVISION_MAJOR" | "REJECTED">("APPROVED");

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  const weightedScore =
    scores.score_perumusan * 0.20 +
    scores.score_tinjauan * 0.20 +
    scores.score_metode * 0.25 +
    scores.score_anggaran * 0.15 +
    scores.score_luaran * 0.20;

  // Checklist Validation Rules
  const isAllScoresFilled = Object.values(scores).every((v) => v > 0);
  const isAllIndicatorCommentsFilled =
    commentPerumusan.trim() !== "" &&
    commentTinjauan.trim() !== "" &&
    commentMetode.trim() !== "" &&
    commentAnggaran.trim() !== "" &&
    commentLuaran.trim() !== "";
  const isGeneralCommentsFilled =
    kekuatan.trim() !== "" &&
    kelemahan.trim() !== "" &&
    rekomendasi.trim() !== "";
  const isDecisionSelected = Boolean(decisionOption);

  const isFormValid =
    isAllScoresFilled &&
    isAllIndicatorCommentsFilled &&
    isGeneralCommentsFilled &&
    isDecisionSelected;

  // ── Auto-draft save (debounced) ───────────────────────────────────────────
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerDraftSave = useCallback(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(async () => {
      if (isNaN(proposalId)) return;
      try {
        const payload: EvaluatePayloadDraft = {
          is_draft: true,
          ...(scores.score_perumusan > 0
            ? { score_perumusan: scores.score_perumusan }
            : {}),
          ...(scores.score_tinjauan > 0
            ? { score_tinjauan: scores.score_tinjauan }
            : {}),
          ...(scores.score_metode > 0
            ? { score_metode: scores.score_metode }
            : {}),
          ...(scores.score_anggaran > 0
            ? { score_anggaran: scores.score_anggaran }
            : {}),
          ...(scores.score_luaran > 0
            ? { score_luaran: scores.score_luaran }
            : {}),
          ...(kekuatan.trim() ? { kekuatan_proposal: kekuatan } : {}),
          ...(kelemahan.trim() ? { kelemahan_proposal: kelemahan } : {}),
          ...(rekomendasi.trim() ? { rekomendasi_akhir: rekomendasi } : {}),
          notes: serializeNotes(
            {
              perumusan: commentPerumusan,
              tinjauan: commentTinjauan,
              metode: commentMetode,
              anggaran: commentAnggaran,
              luaran: commentLuaran,
            },
            decisionOption,
            notes
          ),
          status: decisionOption === "APPROVED" ? "ACCEPTED" : decisionOption === "REVISION_MINOR" || decisionOption === "REVISION_MAJOR" ? "REVISION" : (decisionOption as ReviewDecision),
        };
        await evaluateProposal(proposalId, payload);
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      } catch {
        // Silent fail for auto-save draft
      }
    }, 1500);
  }, [proposalId, scores, kekuatan, kelemahan, rekomendasi, notes, commentPerumusan, commentTinjauan, commentMetode, commentAnggaran, commentLuaran, decisionOption]);

  useEffect(() => {
    triggerDraftSave();
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [triggerDraftSave]);

  // ── Load proposal data ────────────────────────────────────────────────────
  useEffect(() => {
    if (isNaN(proposalId)) {
      setProposalError("ID proposal tidak valid.");
      setLoadingProposal(false);
      return;
    }

    const load = async () => {
      setLoadingProposal(true);
      try {
        const res = await getAssignedProposals({ page: 1 });
        let found = res.data.find((p) => p.id === proposalId) ?? null;

        if (!found && res.meta.totalPages > 1) {
          for (let pg = 2; pg <= res.meta.totalPages; pg++) {
            const next = await getAssignedProposals({ page: pg });
            found = next.data.find((p) => p.id === proposalId) ?? null;
            if (found) break;
          }
        }

        setProposal(found);
        if (!found)
          setProposalError("Proposal tidak ditemukan dalam tugas Anda.");
      } catch {
        setProposalError("Gagal memuat data proposal.");
      } finally {
        setLoadingProposal(false);
      }
    };

    load();
  }, [proposalId]);

  // Load Review History / Draft
  useEffect(() => {
    if (isNaN(proposalId) || !currentUser?.id) return;

    const loadDraft = async () => {
      try {
        const res = await getProposalReviews(proposalId);
        const myLatestReview = [...res.data]
          .filter((item) => item.reviewer.id === currentUser.id)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )[0];

        if (!myLatestReview || !hasStoredReviewData(myLatestReview)) return;

        const mapped = mapReviewToForm(myLatestReview);
        setScores(mapped.scores);
        setKekuatan(mapped.kekuatan);
        setKelemahan(mapped.kelemahan);
        setRekomendasi(mapped.rekomendasi);

        // Deserialize indicator comments, general notes & decision
        const deserialized = deserializeNotes(myLatestReview.notes || "");
        setCommentPerumusan(deserialized.comments.perumusan);
        setCommentTinjauan(deserialized.comments.tinjauan);
        setCommentMetode(deserialized.comments.metode);
        setCommentAnggaran(deserialized.comments.anggaran);
        setCommentLuaran(deserialized.comments.luaran);

        if (deserialized.decisionOpt) {
          setDecisionOption(deserialized.decisionOpt);
        } else if (myLatestReview.status) {
          // Fallback if not stored inside serialized notes yet
          const stat = myLatestReview.status;
          if (stat === "REVISION") {
            setDecisionOption("REVISION_MINOR");
          } else if (stat === "ACCEPTED") {
            setDecisionOption("APPROVED");
          } else {
            setDecisionOption(stat as "APPROVED" | "REJECTED");
          }
        }

        setNotes(deserialized.generalNotes);
        setDraftLoaded(true);
      } catch {
        // Silent catch for draft fallback
      }
    };

    void loadDraft();
  }, [proposalId, currentUser?.id]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const setScore = (key: ScoreKey, val: number) =>
    setScores((prev) => ({ ...prev, [key]: val }));

  const handleSaveDraft = async () => {
    if (isNaN(proposalId)) return;
    setIsSaving(true);
    setApiError(null);
    try {
      const payload: EvaluatePayloadDraft = {
        is_draft: true,
        ...scores,
        kekuatan_proposal: kekuatan,
        kelemahan_proposal: kelemahan,
        rekomendasi_akhir: rekomendasi,
        notes: serializeNotes(
          {
            perumusan: commentPerumusan,
            tinjauan: commentTinjauan,
            metode: commentMetode,
            anggaran: commentAnggaran,
            luaran: commentLuaran,
          },
          decisionOption,
          notes
        ),
        status: decisionOption === "APPROVED" ? "ACCEPTED" : decisionOption === "REVISION_MINOR" || decisionOption === "REVISION_MAJOR" ? "REVISION" : (decisionOption as ReviewDecision),
      };
      await evaluateProposal(proposalId, payload);
      setDraftSaved(true);
      setDraftLoaded(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Gagal menyimpan draft.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid || isNaN(proposalId)) return;
    setIsSubmitting(true);
    setApiError(null);
    try {
      const payload: EvaluatePayloadFinal = {
        is_draft: false,
        decision: decisionOption as "APPROVED" | "REJECTED" | "REVISION_MINOR" | "REVISION_MAJOR",
        status: decisionOption === "APPROVED" ? "ACCEPTED" : decisionOption === "REVISION_MINOR" || decisionOption === "REVISION_MAJOR" ? "REVISION" : (decisionOption as ReviewDecision),
        score_perumusan: scores.score_perumusan,
        score_tinjauan: scores.score_tinjauan,
        score_metode: scores.score_metode,
        score_anggaran: scores.score_anggaran,
        score_luaran: scores.score_luaran,
        kekuatan_proposal: kekuatan,
        kelemahan_proposal: kelemahan,
        rekomendasi_akhir: rekomendasi,
        notes: serializeNotes(
          {
            perumusan: commentPerumusan,
            tinjauan: commentTinjauan,
            metode: commentMetode,
            anggaran: commentAnggaran,
            luaran: commentLuaran,
          },
          decisionOption,
          notes
        ),
      };
      await evaluateProposal(proposalId, payload);
      setSubmitSuccess(true);
      setDraftLoaded(false);
      setTimeout(() => navigate(-1), 1800);
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Gagal mengirim penilaian.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loadingProposal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={28} className="animate-spin text-red-600" />
      </div>
    );
  }

  if (proposalError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle size={36} className="text-red-400" />
        <p className="text-gray-600">{proposalError}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm underline text-gray-500 hover:text-gray-700"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16 font-sans">
      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all font-semibold text-sm border border-gray-200 rounded-xl px-4 py-2 bg-white shadow-xs hover:shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Form Penilaian Proposal</h1>
            <p className="text-xs text-gray-400">Evaluasi proposal penelitian berdasarkan indikator penilaian LPPM.</p>
          </div>
        </div>

        {/* Buttons on Right */}
        <div className="flex items-center gap-3">
          {/* Draft Saved Text */}
          {draftSaved && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-xl animate-pulse font-medium">
              <CheckCircle2 size={14} /> Draft Tersimpan
            </span>
          )}

          {draftLoaded && !draftSaved && !submitSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl font-medium">
              <CheckCircle2 size={14} /> Draft Dimuat
            </span>
          )}

          {/* Simpan Draft */}
          <button
            id="btn-save-draft"
            onClick={handleSaveDraft}
            disabled={isSaving || isSubmitting || submitSuccess}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 shadow-xs disabled:opacity-50 transition-all duration-200"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin text-gray-500" />
            ) : (
              <Save size={16} className="text-gray-500" />
            )}
            Simpan Draft
          </button>

          {/* Submit Penilaian Final */}
          <button
            id="btn-submit-review"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting || submitSuccess}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-xs disabled:bg-gray-100 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Submit Penilaian Final
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        {/* Error API banner */}
        {apiError && (
          <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 mb-6 shadow-xs">
            <AlertCircle size={18} className="shrink-0" />
            <p className="font-semibold">{apiError}</p>
          </div>
        )}

        {/* Outer 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Proposal Details Card */}
            {proposal && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="space-y-1.5 flex-1 min-w-[280px]">
                    <h2 className="text-lg font-bold text-gray-900 leading-snug">
                      {proposal.title}
                    </h2>
                  </div>
                  <span className="shrink-0 bg-blue-50 text-blue-600 border border-blue-100 text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs">
                    {proposal.skema}
                  </span>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 bg-gray-50/70 border border-gray-100 rounded-xl p-4 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Ketua Peneliti</span>
                    <span className="font-bold text-gray-800 text-sm">{proposal.user.name}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Fakultas</span>
                    <span className="font-semibold text-gray-700 text-sm">{proposal.faculty}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Program Studi</span>
                    <span className="font-semibold text-gray-700 text-sm">{proposal.faculty}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Anggaran</span>
                    <span className="font-bold text-gray-800 text-sm">{formatCurrency(proposal.funding_request_amount)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tanggal Submit</span>
                    <span className="font-semibold text-gray-700 text-sm">{formatDate(proposal.submitted_at)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">N.S. Proposal</span>
                    <span className="font-semibold text-gray-700 text-sm">PROP-{String(proposal.id).padStart(3, '0')}</span>
                  </div>
                </div>

                {/* Abstrak */}
                <div className="space-y-2 border-t border-gray-100 pt-4 text-xs">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Abstrak</span>
                  <p className="text-sm text-gray-600 leading-relaxed text-justify">
                    Penggunaan teknologi Artificial Intelligence (AI) dalam bidang pertanian semakin berkembang pesat. Penelitian ini bertujuan untuk mengembangkan algoritma deteksi hama pada tanaman padi menggunakan metode Convolutional Neural Network (CNN). Diharapkan hasil penelitian ini dapat membantu petani di wilayah Cirebon dalam mendeteksi serangan hama secara dini dan meningkatkan produktivitas pertanian.
                  </p>
                </div>

                {/* Dokumen Lampiran */}
                <div className="space-y-3 border-t border-gray-100 pt-4 text-xs">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dokumen Lampiran</span>
                  <div className="flex flex-wrap gap-4">
                    {/* Proposal Link */}
                    {proposal.proposal_file_path && (
                      <div className="flex items-center gap-3 border border-gray-100 bg-[#fbfcfd] hover:bg-gray-50 px-4 py-3 rounded-xl shadow-xs transition-all flex-1 min-w-[240px]">
                        <div className="bg-red-50 p-2 rounded-lg text-red-500 shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-700 truncate">Proposal Penelitian (PDF)</p>
                          <p className="text-[10px] text-gray-400">Dokumen Utama</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={proposal.proposal_file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview File"
                          >
                            <Eye size={14} />
                          </a>
                          <a
                            href={proposal.proposal_file_path}
                            download
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Unduh File"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* RAB Link */}
                    {proposal.rab_file_path && (
                      <div className="flex items-center gap-3 border border-gray-100 bg-[#fbfcfd] hover:bg-gray-50 px-4 py-3 rounded-xl shadow-xs transition-all flex-1 min-w-[240px]">
                        <div className="bg-green-50 p-2 rounded-lg text-green-600 shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-700 truncate">RAB Detail (XLSX)</p>
                          <p className="text-[10px] text-gray-400">Rencana Anggaran Biaya</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={proposal.rab_file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview File"
                          >
                            <Eye size={14} />
                          </a>
                          <a
                            href={proposal.rab_file_path}
                            download
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Unduh File"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Penilaian Per Indikator */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <div className="p-1.5 rounded-lg bg-orange-50 text-orange-500 shrink-0">
                  <Star size={18} className="fill-orange-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Penilaian per Indikator</h2>
                  <p className="text-xs text-gray-400">Evaluasi usulan proposal penelitian berdasarkan 5 kriteria utama.</p>
                </div>
              </div>

              {/* List indicators */}
              <div className="space-y-6">
                {[
                  {
                    num: 1,
                    key: "score_perumusan" as const,
                    label: "Perumusan Masalah",
                    weight: "20%",
                    desc: "Kejelasan, urgensi, dan relevansi rumusan masalah penelitian.",
                    commentVal: commentPerumusan,
                    setComment: setCommentPerumusan,
                  },
                  {
                    num: 2,
                    key: "score_tinjauan" as const,
                    label: "Tinjauan Pustaka",
                    weight: "20%",
                    desc: "Kelengkapan referensi, kemutakhiran pustaka, dan relevansi tinjauan pustaka.",
                    commentVal: commentTinjauan,
                    setComment: setCommentTinjauan,
                  },
                  {
                    num: 3,
                    key: "score_metode" as const,
                    label: "Metode Penelitian",
                    weight: "25%",
                    desc: "Kesesuaian metode penelitian dengan tujuan dan luaran yang ditargetkan.",
                    commentVal: commentMetode,
                    setComment: setCommentMetode,
                  },
                  {
                    num: 4,
                    key: "score_anggaran" as const,
                    label: "Kelayakan Anggaran",
                    weight: "15%",
                    desc: "Kesesuaian anggaran terhadap aktivitas penelitian.",
                    commentVal: commentAnggaran,
                    setComment: setCommentAnggaran,
                  },
                  {
                    num: 5,
                    key: "score_luaran" as const,
                    label: "Luaran & Kontribusi",
                    weight: "20%",
                    desc: "Target luaran penelitian dan dampak serta kontribusi kepada masyarakat.",
                    commentVal: commentLuaran,
                    setComment: setCommentLuaran,
                  },
                ].map((ind) => {
                  const val = scores[ind.key];
                  const sliderColor = getSliderFillColor(val);
                  const trackBg = `linear-gradient(to right, ${sliderColor} 0%, ${sliderColor} ${val}%, #e2e8f0 ${val}%, #e2e8f0 100%)`;

                  return (
                    <div key={ind.num} className="border border-gray-100 bg-white rounded-xl p-5 hover:shadow-xs transition-all space-y-4">
                      
                      {/* Title Header */}
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {ind.num}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">
                            {ind.label} <span className="text-gray-400 font-normal text-xs ml-1">({ind.weight})</span>
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{ind.desc}</p>
                        </div>
                      </div>

                      {/* Slider Row */}
                      <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 pt-2">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nilai</div>

                        {/* Range input slider */}
                        <div className="md:col-span-2 space-y-2">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={val}
                            onChange={(e) => setScore(ind.key, Number(e.target.value))}
                            style={{ background: trackBg }}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-300 [&::-webkit-slider-thumb]:shadow-xs [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-300 [&::-moz-range-thumb]:cursor-pointer"
                          />
                          
                          {/* Guides Badges */}
                          <div className="flex justify-between items-center gap-2 pt-1 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${val < 40 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 text-gray-400 border border-transparent'}`}>
                              &lt;40 Kurang
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${val >= 40 && val < 60 ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' : 'bg-gray-50 text-gray-400 border border-transparent'}`}>
                              40-60 Cukup
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${val >= 60 && val < 80 ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-400 border border-transparent'}`}>
                              60-80 Baik
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${val >= 80 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-transparent'}`}>
                              &gt;80 Sangat Baik
                            </span>
                          </div>
                        </div>

                        {/* Large Value display */}
                        <div className="text-right flex items-baseline justify-end gap-1">
                          <span className={`text-2xl font-black ${scoreColor(val)}`}>{val}</span>
                          <span className="text-xs text-gray-300 font-bold">/ 100</span>
                        </div>
                      </div>

                      {/* Catatan Reviewer textarea */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Catatan Reviewer</span>
                          <span className="text-red-500 font-semibold text-[9px] uppercase">Wajib diisi</span>
                        </label>
                        <textarea
                          rows={3}
                          value={ind.commentVal}
                          onChange={(e) => ind.setComment(e.target.value)}
                          placeholder="Berikan komentar spesifik mengenai kriteria dan saran perbaikan..."
                          className="w-full border border-gray-100 bg-[#fdfefe] focus:bg-white rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent transition-all shadow-2xs"
                        />
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kesimpulan & Rekomendasi Reviewer */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-950">Kesimpulan &amp; Rekomendasi Reviewer</h2>
                <p className="text-xs text-gray-450">Bagian ini akan dikirim ke dosen sebagai bahan evaluasi.</p>
              </div>

              <div className="space-y-4">
                {/* Kekuatan Proposal */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                    <span>Kekuatan Proposal</span>
                    <span className="text-red-500 font-semibold text-[9px] uppercase">Wajib diisi</span>
                  </label>
                  <textarea
                    rows={3}
                    value={kekuatan}
                    onChange={(e) => setKekuatan(e.target.value)}
                    placeholder="Tuliskan keunggulan dan kekuatan proposal ini..."
                    className="w-full border border-gray-100 bg-[#fdfefe] focus:bg-white rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent transition-all shadow-2xs"
                  />
                </div>

                {/* Kelemahan / Perbaikan */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                    <span>Kelemahan / Perbaikan</span>
                    <span className="text-red-500 font-semibold text-[9px] uppercase">Wajib diisi</span>
                  </label>
                  <textarea
                    rows={3}
                    value={kelemahan}
                    onChange={(e) => setKelemahan(e.target.value)}
                    placeholder="Tuliskan bagian yang perlu diperbaiki oleh dosen pengusul..."
                    className="w-full border border-gray-100 bg-[#fdfefe] focus:bg-white rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent transition-all shadow-2xs"
                  />
                </div>

                {/* Rekomendasi Akhir */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                    <span>Rekomendasi Akhir</span>
                    <span className="text-red-500 font-semibold text-[9px] uppercase">Wajib diisi</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rekomendasi}
                    onChange={(e) => setRekomendasi(e.target.value)}
                    placeholder="Disetujui/Revisi/Layak dilanjutkan dengan catatan (bagasi metodologi dan referensi)..."
                    className="w-full border border-gray-100 bg-[#fdfefe] focus:bg-white rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent transition-all shadow-2xs"
                  />
                </div>

                {/* Catatan Internal Reviewer */}
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                      <span>Catatan Internal Reviewer</span>
                      <span className="text-gray-400 text-[9px] uppercase font-semibold">Opsional</span>
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Catatan internal reviewer (tidak tampil ke dosen pengusul)..."
                      className="w-full border border-gray-100 bg-[#fdfefe] focus:bg-white rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent transition-all shadow-2xs"
                    />
                  </div>
                  {/* Warning label */}
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50/70 border border-amber-100/60 rounded-xl px-4 py-2.5 shadow-3xs">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>Catatan ini hanya terlihat oleh pihak LPPM, tidak ditampilkan ke dosen pengusul.</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-6">
            
            {/* Ringkasan Penilaian */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
              <h2 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-3 uppercase tracking-wider">Ringkasan Penilaian</h2>
              
              {/* Scores breakdown */}
              <div className="space-y-3.5">
                {[
                  { label: "Perumusan Masalah", val: scores.score_perumusan, weight: "20%" },
                  { label: "Tinjauan Pustaka", val: scores.score_tinjauan, weight: "20%" },
                  { label: "Metode Penelitian", val: scores.score_metode, weight: "25%" },
                  { label: "Kelayakan Anggaran", val: scores.score_anggaran, weight: "15%" },
                  { label: "Luaran & Kontribusi", val: scores.score_luaran, weight: "20%" },
                ].map((itm, i) => {
                  const dynamicColor = getSliderFillColor(itm.val);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-semibold text-gray-500">{itm.label} <span className="text-[10px] text-gray-300 font-normal">({itm.weight})</span></span>
                        <span className={`font-bold ${scoreColor(itm.val)}`}>{itm.val}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${itm.val}%`, backgroundColor: dynamicColor }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Weighted Score */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nilai Akhir (Rata-rata Terbobot)</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900">{weightedScore.toFixed(1)}</span>
                  <span className="text-xs text-gray-400 font-bold">/ 100</span>
                </div>

                {/* Suitability Badge */}
                <div className="pt-1">
                  {weightedScore >= 70 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
                      🟢 Layak
                    </span>
                  ) : weightedScore >= 60 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-xl">
                      🟡 Perlu Revisi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
                      🔴 Tidak Layak
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Keputusan Review Final */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between uppercase tracking-wider">
                <span>Keputusan Review Final</span>
                <span className="text-red-500 font-black text-xs">*</span>
              </h2>

              <div className="space-y-3">
                {[
                  {
                    val: "APPROVED" as const,
                    label: "Diterima",
                    desc: "Proposal dapat langsung dilanjutkan tanpa revisi.",
                    activeColor: "ring-2 ring-green-500 border-green-500 bg-green-50/20 shadow-xs",
                  },
                  {
                    val: "REVISION_MINOR" as const,
                    label: "Revisi Minor",
                    desc: "Proposal dapat diterima setelah perbaikan kecil.",
                    activeColor: "ring-2 ring-yellow-500 border-yellow-500 bg-yellow-50/20 shadow-xs",
                  },
                  {
                    val: "REVISION_MAJOR" as const,
                    label: "Revisi Mayor",
                    desc: "Proposal membutuhkan perbaikan substansial sebelum diterima.",
                    activeColor: "ring-2 ring-orange-500 border-orange-500 bg-orange-50/20 shadow-xs",
                  },
                  {
                    val: "REJECTED" as const,
                    label: "Ditolak",
                    desc: "Proposal tidak memenuhi standar minimal untuk dilanjutkan.",
                    activeColor: "ring-2 ring-red-500 border-red-500 bg-red-50/20 shadow-xs",
                  },
                ].map((opt) => {
                  const active = decisionOption === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setDecisionOption(opt.val)}
                      className={`w-full text-left p-3.5 border rounded-xl transition-all duration-200 space-y-1 relative flex items-start gap-3 ${
                        active ? opt.activeColor : "border-gray-100 hover:border-gray-200 bg-white"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${active ? 'border-transparent bg-blue-600 text-white' : 'border-gray-300'}`}>
                        {active && <Check size={10} strokeWidth={4} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{opt.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Syarat Submit */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-3 uppercase tracking-wider">Syarat Submit</h2>
              
              <div className="space-y-3">
                {[
                  { label: "Semua indikator telah dinilai", met: isAllScoresFilled },
                  { label: "Semua catatan reviewer diisi", met: isAllIndicatorCommentsFilled },
                  { label: "Rekomendasi akhir diisi", met: isGeneralCommentsFilled },
                  { label: "Keputusan review dipilih", met: isDecisionSelected },
                ].map((chk, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs font-semibold">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                      chk.met ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-200 text-gray-300'
                    }`}>
                      <Check size={12} strokeWidth={chk.met ? 4 : 2} />
                    </div>
                    <span className={chk.met ? "text-gray-700" : "text-gray-400"}>{chk.label}</span>
                  </div>
                ))}
              </div>

              {/* Status Message */}
              <div className="pt-2">
                {isFormValid ? (
                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 shadow-2xs font-semibold font-sans">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>✓ Form Penilaian Siap Dikirim</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 shadow-2xs font-semibold font-sans">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>Lengkapi Form Terlebih Dahulu</span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
