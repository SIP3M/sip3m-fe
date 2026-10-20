import { useEffect, useState } from 'react';
import {
  Search,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  BookOpen,
} from 'lucide-react';

import { getKkmMonitoring } from './kkmMonitoring.api';
import type {
  GetKkmMonitoringResponse,
  KkmMonitoringFilters,
  KkmMonitoringMeta,
  KkmMonitoringPeriode,
  KkmMonitoringRow,
  KkmMonitoringStats,
  MonitoringStatus,
} from './kkmMonitoring.types';
import { getKkmPeriods } from './kkmPeriod.api';
import type { KkmPeriod } from './kkmPeriod.types';

// ==================== TYPES ====================

type IndikatorType = 'normal' | 'dpl-belum' | 'tidak-aktif' | 'logbook-kurang';
type TabType = 'semua' | 'aktif' | 'perhatian' | 'bermasalah' | 'selesai';

/** Enum BE -> key tampilan yang dipakai config warna di bawah. */
const indikatorKeyMap: Record<string, IndikatorType> = {
  NORMAL: 'normal',
  DPL_BELUM_MONITORING: 'dpl-belum',
  TIDAK_ADA_AKTIVITAS: 'tidak-aktif',
  LOGBOOK_KURANG: 'logbook-kurang',
};

const statusKeyMap: Record<TabType, MonitoringStatus | undefined> = {
  semua: undefined,
  aktif: 'AKTIF',
  perhatian: 'PERLU_PERHATIAN',
  bermasalah: 'BERMASALAH',
  selesai: 'SELESAI',
};

const EMPTY_STATS: KkmMonitoringStats = {
  total_kelompok: 0,
  kelompok_aktif: 0,
  perlu_perhatian: 0,
  bermasalah: 0,
  selesai: 0,
  rata_rata_progress: 0,
};

// ==================== CONFIG ====================

const indikatorConfig: Record<
  IndikatorType,
  { label: string; bg: string; text: string; Icon: typeof CheckCircle2 }
> = {
  normal: { label: 'Normal', bg: 'bg-green-50', text: 'text-green-600', Icon: CheckCircle2 },
  'dpl-belum': { label: 'DPL Blm. Monitoring', bg: 'bg-orange-50', text: 'text-orange-600', Icon: AlertTriangle },
  'tidak-aktif': { label: 'Tidak Ada Aktivitas', bg: 'bg-red-50', text: 'text-red-600', Icon: XCircle },
  'logbook-kurang': { label: 'Logbook Kurang', bg: 'bg-yellow-50', text: 'text-yellow-700', Icon: AlertTriangle },
};

const statusConfig: Record<
  'aktif' | 'perhatian' | 'bermasalah' | 'selesai',
  { label: string; bg: string; text: string; dot: string }
