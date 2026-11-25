import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  Inbox,
  RotateCcw,
  Lock,
} from "lucide-react";
import {
  getAdminVerificationStats,
  type AdminVerificationStats,
} from "./adminVerification.api";

const EMPTY_STATS: AdminVerificationStats = {
  antrean: 0,
  belum_diklaim: 0,
  diklaim_saya: 0,
  revisi: 0,
  lolos_hari_ini: 0,
  total_lolos: 0,
};

const getErrorMessage = (err: unknown, fallback: string) =>
  axios.isAxiosError(err)
    ? err.response?.data?.message || err.message || fallback
    : err instanceof Error
      ? err.message
      : fallback;

export default function AdminVerificationDashboard() {
  const [stats, setStats] = useState<AdminVerificationStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAdminVerificationStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            getErrorMessage(err, "Gagal memuat statistik verifikasi administrasi."),
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      label: "Antrean Verifikasi",
      value: stats.antrean,
      note: "SUBMITTED + revisi administrasi",
      icon: Inbox,
      tone: "text-blue-600 bg-blue-50",
    },
    {
      label: "Belum Diklaim",
      value: stats.belum_diklaim,
      note: "Siap diambil siapa pun",
      icon: ClipboardList,
      tone: "text-amber-600 bg-amber-50",
    },
    {
      label: "Diklaim Saya",
      value: stats.diklaim_saya,
      note: "Sedang Anda periksa",
      icon: Lock,
      tone: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Menunggu Revisi",
      value: stats.revisi,
      note: "Dikembalikan ke pengusul",
      icon: RotateCcw,
      tone: "text-red-600 bg-red-50",
    },
    {
      label: "Lolos Hari Ini",
      value: stats.lolos_hari_ini,
      note: "Keputusan verifikator",
      icon: CheckCircle2,
      tone: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Total Lolos",
      value: stats.total_lolos,
      note: "Sejak role ini aktif",
      icon: Clock,
      tone: "text-gray-600 bg-gray-100",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Verifikasi Administrasi
        </h1>
        <p className="text-sm text-gray-500">
          Gerbang pemeriksaan kelengkapan berkas sebelum proposal masuk tahap
          penugasan reviewer substansi.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {isLoading ? "—" : card.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{card.note}</p>
                </div>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}
                >
                  <Icon size={18} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link
          to="/reviewer-administrasi-dashboard/antrean"
          className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-red-200"
        >
          <div>
            <p className="font-semibold text-gray-900">Antrean Verifikasi</p>
            <p className="text-sm text-gray-500">
              Ambil proposal, periksa checklist, lalu putuskan.
            </p>
          </div>
          <ArrowRight className="text-red-500" size={18} />
        </Link>

        <Link
          to="/reviewer-administrasi-dashboard/riwayat"
          className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-red-200"
        >
          <div>
            <p className="font-semibold text-gray-900">Riwayat Verifikasi</p>
            <p className="text-sm text-gray-500">
              Semua keputusan administrasi yang sudah tercatat.
            </p>
          </div>
          <ArrowRight className="text-red-500" size={18} />
        </Link>
      </div>
    </div>
  );
}
