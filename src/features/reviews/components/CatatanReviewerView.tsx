import React, { useMemo } from "react";
import {
  BarChart3,
  Users,
  Calendar,
  Sliders,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Lock,
} from "lucide-react";
import type { Proposal } from "@/features/proposals/proposal.types";
import type { ReviewHistoryItem } from "@/features/reviews/review.types";
import { getKetuaNama } from "@/utils/proposal";

export type TabKey = "informasi" | "tim" | "dokumen" | "riwayat" | "review";

interface CatatanReviewerViewProps {
  proposal: Proposal;
  latestReview?: ReviewHistoryItem | any | null;
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
  showTabs?: boolean;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "informasi", label: "Informasi Proposal" },
  { key: "tim", label: "Tim Peneliti" },
  { key: "dokumen", label: "Dokumen Proposal" },
  { key: "riwayat", label: "Riwayat Status" },
  { key: "review", label: "Catatan Reviewer" },
];

const DEFAULT_COMMENTS = {
  perumusan:
    "Rumusan masalah masih perlu diperjelas agar lebih spesifik dan memiliki keterkaitan yang kuat dengan tujuan penelitian. Permasalahan yang diangkat perlu didukung oleh data atau kondisi aktual yang lebih relevan pada studi kasus lahan pertanian padi di Kabupaten Cirebon.",
  tinjauan:
    "Referensi yang digunakan sudah mendukung topik penelitian, namun masih perlu ditambahkan beberapa sumber ilmiah terbaru, khususnya jurnal penelitian bereputasi nasional/internasional dalam lima tahun terakhir untuk mempertegas posisi kebaruan.",
  metode:
    "Metodologi penelitian telah dijelaskan dengan cukup baik dan sesuai dengan tujuan penelitian. Tahapan pelatihan model Convolutional Neural Network (CNN) dan metode komparasi yang digunakan sudah sangat relevan serta terstruktur.",
  anggaran:
    "Komponen anggaran telah disusun secara rinci dan secara umum sesuai dengan kebutuhan pelaksanaan penelitian di lapangan. Alokasi pembelian alat komputasi dan survei lapang proporsional.",
  luaran:
    "Target luaran penelitian masih perlu diperjelas. Proposal perlu menjelaskan bentuk luaran yang dihasilkan (jurnal SINTA target, HKI hak cipta program) serta kontribusinya secara konkret terhadap perkembangan keilmuan maupun manfaat nyata bagi komunitas petani lokal.",
  kekuatan:
    "Metodologi penelitian telah disusun dengan cukup baik dan memiliki kesesuaian dengan tujuan penelitian. Kelayakan anggaran juga telah disusun secara rinci dengan pos pembiayaan yang logis.",
  kelemahan:
    "Perumusan masalah perlu dibuat lebih spesifik, referensi perlu diperbarui dengan literatur 5 tahun terakhir, serta target luaran dan kontribusi penelitian wajib diperjelas dengan tolok ukur terukur.",
  rekomendasi:
    "Proposal dapat dilanjutkan ke tahap penetapan pendanaan setelah dilakukan perbaikan substansial pada bagian perumusan masalah, pemutakhiran tinjauan pustaka, serta penjabaran spesifik luaran dan kontribusi penelitian.",
  internal:
    "Proposal memiliki potensi untuk dikembangkan karena kebutuhan riil petani di daerah pantura Cirebon sangat tinggi, tetapi perlu dilakukan pengecekan kembali terhadap target luaran jurnal dan kesesuaian indikator kesiapan teknologi (TKT) sebelum penetapan SK penetapan akhir.",
};

const parseReviewNotes = (serialized?: string | null) => {
  const result = {
    comments: {
      perumusan: "",
      tinjauan: "",
      metode: "",
      anggaran: "",
      luaran: "",
    },
    decisionOpt: "" as string,
    generalNotes: "",
  };

  if (!serialized) return result;

  const parts = serialized.split(
    /^--- (CATATAN INDIKATOR|KEPUTUSAN OPTION|CATATAN TAMBAHAN REVIEWER) ---$/m,
  );
  for (let i = 1; i < parts.length; i += 2) {
    const sectionName = parts[i];
    const sectionContent = parts[i + 1] ? parts[i + 1].trim() : "";

    if (sectionName === "CATATAN INDIKATOR") {
      const pick = (label: string) => {
        const m = sectionContent.match(new RegExp(`${label}:\\s*(.*)`));
        if (!m) return "";
        const v = m[1].trim();
        return v === "-" ? "" : v;
      };
      result.comments.perumusan = pick("Perumusan Masalah");
      result.comments.tinjauan = pick("Tinjauan Pustaka");
      result.comments.metode = pick("Metode Penelitian");
      result.comments.anggaran = pick("Kelayakan Anggaran");
      result.comments.luaran = pick("Luaran & Kontribusi");
    } else if (sectionName === "KEPUTUSAN OPTION") {
      result.decisionOpt = sectionContent;
    } else if (sectionName === "CATATAN TAMBAHAN REVIEWER") {
      result.generalNotes = sectionContent;
    }
  }

  if (parts.length <= 1) {
    result.generalNotes = serialized.trim();
  }

  return result;
};

