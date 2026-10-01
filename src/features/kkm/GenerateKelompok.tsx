import React, { useState } from 'react';
import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shuffle,
} from 'lucide-react';

export default function GenerateKelompok() {
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [anggotaPerKelompok, setAnggotaPerKelompok] = useState(10);
  const [polaProdi, setPolaProdi] = useState('campur');
  const [genderBalance, setGenderBalance] = useState(true);
  const [lokasiPenempatan, setLokasiPenempatan] = useState('random');
  const [assignDPL, setAssignDPL] = useState(true);
  const [metodeAssign, setMetodeAssign] = useState('random');
  const [maxKelompokPerDPL, setMaxKelompokPerDPL] = useState(2);
  const [kuotaDesa, setKuotaDesa] = useState(true);

  const stats = {
    totalPeserta: 1248,
    verified: 1180,
    pending: 68,
    belumKelompok: 1180,
    tidakMemenuhi: 25,
  };

  const validasiData = [
    { text: '1180 mahasiswa terverifikasi siap diproses', type: 'ok' },
    { text: '32 desa tersedia untuk penempatan', type: 'ok' },
    { text: '5 desa hampir mencapai kuota penuh', type: 'warning' },
    { text: '47 DPL tersedia', type: 'ok' },
    { text: '15 mahasiswa belum memenuhi syarat semester', type: 'error' },
    { text: '2 prodi memiliki distribusi tidak seimbang', type: 'warning' },
  ];

  const previewSteps = [
    'Pilih periode KKM yang akan diproses',
    'Periksa data peserta yang siap generate',
    'Atur konfigurasi pembagian kelompok',
    'Pastikan validasi data sudah OK',
    'Klik tombol Generate Kelompok Otomatis',
    'Review hasil & simpan kelompok',
  ];

  const polaProdiOptions = [
    { value: 'campur', label: 'Campur Semua Prodi' },
    { value: 'minimal3', label: 'Minimal 3 Prodi Berbeda' },
    { value: 'fakultas', label: 'Berdasarkan Fakultas' },
    { value: 'random', label: 'Bebas / Random' },
  ];

  const lokasiOptions = [
    { value: 'random', label: 'Random' },
    { value: 'kuota', label: 'Berdasarkan Kuota Desa' },
    { value: 'tema', label: 'Berdasarkan Tema Desa' },
  ];

  const metodeOptions = [
    { value: 'random', label: 'Random' },
    { value: 'fakultas', label: 'Berdasarkan Fakultas' },
    { value: 'beban', label: 'Beban DPL Seimbang' },
  ];

  // Section title with numbered red badge
  const SectionTitle = ({ number, children }: { number: number; children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </span>
      <h3 className="text-base font-semibold text-gray-800">{children}</h3>
    </div>
  );

  const ValidasiIcon = ({ type }: { type: string }) => {
    if (type === 'ok') return <CheckCircle size={16} className="text-green-500 flex-shrink-0" />;
    if (type === 'warning') return <AlertTriangle size={16} className="text-yellow-500 flex-shrink-0" />;
    return <XCircle size={16} className="text-red-500 flex-shrink-0" />;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Generate Kelompok KKM</h1>
        <p className="text-gray-500 text-sm mt-1">
          Smart grouping engine — buat kelompok mahasiswa otomatis berdasarkan aturan yang ditentukan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Step 1: Periode KKM */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SectionTitle number={1}>Periode KKM</SectionTitle>
            <div className="max-w-md">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pilih Periode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                placeholder=""
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              />
              <p className="flex items-start gap-1.5 text-xs text-gray-400 mt-2">
                <Info size={13} className="flex-shrink-0 mt-0.5" />
                Kelompok akan dibuat berdasarkan periode KKM yang dipilih.
              </p>
            </div>
          </div>

          {/* Step 2: Data Peserta */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SectionTitle number={2}>Data Peserta Siap Generate</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-100 rounded-lg p-4">
                <p className="text-xs text-gray-500">Total Peserta</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalPeserta.toLocaleString('id-ID')}</p>
              </div>
              <div className="border border-gray-100 rounded-lg p-4">
                <p className="text-xs text-gray-500">Sudah Verified</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.verified.toLocaleString('id-ID')}</p>
              </div>
              <div className="border border-gray-100 rounded-lg p-4">
                <p className="text-xs text-gray-500">Pending Verifikasi</p>
                <p className="text-2xl font-bold text-orange-500 mt-1">{stats.pending}</p>
              </div>
              <div className="border border-gray-100 rounded-lg p-4">
                <p className="text-xs text-gray-500">Belum Punya Kelompok</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.belumKelompok.toLocaleString('id-ID')}</p>
              </div>
              <div className="border border-gray-100 rounded-lg p-4">
                <p className="text-xs text-gray-500">Tidak Memenuhi Syarat</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.tidakMemenuhi}</p>
              </div>
            </div>
          </div>

          {/* Step 3: Konfigurasi Pembagian */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SectionTitle number={3}>Konfigurasi Pembagian</SectionTitle>

            <div className="space-y-6">
              {/* Jumlah Anggota */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jumlah Anggota per Kelompok
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={5}
                    max={15}
                    value={anggotaPerKelompok}
                    onChange={(e) =>
                      setAnggotaPerKelompok(Math.min(15, Math.max(5, Number(e.target.value) || 0)))
                    }
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">mahasiswa</span>
                </div>
                <p className="text-sm text-red-600 font-medium mt-2">
                  Estimasi: <span className="font-bold">{Math.ceil(stats.verified / anggotaPerKelompok)} kelompok</span> akan dibuat
                </p>
              </div>

              {/* Pola Pembagian Prodi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pola Pembagian Prodi</label>
                <div className="space-y-1.5">
                  {polaProdiOptions.map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => setPolaProdi(opt.value)}
                      className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                        polaProdi === opt.value
                          ? 'border border-red-400 bg-red-50 text-red-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Mahasiswa dibagi dengan komposisi lintas program studi.</p>
              </div>

              {/* Gender Balance */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender Balance</label>
                <div
                  onClick={() => setGenderBalance(!genderBalance)}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {genderBalance ? 'Seimbangkan laki-laki dan perempuan' : 'Tidak seimbangkan'}
                </div>
                <p className="text-xs text-gray-400 mt-1">Sistem akan mencoba menyeimbangkan komposisi gender.</p>
              </div>

              {/* Lokasi Penempatan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi Penempatan</label>
                <div className="space-y-1.5">
                  {lokasiOptions.map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => setLokasiPenempatan(opt.value)}
                      className={`text-sm cursor-pointer ${
                        lokasiPenempatan === opt.value ? 'text-gray-800 font-medium' : 'text-gray-600'
                      }`}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Assign DPL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assign DPL Otomatis</label>
                <div className="flex items-center gap-6">
                  <span
                    onClick={() => setAssignDPL(true)}
                    className={`text-sm cursor-pointer ${assignDPL ? 'text-gray-800 font-medium' : 'text-gray-500'}`}
                  >
                    Ya
                  </span>
                  <span
                    onClick={() => setAssignDPL(false)}
                    className={`text-sm cursor-pointer ${!assignDPL ? 'text-gray-800 font-medium' : 'text-gray-500'}`}
                  >
                    Tidak
                  </span>
                </div>

                {assignDPL && (
                  <div className="mt-4 pl-4 border-l-2 border-red-200 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Metode Assign DPL</label>
                      <div className="space-y-1.5">
                        {metodeOptions.map((opt) => (
                          <div
                            key={opt.value}
                            onClick={() => setMetodeAssign(opt.value)}
                            className={`text-sm cursor-pointer ${
                              metodeAssign === opt.value ? 'text-gray-800 font-medium' : 'text-gray-600'
                            }`}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Maks. Kelompok per DPL</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={maxKelompokPerDPL}
                        onChange={(e) =>
                          setMaxKelompokPerDPL(Math.min(5, Math.max(1, Number(e.target.value) || 0)))
                        }
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-400 mt-1">Sistem akan membagi beban dosen secara proporsional.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Kuota Desa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kuota Desa</label>
                <div
                  onClick={() => setKuotaDesa(!kuotaDesa)}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {kuotaDesa ? 'Ikuti kapasitas desa' : 'Abaikan kapasitas desa'}
                </div>
                <p className="text-xs text-gray-400 mt-1">Kelompok tidak akan melebihi kuota maksimal desa.</p>
              </div>
            </div>
          </div>

          {/* Step 4: Validasi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SectionTitle number={4}>Validasi Data</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {validasiData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <ValidasiIcon type={item.type} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Rekomendasi</p>
                  <p className="text-sm text-yellow-700">
                    Kurangi anggota per kelompok menjadi <span className="font-semibold">9 mahasiswa</span> untuk distribusi yang lebih merata.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm">
            <Shuffle size={18} />
            Generate Kelompok Otomatis
          </button>
        </div>

        {/* RIGHT COLUMN: Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Shuffle size={26} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Preview Hasil Generate</h3>
          </div>
          <ol className="space-y-3.5">
            {previewSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm text-gray-600">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}