> = {
  aktif: { label: 'Aktif', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  perhatian: { label: 'Perlu Perhatian', bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  bermasalah: { label: 'Bermasalah', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  selesai: { label: 'Selesai', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
};

const progressBarColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-yellow-400';
  return 'bg-red-500';
};

const formatNumber = (value: number) => value.toLocaleString('id-ID');

// ==================== SUB COMPONENTS ====================

function StatCard({
  label,
  value,
  Icon,
  bg,
  border,
  iconColor,
  valueColor,
}: {
  label: string;
  value: string | number;
  Icon: typeof CheckCircle2;
  bg: string;
  border: string;
  iconColor: string;
  valueColor: string;
}) {
  return (
    <div className={`rounded-xl border ${border} ${bg} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0">
          <Icon size={14} className={iconColor} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}

function IndikatorBadge({ type, label }: { type: string; label: string }) {
  const c = indikatorConfig[indikatorKeyMap[type] ?? 'normal'];
  // Fallback aman: nilai tak dikenal -> tampilkan label dari BE apa adanya
  const known = Boolean(indikatorKeyMap[type]);
  const Icon = known ? c.Icon : AlertTriangle;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
        known ? `${c.bg} ${c.text}` : 'bg-gray-100 text-gray-600'
      }`}
    >
      <Icon size={13} />
      {known ? c.label : label}
    </span>
  );
}

function StatusBadge({ type, label }: { type: string; label: string }) {
  const key = type === 'AKTIF' ? 'aktif'
    : type === 'PERLU_PERHATIAN' ? 'perhatian'
    : type === 'BERMASALAH' ? 'bermasalah'
    : type === 'SELESAI' ? 'selesai'
    : null;
  const c = key ? statusConfig[key] : null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
        c ? `${c.bg} ${c.text}` : 'bg-gray-100 text-gray-600'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c ? c.dot : 'bg-gray-400'}`} />
      {c ? c.label : label}
    </span>
  );
}

/**
 * Bar persen + 8 segmen dekoratif.
 * Angka `progress` dan semua turunannya datang dari BE — segmen di sini
 * murni tampilan: jumlah segmen terisi = round(progress/8) dengan warna
 * yang sama seperti bar, sisanya abu-abu.
 */
function ProgressCell({ progress }: { progress: number }) {
  const barColor = progressBarColor(progress);
  const filled = Math.max(0, Math.min(8, Math.round((progress / 100) * 8)));
  return (
    <div className="min-w-[130px]">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-700 w-9 text-right">{progress}%</span>
      </div>
      <div className="flex items-center gap-1 mt-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < filled ? barColor : 'bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function MonitoringKKM() {
  const [rows, setRows] = useState<KkmMonitoringRow[]>([]);
  const [stats, setStats] = useState<KkmMonitoringStats>(EMPTY_STATS);
  const [filterOptions, setFilterOptions] = useState<KkmMonitoringFilters>({
    desa: [],
    dpl: [],
  });
  const [meta, setMeta] = useState<KkmMonitoringMeta | null>(null);
  const [periode, setPeriode] = useState<KkmMonitoringPeriode | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state — semua query opsional ke GET /kkm/monitoring
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('semua');
  const [periodeId, setPeriodeId] = useState<number | null>(null);
  const [desaFilter, setDesaFilter] = useState('');
  const [dplId, setDplId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // Opsi dropdown periode (sekali saat mount)
  const [periodes, setPeriodes] = useState<KkmPeriod[]>([]);
  useEffect(() => {
    let cancelled = false;
    const loadPeriodes = async () => {
      try {
        const res = await getKkmPeriods({ page: 1, limit: 100 });
        if (!cancelled) setPeriodes(res.data ?? []);
      } catch {
        // dropdown periode opsional — biarkan kosong
      }
    };
    void loadPeriodes();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounce pencarian (500ms) + reset halaman
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Ambil data monitoring
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res: GetKkmMonitoringResponse = await getKkmMonitoring({
          periode_id: periodeId ?? undefined,
          page,
          search: search || undefined,
          status: statusKeyMap[activeTab],
          desa: desaFilter || undefined,
          dpl_id: dplId ?? undefined,
        });
        if (cancelled) return;
        setRows(res.data);
        setStats(res.stats);
        setFilterOptions(res.filters);
        setMeta(res.meta);
        setPeriode(res.periode);
        // Pengaman: BE tidak meng-clamp page di luar range (page=999 → rows kosong
        // padahal totalData > 0) — tarik kembali ke halaman terakhir yang valid.
        if (res.meta.totalData > 0 && res.meta.currentPage > res.meta.totalPages) {
          setPage(res.meta.totalPages);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const e = err as {
          response?: { status?: number; data?: { message?: string } };
          message?: string;
        };
        const status = e.response?.status;
        setError(
          status === 403
            ? 'Akses ditolak — monitoring KKM hanya untuk ADMIN_LPPM / STAFF_LPPM.'
            : status === 404
              ? 'Periode tidak ditemukan.'
              : e.response?.data?.message ||
                e.message ||
                'Gagal memuat monitoring KKM.',
        );
        setRows([]);
        setMeta(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [periodeId, page, search, activeTab, desaFilter, dplId]);

  const counts = {
    semua: stats.total_kelompok,
    aktif: stats.kelompok_aktif,
    perhatian: stats.perlu_perhatian,
    bermasalah: stats.bermasalah,
    selesai: stats.selesai,
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'aktif', label: 'Aktif' },
    { key: 'perhatian', label: 'Perlu Perhatian' },
    { key: 'bermasalah', label: 'Bermasalah' },
    { key: 'selesai', label: 'Selesai' },
  ];

  const currentPage = meta?.currentPage ?? 1;
  const totalPages = meta?.totalPages ?? 1;
  const hasFilter = Boolean(
    search || activeTab !== 'semua' || desaFilter || dplId !== null,
  );

  const changeTab = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
  };

  const changePeriode = (value: string) => {
    setPeriodeId(value ? Number(value) : null);
    // Opsi desa/DPL ikut berubah per periode → reset filter turunannya
    setDesaFilter('');
    setDplId(null);
    setPage(1);
  };

  const changeDesa = (value: string) => {
    setDesaFilter(value);
    setPage(1);
  };

  const changeDpl = (value: string) => {
    setDplId(value ? Number(value) : null);
    setPage(1);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Monitoring KKM</h1>
        <p className="text-gray-500 text-sm mt-1">
          Pantau perkembangan dan progres setiap kelompok KKM secara real-time
        </p>
        {periode && (
          <p className="text-sm font-medium text-gray-700 mt-1.5">
            {periode.nama_periode} · T.A. {periode.tahun_akademik}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Kelompok Aktif"
          value={formatNumber(stats.kelompok_aktif)}
          Icon={CheckCircle2}
          bg="bg-green-50"
          border="border-green-100"
          iconColor="text-green-600"
          valueColor="text-green-600"
        />
        <StatCard
          label="Perlu Perhatian"
          value={formatNumber(stats.perlu_perhatian)}
          Icon={AlertTriangle}
          bg="bg-yellow-50"
          border="border-yellow-100"
          iconColor="text-yellow-600"
          valueColor="text-orange-600"
        />
        <StatCard
          label="Bermasalah"
          value={formatNumber(stats.bermasalah)}
          Icon={XCircle}
          bg="bg-red-50"
          border="border-red-100"
          iconColor="text-red-600"
          valueColor="text-red-600"
        />
        <StatCard
          label="Selesai"
          value={formatNumber(stats.selesai)}
          Icon={CheckCircle2}
          bg="bg-blue-50"
          border="border-blue-100"
          iconColor="text-blue-600"
          valueColor="text-blue-600"
        />
        <StatCard
          label="Rata-rata Progress"
          value={`${stats.rata_rata_progress}%`}
          Icon={Activity}
          bg="bg-purple-50"
          border="border-purple-100"
          iconColor="text-purple-600"
          valueColor="text-purple-600"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari kelompok, desa, DPL, atau mahasiswa..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            />
          </div>
          <div className="relative">
            <select
              value={periodeId ?? ''}
              onChange={(e) => changePeriode(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Periode aktif (otomatis)</option>
              {periodes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_periode}
                  {p.status === 'AKTIF' ? ' · AKTIF' : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={desaFilter}
              onChange={(e) => changeDesa(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Semua Desa</option>
              {filterOptions.desa.map((nama) => (
                <option key={nama} value={nama}>
                  {nama}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={dplId ?? ''}
              onChange={(e) => changeDpl(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Semua DPL</option>
              {filterOptions.dpl.map((dpl) => (
                <option key={dpl.id} value={dpl.id}>
                  {dpl.nama}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => changeTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeTab === tab.key
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Belum ada periode aktif */}
      {meta && !periode && !isLoading && (
        <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Belum ada periode aktif. Aktifkan satu periode KKM untuk melihat data
          monitoring.
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3">Kelompok</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Desa</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">DPL</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Logbook</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Tahapan</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Progress</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Indikator</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4" colSpan={8}>
                      <div className="h-5 animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center text-sm text-gray-400" colSpan={8}>
                    {!meta
                      ? error || 'Tidak ada data monitoring.'
                      : meta.totalData === 0
                        ? hasFilter
                          ? 'Tidak ada kelompok yang cocok dengan filter.'
                          : periode
                            ? 'Belum ada kelompok pada periode ini.'
                            : 'Belum ada data monitoring — belum ada periode aktif.'
                        : 'Halaman tidak tersedia — memuat ulang…'}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-800">{row.nama}</p>
                      <p className="text-xs text-gray-400">{row.jumlah_anggota} anggota</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{row.desa}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-700">{row.dpl.nama ?? '-'}</p>
                      <p className="text-xs text-gray-400">{row.dpl.terakhir ?? 'Belum pernah'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <BookOpen size={14} className="text-gray-400" />
                        {row.logbook.jumlah}
                        {row.logbook.delta > 0 && (
                          <span className="text-green-600 text-xs font-medium">(+{row.logbook.delta})</span>
                        )}
                        {row.logbook.delta < 0 && (
                          <span className="text-red-500 text-xs font-medium">({row.logbook.delta})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{row.tahapan_label}</td>
                    <td className="px-4 py-4">
                      <ProgressCell progress={row.progress} />
                    </td>
                    <td className="px-4 py-4">
                      <IndikatorBadge type={row.indikator} label={row.indikator_label} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge type={row.status} label={row.status_label} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Menampilkan <span className="font-semibold text-gray-700">{rows.length}</span> dari{' '}
              <span className="font-semibold text-gray-700">{formatNumber(meta.totalData)}</span> kelompok
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={isLoading || currentPage <= 1}
                className="px-3.5 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    disabled={isLoading || isActive}
                    className={`w-8 h-8 flex items-center justify-center text-sm font-semibold rounded-lg transition-colors ${
                      isActive
                        ? 'text-white bg-red-600'
                        : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={isLoading || currentPage >= totalPages}
                className="px-3.5 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