const getIndicatorMeta = (score: number, indKey: string) => {
  if (score >= 80) {
    return {
      statusText: "Sangat Baik",
      badgeColor: "bg-emerald-50 text-emerald-600 border border-emerald-200",
      textColor: "text-emerald-600",
      barColor: "bg-[#10b981]",
      borderColor: "border-l-[#10b981]",
      numBox: "border-[#10b981] text-[#10b981] bg-emerald-50/40",
      footerStatus:
        indKey === "anggaran" ? "Sesuai Anggaran" : "Memenuhi Standar",
      footerStatusColor: "text-emerald-600",
    };
  }
  if (score >= 60) {
    return {
      statusText: "Cukup",
      badgeColor: "bg-amber-50 text-amber-600 border border-amber-200",
      textColor: "text-amber-600",
      barColor: "bg-[#f59e0b]",
      borderColor: "border-l-[#f59e0b]",
      numBox: "border-[#f59e0b] text-[#f59e0b] bg-amber-50/40",
      footerStatus: "Penyempurnaan Disarankan",
      footerStatusColor: "text-amber-600",
    };
  }
  return {
    statusText: "Kurang",
    badgeColor: "bg-red-50 text-red-600 border border-red-200",
    textColor: "text-red-600",
    barColor: "bg-[#ef4444]",
    borderColor: "border-l-[#ef4444]",
    numBox: "border-[#ef4444] text-[#ef4444] bg-red-50/40",
    footerStatus: score < 15 ? "Wajib Revisi" : "Revisi Diperlukan",
    footerStatusColor: "text-red-600",
  };
};

