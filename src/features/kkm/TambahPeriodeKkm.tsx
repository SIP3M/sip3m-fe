import { useState } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type StatusPeriode = "DRAFT" | "AKTIF" | "DIJADWALKAN";

export default function TambahPeriodeKkm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =====================================================================
  // State form — belum ada API/tipe data resmi untuk "Periode KKM",
  // jadi semua field ini masih state lokal. Sambungkan ke endpoint
  // create-periode-kkm begitu tersedia (lihat handleSubmit di bawah).
  // =====================================================================
  const [form, setForm] = useState({
    namaPeriode: "",
    tahunAkademik: "2025/2026",
    jenisKkm: "Reguler",
    deskripsi: "",

    tanggalBukaPendaftaran: "",
    tanggalTutupPendaftaran: "",
    tanggalPembekalan: "",
    tanggalPelaksanaan: "",
    tanggalPenarikan: "",
    deadlineLaporanAkhir: "",

    targetPeserta: 1000,
    minimalSemester: "Semester 7",
    maksAnggotaKelompok: 10,
    bolehLintasFakultas: true,
    wajibCampurProdi: true,

    assignDplOtomatis: true,
    maksKelompokPerDosen: 2,

    statusPeriode: "DRAFT" as StatusPeriode,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (statusOverride?: StatusPeriode) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        statusPeriode: statusOverride || form.statusPeriode,
      };

      // TODO: sambungkan ke API begitu endpoint create periode KKM tersedia, contoh:
      // await createKkmPeriode(payload);
      console.log("Payload Tambah Periode KKM:", payload);

      await new Promise((resolve) => setTimeout(resolve, 600));
      navigate(-1);
    } catch (err) {
      console.error("Gagal menyimpan periode KKM", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-3xl">
      {/* HEADER */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Periode KKM</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Buat periode pelaksanaan KKM baru untuk kebutuhan pengelolaan mahasiswa, kelompok, dan lokasi.
          </p>
        </div>
      </div>

      {/* A. INFORMASI PERIODE */}
      <SectionCard letter="A" title="Informasi Periode">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Nama Periode <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="namaPeriode"
            value={form.namaPeriode}
            onChange={handleChange}
            placeholder="KKM Reguler 2026"
            className="mt-2 w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Tahun Akademik <span className="text-red-500">*</span>
            </label>
            <select
              name="tahunAkademik"
              value={form.tahunAkademik}
              onChange={handleChange}
              className="mt-2 w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
            >
              <option value="2024/2025">2024/2025</option>
              <option value="2025/2026">2025/2026</option>
              <option value="2026/2027">2026/2027</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Jenis KKM <span className="text-red-500">*</span>
            </label>
            <select
              name="jenisKkm"
              value={form.jenisKkm}
              onChange={handleChange}
              className="mt-2 w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
            >
              <option value="Reguler">Reguler</option>
              <option value="Tematik">Tematik</option>
              <option value="Mandiri">Mandiri</option>
            </select>
          </div>
        </div>

        <div className="mt-5">
          <label className="text-sm font-medium text-gray-700">Deskripsi KKM</label>
          <textarea
            name="deskripsi"
            value={form.deskripsi}
            onChange={handleChange}
            rows={3}
            placeholder="Deskripsi singkat mengenai periode KKM ini..."
            className="mt-2 w-full resize-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
      </SectionCard>

      {/* B. PENGATURAN PELAKSANAAN */}
      <SectionCard letter="B" title="Pengaturan Pelaksanaan">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <DateField label="Tanggal Buka Pendaftaran" name="tanggalBukaPendaftaran" value={form.tanggalBukaPendaftaran} onChange={handleChange} />
          <DateField label="Tanggal Tutup Pendaftaran" name="tanggalTutupPendaftaran" value={form.tanggalTutupPendaftaran} onChange={handleChange} />
          <DateField label="Tanggal Pembekalan" name="tanggalPembekalan" value={form.tanggalPembekalan} onChange={handleChange} />
          <DateField label="Tanggal Pelaksanaan" name="tanggalPelaksanaan" value={form.tanggalPelaksanaan} onChange={handleChange} />
          <DateField label="Tanggal Penarikan" name="tanggalPenarikan" value={form.tanggalPenarikan} onChange={handleChange} />
          <DateField label="Deadline Laporan Akhir" name="deadlineLaporanAkhir" value={form.deadlineLaporanAkhir} onChange={handleChange} />
        </div>
      </SectionCard>

      {/* C. PENGATURAN PESERTA */}
      <SectionCard letter="C" title="Pengaturan Peserta">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Target Peserta</label>
            <input type="number" name="targetPeserta" value={form.targetPeserta} onChange={handleChange} className="mt-2 w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Minimal Semester</label>
            <select name="minimalSemester" value={form.minimalSemester} onChange={handleChange} className="mt-2 w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={`Semester ${sem}`}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Maks. Anggota / Kelompok</label>
            <input type="number" name="maksAnggotaKelompok" value={form.maksAnggotaKelompok} onChange={handleChange} className="mt-2 w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mt-5">
          <CheckboxField label="Boleh lintas fakultas" name="bolehLintasFakultas" checked={form.bolehLintasFakultas} onChange={handleChange} />
          <CheckboxField label="Wajib campur prodi" name="wajibCampurProdi" checked={form.wajibCampurProdi} onChange={handleChange} />
        </div>
      </SectionCard>

      {/* D. PENGATURAN DPL */}
      <SectionCard letter="D" title="Pengaturan DPL">
        <CheckboxField label="Assign DPL otomatis" name="assignDplOtomatis" checked={form.assignDplOtomatis} onChange={handleChange} />

        <div className="mt-5 max-w-xs">
          <label className="text-sm font-medium text-gray-700">Maks. Kelompok per Dosen</label>
          <input type="number" name="maksKelompokPerDosen" value={form.maksKelompokPerDosen} onChange={handleChange} className="mt-2 w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
        </div>
      </SectionCard>

      {/* E. STATUS PERIODE */}
      <SectionCard letter="E" title="Status Periode">
        <div className="flex flex-wrap gap-6">
          {(["DRAFT", "AKTIF", "DIJADWALKAN"] as StatusPeriode[]).map((status) => (
            <label key={status} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="statusPeriode"
                checked={form.statusPeriode === status}
                onChange={() => setForm((prev) => ({ ...prev, statusPeriode: status }))}
                className="w-4 h-4 text-red-600 focus:ring-red-500"
              />
              {status === "DRAFT" ? "Draft" : status === "AKTIF" ? "Aktif" : "Dijadwalkan"}
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Hanya satu periode dapat aktif dalam satu waktu.</p>
      </SectionCard>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap justify-end gap-3 pb-8">
        <button type="button" onClick={() => navigate(-1)} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer">
          Batal
        </button>

        <button type="button" onClick={() => handleSubmit("DRAFT")} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer">
          Simpan Draft
        </button>

        <button type="button" onClick={() => handleSubmit("AKTIF")} disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 cursor-pointer">
          {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Simpan & Aktifkan
        </button>
      </div>
    </div>
  );
}

function SectionCard({ letter, title, children }: { letter: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold shrink-0">
          {letter}
        </span>
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function DateField({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
      />
    </div>
  );
}

function CheckboxField({ label, name, checked, onChange }: { label: string; name: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
      />
      {label}
    </label>
  );
}