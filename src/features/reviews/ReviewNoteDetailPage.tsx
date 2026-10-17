import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  ChevronRight,
  Clock,
  FileText,
  ListChecks,
  MessageSquare,
  ShieldAlert,
  Users2,
} from "lucide-react";
import { getProposalById } from "@/features/proposals/proposal.api";
import { getProposalReviews } from "@/features/reviews/review.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { APP_ROLES } from "@/constant/roles";
import type { Proposal } from "@/features/proposals/proposal.types";
import type { ReviewHistoryItem } from "@/features/reviews/review.types";

// ─── Parsing notes (mirrors ProposalDetail / ReviewDetailPage) ───────────────
type ParsedNotes = {
  comments: {
    perumusan: string;
    tinjauan: string;
    metode: string;
    anggaran: string;
    luaran: string;
  };
  generalNotes: string;
};

const parseReviewNotes = (
  serialized: string | null | undefined,
): ParsedNotes => {
  const result: ParsedNotes = {
    comments: {
      perumusan: "",
      tinjauan: "",
      metode: "",
      anggaran: "",
      luaran: "",
    },
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
    } else if (name === "CATATAN TAMBAHAN REVIEWER") {
      result.generalNotes = content;
    }
  }
  if (parts.length <= 1) result.generalNotes = serialized.trim();
  return result;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDateID = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const scoreColor = (v: number) => {
  if (v >= 80) return "text-green-600";
  if (v >= 60) return "text-blue-500";
  if (v >= 40) return "text-yellow-500";
  return "text-red-500";
};

const scoreBadge = (v: number) => {
  if (v >= 80) return "bg-green-50 border-green-200 text-green-700";
  if (v >= 60) return "bg-blue-50 border-blue-200 text-blue-700";
  if (v >= 40) return "bg-yellow-50 border-yellow-200 text-yellow-700";
  return "bg-red-50 border-red-200 text-red-700";
};

const decisionLabel = (status?: string | null) => {
  const s = (status || "").toUpperCase();
  if (s === "ACCEPTED") return "Diterima";
  if (s === "REJECTED") return "Ditolak";
  if (s === "REVISION" || s === "REVISION_MINOR" || s === "REVISION_MAJOR")
    return "Revisi";
  return "-";
};

const decisionStyle = (status?: string | null) => {
  const s = (status || "").toUpperCase();
  if (s === "ACCEPTED") return "bg-green-50 border-green-200 text-green-700";
  if (s === "REJECTED") return "bg-red-50 border-red-200 text-red-700";
  if (s === "REVISION" || s === "REVISION_MINOR" || s === "REVISION_MAJOR")
    return "bg-orange-50 border-orange-200 text-orange-700";
  return "bg-gray-50 border-gray-200 text-gray-600";
};

const INDICATOR_ROWS: {
  key: keyof Pick<
    ReviewHistoryItem,
    "score_perumusan" | "score_tinjauan" | "score_metode" | "score_anggaran" | "score_luaran"
  >;
  commentKey: keyof ParsedNotes["comments"];
  label: string;
  num: string;
}[] = [
  { key: "score_perumusan", commentKey: "perumusan", label: "Perumusan Masalah", num: "01" },
  { key: "score_tinjauan", commentKey: "tinjauan", label: "Tinjauan Pustaka", num: "02" },
  { key: "score_metode", commentKey: "metode", label: "Metode Penelitian", num: "03" },
  { key: "score_anggaran", commentKey: "anggaran", label: "Kelayakan Anggaran", num: "04" },
  { key: "score_luaran", commentKey: "luaran", label: "Luaran & Kontribusi", num: "05" },
];

