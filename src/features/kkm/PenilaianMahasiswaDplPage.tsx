import { useEffect, useState } from "react";
import {
  Award,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  Save,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";
import {
  bulkUpsertPenilaian,
  getPenilaianBimbingan,
  upsertPenilaianPeserta,
} from "./penilaian.api";
import type {
  PenilaianBimbinganResponse,
  PesertaPenilaianItem,
} from "./penilaian.types";

const BOBOT = {
  kehadiran: 0.15,
  keaktifan: 0.15,
  logbook: 0.20,
  program_kerja: 0.20,
  laporan: 0.20,
  sikap: 0.10,
};

function hitungNilaiDanGrade(item: {
  kehadiran: number;
  keaktifan: number;
  logbook: number;
  program_kerja: number;
  laporan: number;
  sikap: number;
}) {
  const akhir =
    Number(item.kehadiran || 0) * BOBOT.kehadiran +
    Number(item.keaktifan || 0) * BOBOT.keaktifan +
    Number(item.logbook || 0) * BOBOT.logbook +
    Number(item.program_kerja || 0) * BOBOT.program_kerja +
    Number(item.laporan || 0) * BOBOT.laporan +
    Number(item.sikap || 0) * BOBOT.sikap;

  const rounded = Math.round(akhir * 10) / 10;
  let grade = "E";
  if (rounded >= 85) grade = "A";
  else if (rounded >= 75) grade = "B";
  else if (rounded >= 65) grade = "C";
  else if (rounded >= 50) grade = "D";

  return { nilai_akhir: rounded, grade };
}

export default function PenilaianMahasiswaDplPage() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PenilaianBimbinganResponse | null>(null);
  const [pesertaList, setPesertaList] = useState<PesertaPenilaianItem[]>([]);
  const [selectedKelompok, setSelectedKelompok] = useState<number | "all">("all");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getPenilaianBimbingan();
      setData(res);
      setPesertaList(res.peserta);
    } catch (err: any) {
      console.error("[GET_PENILAIAN_DPL_ERROR]", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (
    pesertaId: number,
    field: keyof PesertaPenilaianItem["penilaian"],
    val: string,
  ) => {
    const num = Math.max(0, Math.min(100, Number(val) || 0));
    setPesertaList((prev) =>
      prev.map((p) => {
        if (p.peserta_id !== pesertaId) return p;
        const nextPenilaian = { ...p.penilaian, [field]: num };
        const { nilai_akhir, grade } = hitungNilaiDanGrade(nextPenilaian);
        return {
          ...p,
          penilaian: {
            ...nextPenilaian,
            nilai_akhir,
            grade,
            is_saved: false,
          },
        };
      }),
    );
  };

  const handleSaveOne = async (item: PesertaPenilaianItem) => {
    try {
      setSavingId(item.peserta_id);
      await upsertPenilaianPeserta({
        peserta_id: item.peserta_id,
        kehadiran: item.penilaian.kehadiran,
        keaktifan: item.penilaian.keaktifan,
        logbook: item.penilaian.logbook,
        program_kerja: item.penilaian.program_kerja,
        laporan: item.penilaian.laporan,
        sikap: item.penilaian.sikap,
        catatan_dpl: item.penilaian.catatan_dpl,
      });

      setPesertaList((prev) =>
        prev.map((p) =>
          p.peserta_id === item.peserta_id
            ? { ...p, penilaian: { ...p.penilaian, is_saved: true } }
            : p,
        ),
      );
      showToast(`Penilaian untuk ${item.nama} berhasil disimpan.`);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menyimpan penilaian.");
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSavingAll(true);
      const payload = pesertaList.map((p) => ({
        peserta_id: p.peserta_id,
        kehadiran: p.penilaian.kehadiran,
        keaktifan: p.penilaian.keaktifan,
        logbook: p.penilaian.logbook,
        program_kerja: p.penilaian.program_kerja,
        laporan: p.penilaian.laporan,
        sikap: p.penilaian.sikap,
        catatan_dpl: p.penilaian.catatan_dpl,
      }));

      await bulkUpsertPenilaian(payload);
      setPesertaList((prev) =>
        prev.map((p) => ({
          ...p,
          penilaian: { ...p.penilaian, is_saved: true },
        })),
      );
      showToast("Semua nilai mahasiswa berhasil disimpan.");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menyimpan penilaian massal.");
    } finally {
      setSavingAll(false);
    }
  };

  const filteredPeserta =
    selectedKelompok === "all"
      ? pesertaList
      : pesertaList.filter((p) => p.kelompok_id === selectedKelompok);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Penilaian Mahasiswa
          </h1>
          <p className="text-sm text-gray-500">
            Input nilai akhir KKM mahasiswa bimbingan
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={savingAll || pesertaList.length === 0}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow transition disabled:opacity-50"
        >
          {savingAll ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Simpan Semua Nilai
        </button>
      </div>

      {/* Info Bobot Penilaian */}
      <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-xs md:text-sm text-sky-900 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="font-semibold text-sky-950 flex items-center">
          <Award className="w-4 h-4 mr-1.5 text-sky-600" />
          Bobot Penilaian:
        </span>
        <span>Kehadiran: <strong className="text-sky-950">15%</strong></span>
        <span>Keaktifan: <strong className="text-sky-950">15%</strong></span>
        <span>Logbook: <strong className="text-sky-950">20%</strong></span>
        <span>Prog. Kerja: <strong className="text-sky-950">20%</strong></span>
        <span>Laporan: <strong className="text-sky-950">20%</strong></span>
        <span>Sikap: <strong className="text-sky-950">10%</strong></span>
      </div>

      {/* Filter Kelompok Tabs */}
      {data && data.kelompok_list.length > 0 && (
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setSelectedKelompok("all")}
            className={`px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition ${
              selectedKelompok === "all"
                ? "bg-red-600 text-white shadow"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Semua ({pesertaList.length})
          </button>
          {data.kelompok_list.map((kel) => (
            <button
              key={kel.id}
              onClick={() => setSelectedKelompok(kel.id)}
              className={`px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition ${
                selectedKelompok === kel.id
                  ? "bg-red-600 text-white shadow"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {kel.nama}
            </button>
          ))}
        </div>
      )}

      {/* Tabel Penilaian */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredPeserta.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Belum ada mahasiswa bimbingan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nama</th>
                  <th className="py-3.5 px-3">Kelompok</th>
                  <th className="py-3.5 px-2 text-center">Kehadiran (15%)</th>
                  <th className="py-3.5 px-2 text-center">Keaktifan (15%)</th>
                  <th className="py-3.5 px-2 text-center">Logbook (20%)</th>
                  <th className="py-3.5 px-2 text-center">Prog. Kerja (20%)</th>
                  <th className="py-3.5 px-2 text-center">Laporan (20%)</th>
                  <th className="py-3.5 px-2 text-center">Sikap (10%)</th>
                  <th className="py-3.5 px-3 text-center">Nilai Akhir</th>
                  <th className="py-3.5 px-3 text-center">Grade</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPeserta.map((item) => {
                  const isSaved = item.penilaian.is_saved;
                  const isSaving = savingId === item.peserta_id;
                  return (
                    <tr key={item.peserta_id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{item.nama}</div>
                        <div className="text-xs text-gray-500">{item.nim}</div>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-medium">
                        {item.kelompok_nama}
                      </td>
                      {(["kehadiran", "keaktifan", "logbook", "program_kerja", "laporan", "sikap"] as const).map(
                        (field) => (
                          <td key={field} className="py-3 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.penilaian[field]}
                              onChange={(e) =>
                                handleInputChange(item.peserta_id, field, e.target.value)
                              }
                              className="w-16 text-center border border-gray-300 rounded-md py-1 px-1.5 text-sm font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
                            />
                          </td>
                        ),
                      )}
                      <td className="py-3 px-3 text-center font-bold text-gray-900">
                        {item.penilaian.nilai_akhir}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                            item.penilaian.grade === "A"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.penilaian.grade === "B"
                              ? "bg-blue-100 text-blue-800"
                              : item.penilaian.grade === "C"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.penilaian.grade}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-xs">
                        {isSaved ? (
                          <span className="inline-flex items-center text-emerald-600 font-medium">
                            <Check className="w-3.5 h-3.5 mr-1" /> Tersimpan
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Belum disimpan</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleSaveOne(item)}
                          disabled={isSaving}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded shadow transition disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : "Simpan"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
