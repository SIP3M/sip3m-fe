import { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  FileText,
  GraduationCap,
  Loader2,
  Medal,
  ShieldCheck,
  Star,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getPenilaianMahasiswaSaya } from "./penilaian.api";
import type { PenilaianMahasiswaResponse } from "./penilaian.types";

export default function NilaiEvaluasiMahasiswaPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PenilaianMahasiswaResponse | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getPenilaianMahasiswaSaya();
        setData(res);
      } catch (err) {
        console.error("[GET_NILAI_MHS_ERROR]", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Data penilaian belum tersedia atau Anda belum terdaftar sebagai peserta KKM.</p>
      </div>
    );
  }

  const { penilaian, periode, kelompok, bobot_komponen } = data;

  const chartData = [
    { subject: "Kehadiran", nilai: penilaian.kehadiran, fullMark: 100 },
    { subject: "Keaktifan", nilai: penilaian.keaktifan, fullMark: 100 },
    { subject: "Logbook", nilai: penilaian.logbook, fullMark: 100 },
    { subject: "Prog. Kerja", nilai: penilaian.program_kerja, fullMark: 100 },
    { subject: "Laporan", nilai: penilaian.laporan, fullMark: 100 },
    { subject: "Sikap", nilai: penilaian.sikap, fullMark: 100 },
  ];

  const detailsTable = [
    { komponen: "Kehadiran", bobot: "20%", nilai: penilaian.kehadiran },
    { komponen: "Logbook", bobot: "20%", nilai: penilaian.logbook },
    { komponen: "Program Kerja", bobot: "25%", nilai: penilaian.program_kerja },
    { komponen: "Laporan", bobot: "25%", nilai: penilaian.laporan },
    { komponen: "Sikap", bobot: "10%", nilai: penilaian.sikap },
  ];

  const isLulus = penilaian.nilai_akhir >= 65;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Nilai & Evaluasi KKM
        </h1>
        <p className="text-sm text-gray-500">
          Rekap nilai dan evaluasi pelaksanaan KKM Anda
        </p>
      </div>

      {/* Banner Kartu Utama */}
      <div className="bg-red-600 rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
          <Medal className="w-72 h-72 text-white" />
        </div>
        <div className="flex items-center space-x-6 z-10 mb-4 md:mb-0">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-extrabold border border-white/30 shadow-inner">
            {penilaian.grade}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-red-200 font-semibold mb-1">
              Grade Akhir
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Nilai Akhir KKM: {penilaian.nilai_akhir}
            </h2>
            <p className="text-xs md:text-sm text-red-100 mt-1">
              {periode.nama_periode} ({periode.tahun_akademik}) — {kelompok ? `${kelompok.nama} — Desa ${kelompok.desa}` : "Belum Berkelompok"}
            </p>
          </div>
        </div>
        <div className="z-10 bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 text-center">
          <div className="text-xs text-red-200 uppercase font-semibold">Penilai DPL</div>
          <div className="text-lg font-bold mt-0.5">
            {penilaian.is_saved ? penilaian.nilai_akhir : "Belum Dinilai"}
          </div>
        </div>
      </div>

      {/* Grid Grafik & Tabel Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profil Nilai per Komponen (Radar Chart) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
          <h3 className="text-base font-bold text-gray-900 mb-2">
            Profil Nilai per Komponen
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#4b5563", fontSize: 12 }} />
                <Radar
                  name="Nilai DPL"
                  dataKey="nilai"
                  stroke="#dc2626"
                  fill="#dc2626"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detail Komponen Nilai (Tabel) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            Detail Komponen Nilai
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
                  <th className="py-2.5 px-3">Komponen</th>
                  <th className="py-2.5 px-3">Bobot</th>
                  <th className="py-2.5 px-3 text-right">Nilai DPL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { k: "Kehadiran", b: "15%", v: penilaian.kehadiran },
                  { k: "Keaktifan", b: "15%", v: penilaian.keaktifan },
                  { k: "Logbook", b: "20%", v: penilaian.logbook },
                  { k: "Program Kerja", b: "20%", v: penilaian.program_kerja },
                  { k: "Laporan", b: "20%", v: penilaian.laporan },
                  { k: "Sikap", b: "10%", v: penilaian.sikap },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-3 font-medium text-gray-900">{row.k}</td>
                    <td className="py-3 px-3 text-gray-500">{row.b}</td>
                    <td className="py-3 px-3 text-right font-bold text-red-600">{row.v}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50/80 font-bold text-gray-900 border-t-2 border-gray-200">
                  <td className="py-3 px-3">Nilai Akhir</td>
                  <td className="py-3 px-3">100%</td>
                  <td className="py-3 px-3 text-right text-red-600 text-base">
                    {penilaian.nilai_akhir}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Catatan Evaluasi DPL & Status Kelulusan */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
        <h3 className="text-base font-bold text-gray-900">Catatan Evaluasi DPL</h3>
        <div className="bg-gray-50 border-l-4 border-red-600 p-4 rounded-r-xl italic text-gray-700 text-sm">
          {penilaian.catatan_dpl ? (
            `"${penilaian.catatan_dpl}"`
          ) : (
            <span className="text-gray-400 not-italic">
              Belum ada catatan evaluasi dari DPL.
            </span>
          )}
          <div className="not-italic text-xs text-gray-500 font-medium mt-2">
            {kelompok?.dpl ? `— ${kelompok.dpl.name} (DPL ${kelompok.nama})` : ""}
          </div>
        </div>

        <div
          className={`flex items-center space-x-3 p-4 rounded-xl border ${
            penilaian.is_saved && isLulus
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : penilaian.is_saved
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-gray-50 border-gray-200 text-gray-600"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">
            {penilaian.is_saved
              ? isLulus
                ? `KKM dinyatakan LULUS — Nilai Akhir ${penilaian.nilai_akhir} (${penilaian.grade})`
                : `KKM belum memenuhi standar kelulusan — Nilai Akhir ${penilaian.nilai_akhir} (${penilaian.grade})`
              : "Nilai akhir KKM Anda sedang dalam proses rekapitulasi oleh DPL."}
          </span>
        </div>
      </div>
    </div>
  );
}
