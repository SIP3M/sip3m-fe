import {
  Award,
  CheckCircle2,
} from "lucide-react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// =====================================================================
// DATA STATIS — belum terhubung ke API.
// Ganti dengan data dari endpoint penilaian mahasiswa ketika tersedia.
// =====================================================================

interface Komponen {
  aspek: string;
  bobot: number;
  dpl: number;
  lppm: number;
}

const KOMPONEN: Komponen[] = [
  { aspek: "Kehandlingan", bobot: 20, dpl: 95, lppm: 90 },
  { aspek: "Logbook", bobot: 20, dpl: 88, lppm: 85 },
  { aspek: "Program Kerja", bobot: 25, dpl: 90, lppm: 88 },
  { aspek: "Laporan", bobot: 25, dpl: 82, lppm: 80 },
  { aspek: "Sikap", bobot: 10, dpl: 92, lppm: 90 },
];

/** Nilai akhir (rata-rata tertimbang) */
const hitungNilaiAkhir = (list: Komponen[], key: "dpl" | "lppm") => {
  const totalBobot = list.reduce((sum, item) => sum + item.bobot, 0);
  if (totalBobot === 0) return 0;
  return Math.round(
    list.reduce((sum, item) => sum + item[key] * item.bobot, 0) / totalBobot,
  );
};

const NILAI_DPL = hitungNilaiAkhir(KOMPONEN, "dpl");
const NILAI_LPPM = hitungNilaiAkhir(KOMPONEN, "lppm");
/** Nilai akhir = rata-rata dari penilaian DPL dan LPPM */
const NILAI_AKHIR = Math.round((NILAI_DPL + NILAI_LPPM) / 2);

/** Konversi nilai → grade huruf */
const getGrade = (nilai: number) => {
  if (nilai >= 85) return "A";
  if (nilai >= 80) return "B";
  if (nilai >= 75) return "C";
  if (nilai >= 70) return "D";
  return "E";
};

const GRADE_AKHIR = getGrade(NILAI_AKHIR);

const CATATAN_DPL =
  '"Mahasiswa menunjukkan dedikasi yang baik selama pelaksanaan KKM. Program kerja yang dijalankan berdampak positif bagi masyarakat desa. Perlu peningkatan pada aspek dokumentasi laporan agar lebih komprehensif."';

const RADAR_DATA = KOMPONEN.map((item) => ({
  aspek: item.aspek,
  dpl: item.dpl,
  lppm: item.lppm,
}));

export default function NilaiMahasiswa() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Nilai &amp; Evaluasi KKM
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Rekap nilai dan evaluasi pelaksanaan KKM Anda
        </p>
      </div>

      {/* HERO NILAI AKHIR */}
      <section className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 shadow-[0_10px_30px_rgba(220,38,38,0.25)]">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          {/* GRADE */}
          <div className="flex flex-col items-center gap-2 md:flex-col md:items-center">
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
              <span className="text-5xl font-bold text-white">{GRADE_AKHIR}</span>
            </span>
            <span className="text-xs font-medium text-white/85">
              Grade Akhir
            </span>
          </div>

          {/* RINGKASAN */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white">
              Nilai Akhir KKM: {NILAI_AKHIR}
            </h2>
            <p className="mt-1 text-sm text-white/85">
              KKM Reguler 2026 — Kelompok 07 — Desa Astanajapura
            </p>

            <div className="mt-4 flex gap-10">
              <div>
                <p className="text-xs text-white/75">Nilai DPL</p>
                <p className="text-2xl font-bold text-white">{NILAI_DPL}</p>
              </div>
              <div>
                <p className="text-xs text-white/75">Nilai LPPM</p>
                <p className="text-2xl font-bold text-white">{NILAI_LPPM}</p>
              </div>
            </div>
          </div>

          {/* IKON PENGHARGAAN */}
          <span className="hidden shrink-0 text-white/25 md:block">
            <Award size={72} strokeWidth={1.5} />
          </span>
        </div>
      </section>

      {/* RADAR + DETAIL KOMPONEN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* RADAR */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-gray-900">
            Profil Nilai per Komponen
          </h3>

          <div className="mt-4">
            <ResponsiveContainer width="100%" height={340}>
              <RadarChart data={RADAR_DATA} outerRadius="72%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="aspek"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: "#cbd5e1" }}
                  axisLine={false}
                />
                <Radar
                  name="Nilai DPL"
                  dataKey="dpl"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.12}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Radar
                  name="Nilai LPPM"
                  dataKey="lppm"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.12}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ fontSize: "13px", paddingTop: 8 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* DETAIL KOMPONEN */}
        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">
              Detail Komponen Nilai
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/70 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-5 font-semibold">Komponen</th>
                  <th className="py-3.5 px-5 font-semibold">Bobot</th>
                  <th className="py-3.5 px-5 font-semibold">Nilai DPL</th>
                  <th className="py-3.5 px-5 font-semibold">Nilai LPPM</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 text-sm">
                {KOMPONEN.map((row) => (
                  <tr
                    key={row.aspek}
                    className="transition-colors hover:bg-gray-50/60"
                  >
                    <td className="py-4 px-5 font-semibold text-gray-800">
                      {row.aspek}
                    </td>

                    <td className="py-4 px-5">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                        {row.bobot}%
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      <NilaiBar value={row.dpl} color="bg-red-500" />
                    </td>

                    <td className="py-4 px-5">
                      <NilaiBar value={row.lppm} color="bg-blue-500" />
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t border-gray-100 bg-gray-50/50 text-sm">
                  <td className="py-4 px-5 font-bold text-gray-900">
                    Nilai Akhir
                  </td>
                  <td className="py-4 px-5">
                    <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600">
                      100%
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-bold text-red-600">{NILAI_DPL}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-bold text-blue-600">{NILAI_LPPM}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>

      {/* CATATAN EVALUASI DPL */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-gray-900">
          Catatan Evaluasi DPL
        </h3>

        <div className="mt-4 rounded-xl border-l-4 border-red-500 bg-gray-50 px-5 py-4">
          <p className="text-sm italic leading-relaxed text-gray-600">
            {CATATAN_DPL}
          </p>
          <p className="mt-3 text-xs text-gray-400">
            — Dr. Ahmad Fauzi, M.Kom (DPL Kelompok 07)
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2 size={18} className="shrink-0 text-green-600" />
          <p className="text-sm text-gray-700">
            KKM dinyatakan <span className="font-bold text-green-700">LULUS</span>{" "}
            — Nilai Akhir {NILAI_AKHIR} ({GRADE_AKHIR})
          </p>
        </div>
      </section>
    </div>
  );
}

/** Bar nilai + angka (bar panjang proporsional terhadap nilai) */
function NilaiBar({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-gray-100">
        <span
          className={`block h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}
