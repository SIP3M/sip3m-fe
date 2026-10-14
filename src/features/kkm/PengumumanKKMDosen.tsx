import { useState } from "react";
import { Plus, X } from "lucide-react";

// ==================== TYPES ====================

type BadgeType = "Jadwal" | "Deadline" | "Informasi";

interface Pengumuman {
  id: number;
  badge: BadgeType;
  title: string;
  body: string;
  date: string;
  target: string;
}

interface FormState {
  judul: string;
  kategori: BadgeType;
  isi: string;
  target: string;
}

// ==================== DATA ====================

const INITIAL_PENGUMUMAN: Pengumuman[] = [
  {
    id: 1,
    badge: "Jadwal",
    title: "Monitoring Lapangan Minggu Ini",
    body: "Jadwal monitoring lapangan akan dilaksanakan hari Jumat, 14 Feb 2026 pukul 09.00 WIB. Semua anggota kelompok wajib hadir.",
    date: "12 Feb 2026",
    target: "Semua Kelompok",
  },
  {
    id: 2,
    badge: "Deadline",
    title: "Deadline Logbook Minggu Ini",
    body: "Logbook mingguan harus diupload paling lambat Minggu, 16 Feb 2026 pukul 23.59 WIB.",
    date: "10 Feb 2026",
    target: "Semua Kelompok",
  },
  {
    id: 3,
    badge: "Informasi",
    title: "Persiapan Presentasi Akhir KKM",
    body: "Presentasi akhir KKM dijadwalkan pada 5 Maret 2026. Kelompok diminta mempersiapkan materi presentasi dan laporan akhir.",
    date: "01 Feb 2026",
    target: "Semua Kelompok",
  },
];

const badgeConfig: Record<BadgeType, string> = {
  Jadwal: "bg-blue-50 text-blue-600",
  Deadline: "bg-red-50 text-red-600",
  Informasi: "bg-green-50 text-green-600",
};

// ==================== MAIN COMPONENT ====================

export default function PengumumanKKMDosen() {
  const [items, setItems] = useState<Pengumuman[]>(INITIAL_PENGUMUMAN);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    judul: "",
    kategori: "Informasi",
    isi: "",
    target: "Semua Kelompok",
  });

  const handlePublish = () => {
    if (!form.judul.trim() || !form.isi.trim()) return;
    const newItem: Pengumuman = {
      id: items.length + 1,
      badge: form.kategori,
      title: form.judul.trim(),
      body: form.isi.trim(),
      date: "Hari ini",
      target: form.target,
    };
    setItems((prev) => [newItem, ...prev]);
    setForm({ judul: "", kategori: "Informasi", isi: "", target: "Semua Kelompok" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengumuman</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kirim pengumuman kepada kelompok bimbingan
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={16} />
          Tambah Pengumuman
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
              <span
                className={`shrink-0 inline-block px-2.5 py-1 rounded-full text-xs font-medium ${badgeConfig[item.badge]}`}
              >
                {item.badge}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{item.body}</p>
            <p className="text-xs text-gray-400">
              {item.date} • Target: {item.target}
            </p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Tambah Pengumuman</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Judul
                </label>
                <input
                  type="text"
                  value={form.judul}
                  onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
                  placeholder="Judul pengumuman"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kategori
                </label>
                <select
                  value={form.kategori}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, kategori: e.target.value as BadgeType }))
                  }
                  className="w-full appearance-none px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="Informasi">Informasi</option>
                  <option value="Jadwal">Jadwal</option>
                  <option value="Deadline">Deadline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Isi Pengumuman
                </label>
                <textarea
                  value={form.isi}
                  onChange={(e) => setForm((f) => ({ ...f, isi: e.target.value }))}
                  placeholder="Tulis isi pengumuman..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Target
                </label>
                <select
                  value={form.target}
                  onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
                  className="w-full appearance-none px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="Semua Kelompok">Semua Kelompok</option>
                  <option value="Kelompok 01">Kelompok 01</option>
                  <option value="Kelompok 02">Kelompok 02</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Publikasikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