export default function CatatanReviewerView({
  proposal,
  latestReview,
  activeTab = "review",
  onTabChange,
  showTabs = true,
}: CatatanReviewerViewProps) {
  const parsedNotes = useMemo(
    () => parseReviewNotes(latestReview?.notes),
    [latestReview?.notes],
  );

  // Scores resolution with fallback to reference mockup scores
  const scorePerumusan =
    typeof latestReview?.score_perumusan === "number"
      ? latestReview.score_perumusan
      : 17;
  const scoreTinjauan =
    typeof latestReview?.score_tinjauan === "number"
      ? latestReview.score_tinjauan
      : 65;
  const scoreMetode =
    typeof latestReview?.score_metode === "number"
      ? latestReview.score_metode
      : 94;
  const scoreAnggaran =
    typeof latestReview?.score_anggaran === "number"
      ? latestReview.score_anggaran
      : 100;
  const scoreLuaran =
    typeof latestReview?.score_luaran === "number"
      ? latestReview.score_luaran
      : 9;

  const computedTotalScore = useMemo(() => {
    if (typeof latestReview?.total_score === "number") {
      return latestReview.total_score;
    }
    return Number(
      (
        scorePerumusan * 0.2 +
        scoreTinjauan * 0.2 +
        scoreMetode * 0.25 +
        scoreAnggaran * 0.15 +
        scoreLuaran * 0.2
      ).toFixed(1),
    );
  }, [
    latestReview?.total_score,
    scorePerumusan,
    scoreTinjauan,
    scoreMetode,
    scoreAnggaran,
    scoreLuaran,
  ]);

  const displayTotalScore = computedTotalScore.toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  // Decision badge mapping
  const decisionBadge = useMemo(() => {
    const raw = (
      parsedNotes.decisionOpt ||
      latestReview?.status ||
      ""
    ).toUpperCase();
    if (raw === "REVISION_MAJOR") {
      return {
        label: "Revisi Mayor",
        color: "bg-red-100 text-red-700 border-red-200",
      };
    }
    if (raw === "REVISION_MINOR") {
      return {
        label: "Revisi Minor",
        color: "bg-amber-100 text-amber-700 border-amber-200",
      };
    }
    if (raw === "APPROVED" || raw === "ACCEPTED") {
      return {
        label: "Diterima / Lolos",
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      };
    }
    if (raw === "REJECTED") {
      return {
        label: "Ditolak",
        color: "bg-red-100 text-red-700 border-red-200",
      };
    }
    if (raw === "REVISION") {
      return {
        label: "Revisi Mayor",
        color: "bg-red-100 text-red-700 border-red-200",
      };
    }
    return {
      label: "Revisi Mayor",
      color: "bg-red-100 text-red-700 border-red-200",
    };
  }, [parsedNotes.decisionOpt, latestReview?.status]);

  // Format Dates
  const reviewCreatedAt = latestReview?.created_at
    ? new Date(latestReview.created_at)
    : new Date();

  const reviewDateLong = reviewCreatedAt.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const reviewDateOnly = reviewDateLong;

  const formatItemTimestamp = (offsetMinutes: number) => {
    const d = new Date(reviewCreatedAt.getTime() + offsetMinutes * 60000);
    const dateStr = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr}, ${timeStr} WIB`;
  };

  const tanggalPengajuan = useMemo(() => {
    const d = new Date(proposal.submitted_at || proposal.created_at);
    if (Number.isNaN(d.getTime())) return "15 Okt 2023";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [proposal.submitted_at, proposal.created_at]);

  const tahunProposal = useMemo(() => {
    const d = new Date(proposal.submitted_at || proposal.created_at);
    return !Number.isNaN(d.getTime()) ? d.getFullYear() : 2023;
  }, [proposal.submitted_at, proposal.created_at]);

  const docCode = useMemo(() => {
    const docYear = String(tahunProposal).slice(-2);
    return `PROP-${String(proposal.id).padStart(3, "0")}/UMC/${docYear}`;
  }, [proposal.id, tahunProposal]);

  const ketuaNama =
    getKetuaNama(
      proposal as unknown as {
        nama_ketua?: string | null;
        nidn_ketua?: string | null;
        user?: { name: string; nidn_nip?: string | null } | null;
      },
    ) || "Budi Peneliti, M.T.";

  const reviewerName = latestReview?.reviewer?.name || "Prof. Reviewer Santoso";

  // Indicators list configuration
  const indicators = [
    {
      num: "01",
      key: "perumusan",
      label: "Perumusan Masalah",
      subtitle: "Bobot: 20% | Parameter Identifikasi Masalah Riset",
      score: scorePerumusan,
      comment: parsedNotes.comments.perumusan || DEFAULT_COMMENTS.perumusan,
      timestamp: formatItemTimestamp(0),
      meta: getIndicatorMeta(scorePerumusan, "perumusan"),
    },
    {
      num: "02",
      key: "tinjauan",
      label: "Tinjauan Pustaka",
      subtitle: "Bobot: 20% | Kemutakhiran Pustaka & State of the Art",
      score: scoreTinjauan,
      comment: parsedNotes.comments.tinjauan || DEFAULT_COMMENTS.tinjauan,
      timestamp: formatItemTimestamp(3),
      meta: getIndicatorMeta(scoreTinjauan, "tinjauan"),
    },
    {
      num: "03",
      key: "metode",
      label: "Metode Penelitian",
      subtitle: "Bobot: 25% | Kesesuaian Desain & Prosedur Validasi Algoritma",
      score: scoreMetode,
      comment: parsedNotes.comments.metode || DEFAULT_COMMENTS.metode,
      timestamp: formatItemTimestamp(9),
      meta: getIndicatorMeta(scoreMetode, "metode"),
    },
    {
      num: "04",
      key: "anggaran",
      label: "Kelayakan Anggaran",
      subtitle: "Bobot: 15% | Realisme RAB & Kepatuhan Standar Biaya Masukan",
      score: scoreAnggaran,
      comment: parsedNotes.comments.anggaran || DEFAULT_COMMENTS.anggaran,
      timestamp: formatItemTimestamp(13),
      meta: getIndicatorMeta(scoreAnggaran, "anggaran"),
    },
    {
      num: "05",
      key: "luaran",
      label: "Luaran & Kontribusi",
      subtitle: "Bobot: 20% | Target Publikasi, HKI, & Dampak Sosial Petani",
      score: scoreLuaran,
      comment: parsedNotes.comments.luaran || DEFAULT_COMMENTS.luaran,
      timestamp: formatItemTimestamp(18),
      meta: getIndicatorMeta(scoreLuaran, "luaran"),
    },
  ];

  const kekuatanText =
    latestReview?.kekuatan_proposal?.trim() || DEFAULT_COMMENTS.kekuatan;
  const kelemahanText =
    latestReview?.kelemahan_proposal?.trim() || DEFAULT_COMMENTS.kelemahan;
  const rekomendasiText =
    latestReview?.rekomendasi_akhir?.trim() || DEFAULT_COMMENTS.rekomendasi;
  const internalNotesText =
    parsedNotes.generalNotes?.trim() || DEFAULT_COMMENTS.internal;

  const skemaText = proposal.skema
    ? proposal.skema.replace(/[_-]+/g, " ").toUpperCase()
    : "PENELITIAN TERAPAN";

  const fakultasText = proposal.faculty || "Teknik";
  const prodiText =
    (proposal.user as { program_studi?: string } | undefined)?.program_studi ||
    "Teknik Informatika";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-8 shadow-sm text-gray-900 font-sans">
      {/* ── Top Tabs Navigation (Matches Group 19.png) ── */}
      {showTabs && (
        <div className="flex flex-wrap items-center gap-2 pb-5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange?.(tab.key)}
                className={`rounded-full px-4 py-1.5 text-xs md:text-sm transition-all cursor-pointer ${
                  isActive
                    ? "border border-gray-400 bg-white font-semibold text-gray-900 shadow-2xs"
                    : "border border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60 font-medium"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Badges & LPPM Watermark ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-800">
            {skemaText}
          </span>
          <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            SKEMA: REGULER UMC {tahunProposal}/{Number(tahunProposal) + 1}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <CheckCircle2 size={15} className="text-gray-500" />
          <span>
            Sistem Informasi Riset LPPM Universitas Muhammadiyah Cirebon
          </span>
        </div>
      </div>

      {/* ── Proposal Title ── */}
      <h1 className="mt-4 text-xl md:text-2xl font-bold text-gray-900 leading-snug">
        {proposal.title}
      </h1>

      {/* ── 6-Column Metadata Row ── */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 border-b border-gray-100 pb-6">
        <div>
          <p className="text-xs text-gray-400 font-medium">Ketua Peneliti</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{ketuaNama}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium">Fakultas / Unit</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{fakultasText}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium">Program Studi</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{prodiText}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium">Nomor Dokumen</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{docCode}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium">Tanggal Pengajuan</p>
          <p className="mt-1 text-sm font-bold text-gray-900">
            {tanggalPengajuan}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium">Penilai Utama</p>
          <p className="mt-1 text-sm font-bold text-red-600">{reviewerName}</p>
        </div>
      </div>

      {/* ── Card: Ringkasan Hasil Review ── */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Ringkasan Hasil Review
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Hasil evaluasi proposal teragregasi berdasarkan seluruh indikator
              matriks penilaian baku LPPM.
            </p>
          </div>
          <span className="rounded-lg border border-gray-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
            5 Indikator Dinilai
          </span>
        </div>

        {/* Score banner box */}
        <div className="mt-4 rounded-xl border border-gray-100 bg-[#fafafa] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
                <BarChart3 size={24} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  SKOR KUMULATIF AKHIR
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl md:text-4xl font-extrabold text-red-600">
                    {displayTotalScore}
                  </span>
                  <span className="text-sm font-bold text-gray-400">/ 100</span>
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <span
                className={`inline-block rounded-md px-3.5 py-1 text-xs font-bold ${decisionBadge.color}`}
              >
                {decisionBadge.label}
              </span>
              <p className="mt-1 text-xs text-gray-400 font-medium">
                Batas Minimum Lolos: 70,0
              </p>
            </div>
          </div>
        </div>

        {/* Reviewer Meta info row */}
        <div className="mt-5 flex flex-wrap items-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-red-500" />
            <span>
              Reviewer:{" "}
              <strong className="font-semibold text-gray-800">
                {reviewerName}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-gray-400" />
            <span>
              Tanggal Review:{" "}
              <strong className="font-semibold text-gray-800">
                {reviewDateLong}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sliders size={15} className="text-gray-400" />
            <span>
              Kriteria Penilaian:{" "}
              <strong className="font-semibold text-gray-800">
                Penelitian Terapan v2.1
              </strong>
            </span>
          </div>
        </div>

        {/* Component breakdown progress bars */}
        <div className="mt-6">
          <p className="text-xs font-bold text-gray-900 mb-3">
            Rincian Nilai Komponen:
          </p>
          <div className="space-y-4">
            {indicators.map((ind, idx) => (
              <div key={ind.key}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-gray-800">
                    {idx + 1}. {ind.label}
                  </span>
                  <span className={`font-bold ${ind.meta.textColor}`}>
                    {ind.score} / 100
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${ind.meta.barColor}`}
                    style={{
                      width: `${Math.min(100, Math.max(0, ind.score))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section: Catatan Berdasarkan Indikator ── */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900">
          Catatan Berdasarkan Indikator
        </h2>
        <p className="mt-0.5 text-xs text-gray-500 mb-4">
          Evaluasi dan komentar terperinci yang diberikan reviewer pada setiap
          aspek rubrik proposal.
        </p>

        <div className="space-y-4">
          {indicators.map((ind) => (
            <div
              key={ind.key}
              className={`rounded-xl border border-gray-200 border-l-4 ${ind.meta.borderColor} bg-white p-5 shadow-2xs space-y-3`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold ${ind.meta.numBox}`}
                  >
                    {ind.num}
                  </span>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-gray-900">
                      {ind.label}
                    </h3>
                    <p className="text-xs text-gray-500">{ind.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded px-2.5 py-0.5 text-xs font-semibold ${ind.meta.badgeColor}`}
                  >
                    {ind.meta.statusText}
                  </span>
                  <span className={`text-sm font-bold ${ind.meta.textColor}`}>
                    {ind.score} / 100
                  </span>
                </div>
              </div>

              {/* Indicator comment box */}
              <div className="rounded-lg border border-slate-100 bg-[#f8fafc] p-4 text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {ind.comment}
              </div>

              {/* Indicator footer */}
              <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-gray-100 text-gray-500 gap-2">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock size={14} />
                  <span>Diberikan pada saat review - {ind.timestamp}</span>
                </div>
                <span className={`font-bold ${ind.meta.footerStatusColor}`}>
                  {ind.meta.footerStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2-Column Grid: Kekuatan & Hal yang Perlu Diperbaiki ── */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kekuatan Proposal */}
        <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <CheckCircle2
              size={18}
              className="text-emerald-600 fill-emerald-100"
            />
            <span>Kekuatan Proposal</span>
          </div>
          <div className="rounded-lg border border-emerald-100/70 bg-[#f0fdf4] p-4 text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {kekuatanText}
          </div>
        </div>

        {/* Hal yang Perlu Diperbaiki */}
        <div className="rounded-xl border border-amber-100 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <AlertTriangle
              size={18}
              className="text-amber-500 fill-amber-100"
            />
            <span>Hal yang Perlu Diperbaiki</span>
          </div>
          <div className="rounded-lg border border-amber-100/70 bg-[#fffbeb] p-4 text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {kelemahanText}
          </div>
        </div>
      </div>

      {/* ── Section: KESIMPULAN REVIEWER / Rekomendasi Akhir ── */}
      <div className="mt-6 rounded-xl border border-gray-200 border-l-4 border-l-red-600 bg-white p-5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              KESIMPULAN REVIEWER
            </p>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">
              Rekomendasi Akhir
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-red-600">
            <span className="h-2 w-2 rounded-full bg-red-600" />
            {decisionBadge.label}
          </span>
        </div>

        <div className="rounded-lg border border-slate-100 bg-[#f8fafc] p-4 text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {rekomendasiText}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-1.5 text-gray-600">
            <ShieldCheck size={16} className="text-red-600" />
            <span>
              Keputusan resmi diverifikasi oleh:{" "}
              <strong className="font-bold text-gray-900">{reviewerName}</strong>
            </span>
          </div>
          <span>
            Tanggal:{" "}
            <strong className="font-semibold text-gray-800">
              {reviewDateOnly}
            </strong>
          </span>
        </div>
      </div>

      {/* ── Section: Catatan Internal Reviewer ── */}
      <div className="mt-6 rounded-xl border border-indigo-200/70 bg-indigo-50/20 p-5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Lock size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Catatan Internal Reviewer
              </h4>
              <p className="text-xs text-gray-500">
                Hanya dapat dilihat oleh Reviewer dan Tim Komite LPPM UMC.
              </p>
            </div>
          </div>

          <span className="rounded border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600">
            INTERNAL - RAHASIA
          </span>
        </div>

        <p className="text-xs md:text-sm italic text-gray-700 leading-relaxed mt-2">
          “{internalNotesText}”
        </p>
      </div>
    </div>
  );
}
