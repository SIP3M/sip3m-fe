import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  FileText,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { evaluateProposal, getAssignedProposals } from "@/features/reviews/review.api";
import type {
  AssignedProposal,
  EvaluatePayloadDraft,
  EvaluatePayloadFinal,
  ReviewDecision,
} from "@/features/reviews/review.types";

// ─── Score criteria ────────────────────────────────────────────────────────────
const CRITERIA = [
  {
    key: "score_perumusan" as const,
    label: "Perumusan Masalah",
    weight: "20%",
    desc: "Kejelasan & relevansi rumusan masalah",
  },
  {
    key: "score_tinjauan" as const,
    label: "Tinjauan Pustaka",
    weight: "20%",
    desc: "Kebaruan dan kelengkapan referensi",
  },
  {
    key: "score_metode" as const,
    label: "Metode Penelitian",
    weight: "25%",
    desc: "Kesesuaian dan kejelasan metodologi",
  },
  {
    key: "score_anggaran" as const,
    label: "Kelayakan Anggaran",
    weight: "15%",
    desc: "Kewajaran dan rincian anggaran",
  },
  {
    key: "score_luaran" as const,
    label: "Luaran & Kontribusi",
    weight: "20%",
    desc: "Target luaran dan dampak penelitian",
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

// ─── Score Color ───────────────────────────────────────────────────────────────
function scoreColor(val: number) {
  if (val >= 85) return "text-green-600";
  if (val >= 70) return "text-yellow-500";
  if (val > 0) return "text-red-500";
  return "text-gray-400";
}

// ─── Score Slider Input ────────────────────────────────────────────────────────
function ScoreInput({
  label,
  weight,
  desc,
  name,
  value,
  onChange,
  disabled,
}: {
  label: string;
  weight: string;
  desc: string;
  name: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  // Build a CSS gradient that fills the track up to the thumb position
  const fillColor = value >= 85 ? "#22c55e" : value >= 70 ? "#eab308" : value > 0 ? "#ef4444" : "#d1d5db";
  const sliderBackground = `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="ml-2 text-xs text-gray-400">({weight})</span>
        </div>
        <span className={`text-lg font-bold ${scoreColor(value)}`}>{value}</span>
      </div>
      <p className="text-xs text-gray-400">{desc}</p>
      <input
        id={`score-${name}`}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        style={{ background: sliderBackground }}
        className="w-full h-2.5 rounded-full appearance-none cursor-pointer disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-400 [&::-moz-range-thumb]:cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-300">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const proposalId = id ? parseInt(id, 10) : NaN;

  // ── Proposal data ─────────────────────────────────────────────────────────
  const [proposal, setProposal] = useState<AssignedProposal | null>(null);
  const [loadingProposal, setLoadingProposal] = useState(true);
  const [proposalError, setProposalError] = useState<string | null>(null);

  // ── Form state ────────────────────────────────────────────────────────────
  const [scores, setScores] = useState<Scores>(EMPTY_SCORES);
  const [kekuatan, setKekuatan] = useState("");
  const [kelemahan, setKelemahan] = useState("");
  const [rekomendasi, setRekomendasi] = useState("");
  const [notes, setNotes] = useState("");
  const [decision, setDecision] = useState<ReviewDecision>("ACCEPTED");
  const [showDecision, setShowDecision] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── Computed ──────────────────────────────────────────────────────────────
  const avgScore =
    Object.values(scores).reduce((a, b) => a + b, 0) / CRITERIA.length;

  const isFormValid =
    kekuatan.trim() &&
    kelemahan.trim() &&
    rekomendasi.trim() &&
    Object.values(scores).every((v) => v > 0);

  // ── Auto-draft save (debounced) ───────────────────────────────────────────
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerDraftSave = useCallback(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(async () => {
      if (isNaN(proposalId)) return;
      try {
        const payload: EvaluatePayloadDraft = {
          is_draft: true,
          ...(scores.score_perumusan > 0 ? { score_perumusan: scores.score_perumusan } : {}),
          ...(scores.score_tinjauan > 0 ? { score_tinjauan: scores.score_tinjauan } : {}),
          ...(scores.score_metode > 0 ? { score_metode: scores.score_metode } : {}),
          ...(scores.score_anggaran > 0 ? { score_anggaran: scores.score_anggaran } : {}),
          ...(scores.score_luaran > 0 ? { score_luaran: scores.score_luaran } : {}),
          ...(kekuatan.trim() ? { kekuatan_proposal: kekuatan } : {}),
          ...(kelemahan.trim() ? { kelemahan_proposal: kelemahan } : {}),
          ...(rekomendasi.trim() ? { rekomendasi_akhir: rekomendasi } : {}),
          ...(notes.trim() ? { notes } : {}),
        };
        await evaluateProposal(proposalId, payload);
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      } catch {
        // Silent fail for auto-save draft
      }
    }, 1500);
  }, [proposalId, scores, kekuatan, kelemahan, rekomendasi, notes]);

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
        // Fetch the specific proposal from the assigned list
        const res = await getAssignedProposals({ page: 1 });
        // Find in all pages — for simplicity we search within returned data
        // (a dedicated GET /proposals/:id endpoint would be cleaner)
        let found = res.data.find((p) => p.id === proposalId) ?? null;

        // Try paginated search if not on first page
        if (!found && res.meta.totalPages > 1) {
          for (let pg = 2; pg <= res.meta.totalPages; pg++) {
            const next = await getAssignedProposals({ page: pg });
            found = next.data.find((p) => p.id === proposalId) ?? null;
            if (found) break;
          }
        }

        setProposal(found);
        if (!found) setProposalError("Proposal tidak ditemukan dalam tugas Anda.");
      } catch {
        setProposalError("Gagal memuat data proposal.");
      } finally {
        setLoadingProposal(false);
      }
    };

    load();
  }, [proposalId]);

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
        notes,
        status: decision,
      };
      await evaluateProposal(proposalId, payload);
      setDraftSaved(true);
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
        status: decision,
        score_perumusan: scores.score_perumusan,
        score_tinjauan: scores.score_tinjauan,
        score_metode: scores.score_metode,
        score_anggaran: scores.score_anggaran,
        score_luaran: scores.score_luaran,
        kekuatan_proposal: kekuatan,
        kelemahan_proposal: kelemahan,
        rekomendasi_akhir: rekomendasi,
        ...(notes.trim() ? { notes } : {}),
      };
      await evaluateProposal(proposalId, payload);
      setSubmitSuccess(true);
      setTimeout(() => navigate(-1), 1800);
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Gagal mengirim penilaian.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Decision config ───────────────────────────────────────────────────────
  const DECISION_OPTIONS: { value: ReviewDecision; label: string; color: string }[] = [
    { value: "ACCEPTED", label: "Diterima", color: "text-green-600 bg-green-50 border-green-200" },
    { value: "REVISION", label: "Revisi", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    { value: "REJECTED", label: "Ditolak", color: "text-red-600 bg-red-50 border-red-200" },
  ];

  const selectedDecision = DECISION_OPTIONS.find((d) => d.value === decision)!;

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
    <div className="bg-gray-50 min-h-screen p-6">

      {/* ── HEADER ── */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 mb-2 flex items-center gap-1 hover:text-gray-700"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            Form Penilaian Proposal
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            #{proposalId} &bull;{" "}
            {proposal?.title ?? "Memuat..."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Draft saved indicator */}
          {draftSaved && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 size={14} /> Draft tersimpan
            </span>
          )}

          {/* Save Draft */}
          <button
            id="btn-save-draft"
            onClick={handleSaveDraft}
            disabled={isSaving || isSubmitting || submitSuccess}
            className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Simpan Draft
          </button>

          {/* Submit */}
          <button
            id="btn-submit-review"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting || submitSuccess}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : submitSuccess ? (
              <CheckCircle2 size={14} />
            ) : (
              <Send size={14} />
            )}
            {submitSuccess ? "Berhasil!" : "Submit Penilaian"}
          </button>
        </div>
      </div>

      {/* ── API Error ── */}
      {apiError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={16} />
          {apiError}
        </div>
      )}

      {/* ── CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── LEFT: Proposal Info + Text Fields ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Proposal Card */}
          {proposal && (
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <h2 className="font-semibold text-gray-800 flex-1">
                  {proposal.title}
                </h2>
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                  {proposal.skema}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Ketua Peneliti</p>
                  <p className="font-medium text-gray-700">{proposal.user.name}</p>
                  <p className="text-xs text-gray-400">{proposal.user.nidn_nip}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Fakultas</p>
                  <p className="font-medium text-gray-700">{proposal.faculty}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Anggaran</p>
                  <p className="font-medium text-gray-700">
                    {formatCurrency(proposal.funding_request_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Tanggal Submit</p>
                  <p className="font-medium text-gray-700">
                    {formatDate(proposal.submitted_at)}
                  </p>
                </div>
              </div>

              {/* File Links */}
              <div className="mt-4 flex gap-2 flex-wrap">
                {proposal.proposal_file_path && (
                  <a
                    href={proposal.proposal_file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <FileText size={14} /> Proposal.pdf
                  </a>
                )}
                {proposal.rab_file_path && (
                  <a
                    href={proposal.rab_file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <FileText size={14} /> RAB.pdf
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Kekuatan, Kelemahan, Rekomendasi, Notes */}
          <div className="bg-white p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-700 text-sm">
              Komentar &amp; Rekomendasi
            </h3>

            {[
              {
                id: "kekuatan",
                label: "Kekuatan Proposal",
                placeholder: "Uraikan kelebihan dan keunggulan proposal ini...",
                value: kekuatan,
                onChange: setKekuatan,
                required: true,
              },
              {
                id: "kelemahan",
                label: "Kelemahan / Saran Perbaikan",
                placeholder: "Uraikan kelemahan dan saran perbaikan...",
                value: kelemahan,
                onChange: setKelemahan,
                required: true,
              },
              {
                id: "rekomendasi",
                label: "Rekomendasi Akhir",
                placeholder: "Tuliskan rekomendasi akhir Anda...",
                value: rekomendasi,
                onChange: setRekomendasi,
                required: true,
              },
              {
                id: "notes",
                label: "Catatan Tambahan (Opsional)",
                placeholder: "Catatan internal reviewer (tidak tampil ke peneliti)...",
                value: notes,
                onChange: setNotes,
                required: false,
              },
            ].map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <textarea
                  id={field.id}
                  rows={3}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Scoring Panel ── */}
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-700 text-sm mb-4">
              Indikator Penilaian
            </h3>

            <div className="space-y-5">
              {CRITERIA.map((c) => (
                <ScoreInput
                  key={c.key}
                  name={c.key}
                  label={c.label}
                  weight={c.weight}
                  desc={c.desc}
                  value={scores[c.key]}
                  onChange={(v) => setScore(c.key, v)}
                />
              ))}
            </div>

            {/* Total Score */}
            <div className="mt-5 border-t pt-4">
              <div className="flex justify-between items-baseline">
                <p className="text-sm text-gray-500">Rata-rata Skor</p>
                <p className={`text-2xl font-bold ${scoreColor(avgScore)}`}>
                  {avgScore.toFixed(1)}
                </p>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full mt-2">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-red-500 to-green-500 transition-all"
                  style={{ width: `${avgScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 text-right">
                {avgScore >= 85
                  ? "Sangat Baik"
                  : avgScore >= 70
                  ? "Baik / Perlu Revisi"
                  : avgScore > 0
                  ? "Kurang"
                  : "Belum dinilai"}
              </p>
            </div>
          </div>

          {/* Decision Picker */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">
              Keputusan Review <span className="text-red-500">*</span>
            </h3>

            <div className="relative">
              <button
                id="btn-decision-toggle"
                type="button"
                onClick={() => setShowDecision((v) => !v)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${selectedDecision.color}`}
              >
                {selectedDecision.label}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${showDecision ? "rotate-180" : ""}`}
                />
              </button>

              {showDecision && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 overflow-hidden">
                  {DECISION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      id={`btn-decision-${opt.value.toLowerCase()}`}
                      onClick={() => {
                        setDecision(opt.value);
                        setShowDecision(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors ${
                        decision === opt.value ? "bg-gray-50" : ""
                      } ${opt.color.split(" ")[0]}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Keputusan hanya berlaku saat Submit Final. Draft tidak mengubah
              status proposal.
            </p>
          </div>

          {/* Validation hint */}
          {!isFormValid && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
              <p className="font-medium mb-1">Syarat Submit Final:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {Object.values(scores).some((v) => v === 0) && (
                  <li>Semua skor harus lebih dari 0</li>
                )}
                {!kekuatan.trim() && <li>Kekuatan proposal wajib diisi</li>}
                {!kelemahan.trim() && <li>Kelemahan proposal wajib diisi</li>}
                {!rekomendasi.trim() && <li>Rekomendasi akhir wajib diisi</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}