import { useState, useRef } from 'react';
import { X, CheckCircle2, Upload } from 'lucide-react';

type SumberData = 'siakad' | 'file';
type ModalStep = 'sumber' | 'preview';

// =====================================================================
// Data preview — UI ONLY, belum ada API tarik data SIAKAD atau parsing
// file Excel/CSV. Ganti dengan hasil response API begitu tersedia.
// =====================================================================
const PREVIEW_SAMPLE = [
  { nim: '210411050', nama: 'Ahmad Yani', prodi: 'Teknik Informatika', semester: 7 },
  { nim: '210421051', nama: 'Bunga Melati', prodi: 'Farmasi', semester: 7 },
  { nim: '210431052', nama: 'Candra Kusuma', prodi: 'Hukum', semester: 6 },
];
const TOTAL_DITEMUKAN = 248;
// =====================================================================

interface ImportMahasiswaModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportMahasiswaModal({ onClose, onSuccess }: ImportMahasiswaModalProps) {
  const [step, setStep] = useState<ModalStep>('sumber');
  const [sumberData, setSumberData] = useState<SumberData>('siakad');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePreview = async () => {
    if (sumberData === 'file' && !selectedFile) {
      alert('Silakan pilih file Excel/CSV terlebih dahulu.');
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: sambungkan ke API tarik data SIAKAD atau upload+parsing file begitu tersedia, contoh:
      // const res = sumberData === 'siakad'
      //   ? await pullFromSiakad()
      //   : await uploadImportFile(selectedFile!);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStep('preview');
    } catch (err) {
      console.error('Gagal memuat preview data import', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimpanImport = async () => {
    setIsProcessing(true);
    try {
      // TODO: sambungkan ke API simpan hasil import begitu tersedia, contoh:
      // await confirmImportMahasiswa();
      await new Promise((resolve) => setTimeout(resolve, 600));
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Gagal menyimpan hasil import', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={() => !isProcessing && onClose()}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[560px] overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Import Mahasiswa KKM</h3>
          <button
            onClick={() => !isProcessing && onClose()}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: SUMBER DATA */}
        {step === 'sumber' && (
          <>
            <div className="px-6 py-5">
              <p className="text-sm font-semibold text-gray-800 mb-3">Sumber Data</p>

              <div className="space-y-3">
                <label
                  className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-colors ${
                    sumberData === 'siakad'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="sumberData"
                    checked={sumberData === 'siakad'}
                    onChange={() => setSumberData('siakad')}
                    className="mt-0.5 w-4 h-4 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Import dari Sistem Akademik</p>
                    <p className="text-xs text-gray-500 mt-0.5">Tarik data langsung dari SIAKAD UMC</p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-colors ${
                    sumberData === 'file'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="sumberData"
                    checked={sumberData === 'file'}
                    onChange={() => setSumberData('file')}
                    className="mt-0.5 w-4 h-4 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Upload File Excel / CSV</p>
                    <p className="text-xs text-gray-500 mt-0.5">Upload file .xlsx atau .csv berisi data mahasiswa</p>

                    {sumberData === 'file' && (
                      <div className="mt-3" onClick={(e) => e.preventDefault()}>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-100 file:text-red-700 hover:file:bg-red-200 border border-gray-200 rounded-lg p-1 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {sumberData === 'siakad' ? (
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Sistem akan menarik data mahasiswa yang telah mendaftar KKM dari SIAKAD UMC secara otomatis.
                  </p>
                </div>
              ) : (
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Pastikan file memiliki kolom NIM, Nama, Prodi, dan Semester sesuai template yang ditentukan.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => !isProcessing && onClose()}
                disabled={isProcessing}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handlePreview}
                disabled={isProcessing}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? 'Memuat...' : 'Preview Data'}
              </button>
            </div>
          </>
        )}

        {/* STEP 2: PREVIEW DATA */}
        {step === 'preview' && (
          <>
            <div className="px-6 py-5">
              <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3.5 mb-4">
                <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">
                  Ditemukan <span className="font-bold">{TOTAL_DITEMUKAN} mahasiswa</span> siap diimport. Periksa data sebelum menyimpan.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">NIM</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Nama</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Prodi</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Semester</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {PREVIEW_SAMPLE.map((item) => (
                      <tr key={item.nim}>
                        <td className="px-4 py-2.5 text-gray-700">{item.nim}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-800">{item.nama}</td>
                        <td className="px-4 py-2.5 text-gray-600">{item.prodi}</td>
                        <td className="px-4 py-2.5 text-gray-600">{item.semester}</td>
                        <td className="px-4 py-2.5">
                          <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                            Baru
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {TOTAL_DITEMUKAN > PREVIEW_SAMPLE.length && (
                  <div className="px-4 py-2.5 text-center text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
                    ... dan {TOTAL_DITEMUKAN - PREVIEW_SAMPLE.length} mahasiswa lainnya
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setStep('sumber')}
                disabled={isProcessing}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Kembali
              </button>
              <button
                onClick={handleSimpanImport}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50 cursor-pointer"
              >
                {isProcessing && <Upload size={15} className="animate-spin" />}
                {isProcessing ? 'Menyimpan...' : 'Simpan Import'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}