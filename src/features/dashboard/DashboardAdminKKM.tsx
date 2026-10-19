import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  MapPin,
  UserPlus,
  AlertCircle,
  Clock,
} from "lucide-react";

import { getKkmDashboard } from "@/features/kkm/kkmDashboard.api";
import type {
  GetKkmDashboardResponse,
  KkmDashboardData,
} from "@/features/kkm/kkmDashboard.types";
import { getKkmPeriods } from "@/features/kkm/kkmPeriod.api";
import type { KkmPeriod } from "@/features/kkm/kkmPeriod.types";
import { getFakultas, getProdiByFakultas } from "@/features/auth/auth.api";

/** Warna bar (ikuti desain asli) — index-based, "Lainnya" selalu abu-abu */
const BAR_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
];

/** Warna donut status kelompok (definisi isi-vs-kuota, bukan lifecycle) */
const STATUS_DONUT: Record<string, { stroke: string; dot: string }> = {
  AKTIF: { stroke: "#22C55E", dot: "bg-green-500" },
  BELUM_LENGKAP: { stroke: "#EAB308", dot: "bg-yellow-500" },
  BERMASALAH: { stroke: "#3B82F6", dot: "bg-blue-500" },
};
const STATUS_DONUT_FALLBACK = [
  { stroke: "#22C55E", dot: "bg-green-500" },
  { stroke: "#EAB308", dot: "bg-yellow-500" },
  { stroke: "#3B82F6", dot: "bg-blue-500" },
];

const donutStyle = (status: string, index: number) =>
  STATUS_DONUT[status] || STATUS_DONUT_FALLBACK[index % 3];