export default function ReviewNoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const proposalId = id ? Number(id) : NaN;
  const user = useAuthStore((state) => state.user);
  const isLppm = user?.roles?.roles === APP_ROLES.ADMIN_LPPM;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [latestReview, setLatestReview] = useState<ReviewHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(proposalId) || proposalId <= 0) {
      setError("ID proposal tidak valid.");
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const [propRes, reviewRes] = await Promise.all([
          getProposalById(proposalId),
          getProposalReviews(proposalId),
        ]);
        setProposal(propRes.data);

        const reviews = reviewRes.data || [];
        const sorted = [...reviews].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setLatestReview(sorted[0] || null);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Gagal memuat catatan reviewer.",
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [proposalId]);

  const parsed = useMemo(() => parseReviewNotes(latestReview?.notes), [
    latestReview?.notes,
  ]);

  const totalScore = latestReview?.total_score ?? null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-24 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600">{error || "Data catatan reviewer tidak ditemukan."}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center gap-2 text-sm underline text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
        </div>
      </div>
    );
  }

  const dosenNama = proposal.user?.name ?? "-";
  const dosenNidn = proposal.user?.nidn_nip ?? "-";
  const reviewerName = latestReview?.reviewer?.name ?? "Tim Reviewer";
  const reviewDate = latestReview?.created_at
    ? new Date(latestReview.created_at).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6">
      {/* ── Header navigasi ── */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke Detail Proposal
        </button>
      </div>

      {/* ── Step indicator ── */}
      <div className="mb-6 flex flex-wrap gap-1 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
        <span>Informasi Proposal</span>
        <ChevronRight size={14} className="mx-1" />
        <span>Tim Penilaian</span>
        <ChevronRight size={14} className="mx-1" />
        <span>Kolom Proposal</span>
        <ChevronRight size={14} className="mx-1" />
        <span>Hasil Penilaian</span>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-red-600">Catatan Reviewer</span>
      </div>

      {/* ── Judul & meta proposal ── */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
          Penilaian Terhadap
        </p>
        <p className="text-[10px] text-gray-400 mb-1">
          {proposal.skema ? proposal.skema.replace(/_/g, " ") : "-"}
        </p>
        <h1 className="text-xl font-bold text-gray-900 leading-snug mb-3">
          {proposal.title}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Ketua Peneliti
            </p>
            <p className="text-sm font-semibold text-gray-800">{dosenNama}</p>
            <p className="text-[11px] text-gray-500">{dosenNidn}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Fakultas / Prodi
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {proposal.faculty || "-"} / {proposal.faculty || "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Tanggal Pengajuan
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {formatDateID(proposal.submitted_at)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Penilai Reviewer
            </p>
            <p className="text-sm font-semibold text-gray-800">{reviewerName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Tanggal Penilaian
            </p>
            <p className="text-sm font-semibold text-gray-800">{reviewDate}</p>
          </div>
        </div>
      </div>

      {/* ── Skor kumulatif akhir ── */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Bob Kumulatif Akhir
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-black text-gray-900">
                {totalScore !== null ? totalScore.toFixed(1) : "-"}
              </span>
              <span className="text-sm font-bold text-gray-500">/ 100</span>
            </div>
            {latestReview?.status && (
              <span className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-bold border ${decisionStyle(latestReview.status)}`}>
                {decisionLabel(latestReview.status)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Kartu indikator penilaian ── */}
      <div className="mb-6 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Indikator Penilaian
        </p>
        {INDICATOR_ROWS.map((ind) => {
          const score = latestReview?.[ind.key] ?? null;
          const comment =
            parsed.comments[ind.commentKey]?.trim() ||
            "-";
          const hasComment = comment !== "";
          return (
            <div
              key={ind.num}
              className="rounded-xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
                    {ind.num}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {ind.label}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded border ${scoreBadge(score ?? 0)}`}
                >
                  Skor: {score ?? "-"}/100
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {hasComment ? comment : "-"}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Catatan perbaikan / kelemahan ── */}
      {latestReview?.kelemahan_proposal && (
        <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
              Catatan Perbaikan / Kelemahan
            </p>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {latestReview.kelemahan_proposal}
          </p>
        </div>
      )}

      {/* ── Rekomendasi akhir ── */}
      {latestReview?.rekomendasi_akhir && (
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-gray-400" />
            <p className="text-xs font-bold uppercase tracking-wide text-gray-700">
              Rekomendasi Akhir
            </p>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {latestReview.rekomendasi_akhir}
          </p>
          <p className="mt-2 text-[11px] text-gray-500 font-semibold">
            {reviewDate}
          </p>
        </div>
      )}

      {/* ── Catatan internal reviewer (hanya LPPM) ── */}
      {isLppm && parsed.generalNotes && (
        <div className="mb-8 rounded-xl border border-red-100 bg-red-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={16} className="text-red-600" />
            <p className="text-xs font-bold uppercase tracking-wide text-red-800">
              Catatan Internal Reviewer
            </p>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-red-600 border border-red-200 bg-red-50 px-2 py-0.5 rounded">
              Internal - Rahasia
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {parsed.generalNotes}
          </p>
        </div>
      )}

      {!isLppm && parsed.generalNotes && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={16} className="text-gray-400" />
            <p className="text-xs font-bold uppercase tracking-wide text-gray-700">
              Catatan Tambahan Reviewer
            </p>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {parsed.generalNotes}
          </p>
        </div>
      )}

      {/* ── Info tambahan ── */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 shadow-sm">
        <p className="text-[11px] text-blue-700 leading-relaxed">
          Halaman ini menampilkan hasil penilaian reviewer untuk proposal
          "{proposal.title}". Jika statusnya memerlukan revisi, silakan perbaiki
          proposal melalui menu Proposal Saya dan submit kembali.
        </p>
      </div>
    </div>
  );
}
