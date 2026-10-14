import { useState } from "react";
import {
  Search,
  ChevronDown,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

// ==================== TYPES ====================

type StatusLaporan = "menunggu-review" | "disetujui" | "revisi" | "terlambat";

interface LaporanFile {
  name: string;
  size: string;
  version: string;
}

interface LaporanRow {
  id: number;
  kelompok: string;
  desa: string;
  jenis: string;
  file: LaporanFile | null;
  deadline: string;
  deadlineNote?: { text: string; type: "warning" | "danger" };
  status: StatusLaporan;
}

// ==================== DATA ====================

const LAPORAN_DATA: LaporanRow[] = [
  {
    id: 1,
    kelompok: "Kelompok 01",
    desa: "Astanajapura",
    jenis: "Laporan Awal",
    file: { name: "laporan_awal_kel01.pdf", size: "2.4 MB", version: "V1" },
    deadline: "10 Feb 2026",
    status: "disetujui",
  },
  {
    id: 2,
    kelompok: "Kelompok 01",
    desa: "Astanajapura",
    jenis: "Laporan Mingguan",
    file: { name: "laporan_minggu1_kel01.pdf", size: "1.8 MB", version: "V1" },
    deadline: "14 Feb 2026",
    deadlineNote: { text: "Deadline Besok", type: "warning" },
    status: "menunggu-review",
  },
  {
    id: 3,
    kelompok: "Kelompok 02",
    desa: "Palimanan",
    jenis: "Laporan Awal",
    file: { name: "laporan_awal_kel02.pdf", size: "1.2 MB", version: "V2" },
    deadline: "10 Feb 2026",
    deadlineNote: { text: "Deadline Besok", type: "warning" },
    status: "revisi",
  },
  {
    id: 4,
    kelompok: "Kelompok 02",
    desa: "Palimanan",
    jenis: "Laporan Mingguan",
    file: null,
    deadline: "14 Feb 2026",
    deadlineNote: { text: "Terlambat", type: "danger" },
    status: "terlambat",
  },
  {
    id: 5,
    kelompok: "Kelompok 03",
    desa: "Gempol",
    jenis: "Laporan Awal",
    file: { name: "laporan_awal_kel03.pdf", size: "3.1 MB", version: "V1" },
    deadline: "10 Feb 2026",
    deadlineNote: { text: "Terlambat", type: "danger" },
    status: "terlambat",
  },
  {
    id: 6,
    kelompok: "Kelompok 04",
    desa: "Ciwaringin",
    jenis: "Laporan Akhir",
    file: { name: "laporan_akhir_kel04.pdf", size: "5.2 MB", version: "V1" },
    deadline: "28 Feb 2026",
    status: "disetujui",
  },
];

// ==================== CONFIG ====================

const statusConfig: Record<
  StatusLaporan,
  { label: string; bg: string; text: string; Icon: typeof Clock }
> = {
  "menunggu-review": {
    label: "Menunggu Review",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    Icon: Clock,
  },
  disetujui: {
    label: "Disetujui",
    bg: "bg-green-50",
    text: "text-green-700",
    Icon: CheckCircle2,
  },
  revisi: {
    label: "Revisi",
    bg: "bg-red-50",
    text: "text-red-600",
    Icon: RotateCcw,
  },
  terlambat: {
    label: "Terlambat",
    bg: "bg-orange-50",
    text: "text-orange-600",
    Icon: AlertTriangle,
  },
};

// ==================== SUB COMPONENTS ====================

function StatCard({
  label,
  value,
  Icon,
  iconColor,
}: {
  label: string;
  value: number;
  Icon: typeof Clock;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        <Icon size={16} className={iconColor} />
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function LaporanKKMDosen() {
  const [activeTab, setActiveTab] = useState<"semua" | StatusLaporan>("semua");
  const [search, setSearch] = useState("");

  const counts: Record<StatusLaporan, number> = {
    "menunggu-review": LAPORAN_DATA.filter((d) => d.status === "menunggu-review").length,
    disetujui: LAPORAN_DATA.filter((d) => d.status === "disetujui").length,
    revisi: LAPORAN_DATA.filter((d) => d.status === "revisi").length,
    terlambat: LAPORAN_DATA.filter((d) => d.status === "terlambat").length,
  };

  const tabs = [
    { key: "semua" as const, label: "Semua", count: LAPORAN_DATA.length },
    { key: "menunggu-review" as const, label: "Menunggu Review", count: counts["menunggu-review"] },
    { key: "disetujui" as const, label: "Disetujui", count: counts.disetujui },
    { key: "revisi" as const, label: "Revisi", count: counts.revisi },
    { key: "terlambat" as const, label: "Terlambat", count: counts.terlambat },
  ];

  const filteredData = LAPORAN_DATA.filter((row) => {
    const matchTab = activeTab === "semua" || row.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      q === "" ||
      row.kelompok.toLowerCase().includes(q) ||
      row.jenis.toLowerCase().includes(q) ||
      (row.file?.name.toLowerCase().includes(q) ?? false);
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan KKM</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review dan supervisi laporan kelompok bimbingan
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
          Export
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Menunggu Review"
              value={counts["menunggu-review"]}
              Icon={Clock}
              iconColor="text-yellow-500"
            />
            <StatCard
              label="Disetujui"
              value={counts.disetujui}
              Icon={CheckCircle2}
              iconColor="text-green-500"
            />
            <StatCard
              label="Revisi"
              value={counts.revisi}
              Icon={RotateCcw}
              iconColor="text-red-500"
            />
            <StatCard
              label="Terlambat"
              value={counts.terlambat}
              Icon={AlertTriangle}
              iconColor="text-orange-500"
            />
          </div>

          {/* Search + tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="relative mb-3">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kelompok, jenis laporan, atau nama file..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    activeTab === tab.key
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                      KELOMPOK
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                      JENIS LAPORAN
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                      FILE
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                      DEADLINE
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                      STATUS
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                      AKSI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => {
                    const cfg = statusConfig[row.status];
                    const Icon = cfg.Icon;
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-gray-800">{row.kelompok}</p>
                          <p className="text-xs text-gray-400">{row.desa}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                            {row.jenis}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {row.file ? (
                            <div>
                              <p className="text-sm text-gray-700">{row.file.name}</p>
                              <p className="text-xs text-gray-400">
                                {row.file.size} • {row.file.version}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Belum upload</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-600">{row.deadline}</p>
                          {row.deadlineNote && (
                            <p
                              className={`text-xs mt-0.5 ${
                                row.deadlineNote.type === "danger"
                                  ? "text-red-500"
                                  : "text-orange-500"
                              }`}
                            >
                              {row.deadlineNote.text}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
                          >
                            <Icon size={12} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <Eye size={15} />
                            </button>
                            {row.file && (
                              <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Download size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Menampilkan{" "}
                <span className="font-semibold text-gray-700">{filteredData.length}</span> dari{" "}
                <span className="font-semibold text-gray-700">{LAPORAN_DATA.length}</span> laporan
              </p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Perlu Perhatian</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-gray-700">Kelompok 03 belum upload Laporan Mingguan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-gray-700">Kelompok 02 revisi belum diperbaiki · 3 hari</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-gray-700">Deadline Laporan Akhir: 28 Februari 2026</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