export default function DashboardAdminKKM() {
  const [data, setData] = useState<KkmDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodeId, setPeriodeId] = useState<number | null>(null);
  const [periodes, setPeriodes] = useState<KkmPeriod[]>([]);

  // Pemetaan nama prodi (lowercase) -> nama fakultas, dari data master.
  // Dipakai untuk mengagregasi peserta_per_prodi menjadi 7 bar fakultas.
  const [prodiKeFakultas, setProdiKeFakultas] = useState<Map<string, string>>(
    new Map(),
  );

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res: GetKkmDashboardResponse = await getKkmDashboard(
        periodeId ?? undefined,
      );
      setData(res.data);
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
      };
      const status = e.response?.status;
      setError(
        status === 403
          ? "Akses ditolak — dashboard ini hanya untuk ADMIN_LPPM / STAFF_LPPM."
          : status === 404
            ? "Periode tidak ditemukan."
            : e.response?.data?.message || e.message || "Gagal memuat dashboard KKM.",
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodeId]);

  // Daftar periode untuk dropdown (sekali saat mount)
  useEffect(() => {
    let cancelled = false;
    const loadPeriodes = async () => {
      try {
        const res = await getKkmPeriods({ page: 1, limit: 100 });
        if (!cancelled) setPeriodes(res.data ?? []);
      } catch {
        // dropdown opsional — biarkan kosong
      }
    };
    void loadPeriodes();
    return () => {
      cancelled = true;
    };
  }, []);

  // Master fakultas + prodi (1 + N request, sekali saat mount)
  useEffect(() => {
    let cancelled = false;
    const loadMaster = async () => {
      try {
        const fakultasList = await getFakultas();
        const map = new Map<string, string>();
        await Promise.all(
          fakultasList.map(async (fak) => {
            try {
              const prodiList = await getProdiByFakultas(fak.id);
              prodiList.forEach((prodi) =>
                map.set(prodi.nama.trim().toLowerCase(), fak.nama),
              );
            } catch {
              // fakultas ini dilewati — prodi-nya jatuh ke "Lainnya"
            }
          }),
        );
        if (!cancelled && map.size > 0) setProdiKeFakultas(map);
      } catch {
        // master gagal → fallback menampilkan per prodi (lihat bawah)
      }
    };
    void loadMaster();
    return () => {
      cancelled = true;
    };
  }, []);

  /* --------------------------------------------------------------- */
  /* Turunan dari respons — tanpa menghitung status/progres di FE      */
  /* --------------------------------------------------------------- */

  const summary = data?.summary_cards;

  const stats = [
    {
      title: "Total Peserta KKM",
      value: summary?.total_peserta ?? 0,
      subtitle: "Mahasiswa",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Kelompok",
      value: summary?.total_kelompok ?? 0,
      subtitle: "Kelompok",
      icon: UserCheck,
      color: "bg-green-500",
    },
    {
      title: "Total Desa Penempatan",
      value: summary?.total_desa ?? 0,
      subtitle: "Desa",
      icon: MapPin,
      color: "bg-purple-500",
    },
    {
      title: "Total DPL",
      value: summary?.total_dpl ?? 0,
      subtitle: "Dosen",
      icon: UserPlus,
      color: "bg-orange-500",
    },
    {
      title: "Belum Mendapat Kelompok",
      value: summary?.belum_dapat_kelompok ?? 0,
      subtitle: "Mahasiswa",
      icon: AlertCircle,
      color: "bg-red-500",
    },
    {
      title: "Menunggu Verifikasi",
      value: summary?.menunggu_verifikasi ?? 0,
      subtitle: "Peserta",
      icon: Clock,
      color: "bg-yellow-500",
    },
  ];

  // Bar fakultas: agregasi peserta_per_prodi per fakultas (7 bar).
  // Bila pemetaan master belum/tidak tersedia → tampil per prodi apa adanya.
  const fakultasBars = useMemo(() => {
    const source = data?.peserta_per_prodi ?? [];
    if (source.length === 0) return [];

    if (prodiKeFakultas.size === 0) {
      return source.map((item) => ({ name: item.nama, count: item.jumlah }));
    }

    const buckets = new Map<string, number>();
    let lainnya = 0;
    source.forEach(({ nama, jumlah }) => {
      const fak = prodiKeFakultas.get(nama.trim().toLowerCase());
      if (fak) {
        buckets.set(fak, (buckets.get(fak) ?? 0) + jumlah);
      } else {
        lainnya += jumlah;
      }
    });

    const rows = [...buckets.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    if (lainnya > 0) rows.push({ name: "Lainnya", count: lainnya });
    return rows;
  }, [data, prodiKeFakultas]);

  const maxFakultas = Math.max(1, ...fakultasBars.map((row) => row.count));

  // Donut status kelompok — selalu 3 entri dari BE (jumlah boleh 0)
  const statusData = data?.status_kelompok ?? [];
  const totalStatus = statusData.reduce((sum, s) => sum + s.jumlah, 0);
  const circumference = 2 * Math.PI * 40;
  let cumulativeOffset = 0;

  // Desa: 10 teratas + baris catatan untuk sisanya
  const desaRows = (data?.distribusi_per_desa ?? []).slice(0, 10);
  const sisaDesa = Math.max(0, (data?.distribusi_per_desa ?? []).length - 10);
  const sisaMahasiswa = (data?.distribusi_per_desa ?? [])
    .slice(10)
    .reduce((sum, d) => sum + d.jumlah, 0);
  const maxDesa = Math.max(1, ...desaRows.map((row) => row.jumlah));
  const desaTicks = [0, 1, 2, 3, 4].map((i) =>
    Math.round((maxDesa * i) / 4),
  );

  const formatNumber = (value: number) => value.toLocaleString("id-ID");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard KKM</h1>
          {data?.periode ? (
            <p className="text-sm font-medium text-gray-700 mt-1">
              {data.periode.nama_periode} · T.A. {data.periode.tahun_akademik}
            </p>
          ) : null}
          <p className="text-gray-500 text-sm">
            Monitoring pelaksanaan Kuliah Kerja Mahasiswa (KKM)
          </p>
        </div>

        {/* Ganti periode → kirim ulang ?periode_id=<id> */}
        <select
          value={periodeId ?? ""}
          onChange={(event) =>
            setPeriodeId(event.target.value ? Number(event.target.value) : null)
          }
          disabled={isLoading && periodes.length === 0}
          className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer disabled:opacity-60"
        >
          <option value="">Periode aktif (otomatis)</option>
          {periodes.map((periode) => (
            <option key={periode.id} value={periode.id}>
              {periode.nama_periode} ({periode.tahun_akademik})
              {periode.status === "AKTIF" ? " · AKTIF" : ""}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {data && !data.periode && (
        <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Belum ada periode aktif. Aktifkan satu periode KKM untuk melihat
          data dashboard.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
        </div>
      ) : (
        <>
          {/* Stats Grid - 2 rows x 3 columns */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.slice(0, 3).map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {formatNumber(stat.value)}
                      </p>
                      <p className="text-xs text-gray-400">{stat.subtitle}</p>
                    </div>
                    <div className={`${stat.color} p-2.5 rounded-lg`}>
                      <Icon size={18} className="text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.slice(3, 6).map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {formatNumber(stat.value)}
                      </p>
                      <p className="text-xs text-gray-400">{stat.subtitle}</p>
                    </div>
                    <div className={`${stat.color} p-2.5 rounded-lg`}>
                      <Icon size={18} className="text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Row - 2 columns (Fakultas & Status) */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Peserta Berdasarkan Fakultas (agregasi dari peserta_per_prodi) */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                Peserta Berdasarkan Fakultas
              </h3>
              {fakultasBars.length === 0 ? (
                <p className="text-xs text-gray-400">Belum ada data peserta.</p>
              ) : (
                <div className="space-y-2.5">
                  {fakultasBars.map((row, index) => {
                    const percentage = (row.count / maxFakultas) * 100;
                    const color =
                      row.name === "Lainnya"
                        ? "bg-gray-500"
                        : BAR_COLORS[index % BAR_COLORS.length];
                    return (
                      <div key={row.name}>
                        <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                          <span>{row.name}</span>
                          <span>{formatNumber(row.count)} Mahasiswa</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`${color} h-1.5 rounded-full transition-all duration-700`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status Kelompok KKM — derive isi-vs-kuota, selalu 3 entri */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                Status Kelompok KKM
              </h3>
              <div className="flex items-center gap-6">
                {/* Donut Chart */}
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-28 h-28">
                    {/* lingkaran dasar di bawah, agar segmen warna tidak tertimpa */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#F3F4F6"
                      strokeWidth="12"
                    />
                    {totalStatus > 0 &&
                      statusData.map((status, index) => {
                        const percentage = (status.jumlah / totalStatus) * 100;
                        const offset =
                          circumference * (1 - percentage / 100) + cumulativeOffset;
                        cumulativeOffset +=
                          circumference * (percentage / 100);
                        return (
                          <circle
                            key={status.status}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={donutStyle(status.status, index).stroke}
                            strokeWidth="12"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="origin-center -rotate-90 transition-all duration-700"
                          />
                        );
                      })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-lg font-bold text-gray-800">
                        {formatNumber(totalStatus)}
                      </span>
                      <p className="text-[8px] text-gray-400 -mt-0.5">Total</p>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2">
                  {statusData.map((status, index) => (
                    <div
                      key={status.status}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            donutStyle(status.status, index).dot
                          }`}
                        />
                        <span className="text-xs text-gray-600">
                          {status.label}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-gray-800">
                        {formatNumber(status.jumlah)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Distribusi Mahasiswa per Desa - Full width at bottom */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Distribusi Mahasiswa per Desa
            </h3>
            {desaRows.length === 0 ? (
              <p className="text-xs text-gray-400">Belum ada data desa.</p>
            ) : (
              <>
                <div className="space-y-2.5">
                  {desaRows.map((desa) => {
                    const percentage = (desa.jumlah / maxDesa) * 100;
                    return (
                      <div key={desa.nama}>
                        <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                          <span>{desa.nama}</span>
                          <span>{formatNumber(desa.jumlah)} Mahasiswa</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {sisaDesa > 0 && (
                  <p className="mt-3 text-[10px] text-gray-400 text-right">
                    +{sisaDesa} desa lainnya ({formatNumber(sisaMahasiswa)}{" "}
                    mahasiswa)
                  </p>
                )}

                <div className="mt-3 text-[10px] text-gray-400 text-right">
                  {desaTicks.join(" | ")}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
