import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

type FileItem = {
  file: File;
  progress: number;
};

export default function Laporan() {
  const [files, setFiles] = useState<Record<string, FileItem | null>>({
    laporan: null,
    logbook: null,
    anggaran: null,
  });

  // 🔥 SIMULASI UPLOAD (FAKE PROGRESS)
  const simulateUpload = () => {
    Object.keys(files).forEach((key) => {
      if (!files[key]) return;

      let progress = 0;

      const interval = setInterval(() => {
        progress += Math.random() * 20;

        setFiles((prev) => ({
          ...prev,
          [key]: prev[key]
            ? {
                ...prev[key]!,
                progress: Math.min(Math.round(progress), 100),
              }
            : null,
        }));

        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 300);
    });
  };

  const DropBox = ({
    name,
    label,
  }: {
    name: string;
    label: string;
  }) => {
    const onDrop = (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      setFiles((prev) => ({
        ...prev,
        [name]: { file, progress: 0 },
      }));
    };

    const { getRootProps, getInputProps } = useDropzone({
      onDrop,
      multiple: false,
    });

    const fileData = files[name];

    return (
      <div className="mb-5">
        <p className="text-sm mb-2">{label}</p>

        <div
          {...getRootProps()}
          className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center text-gray-500 hover:bg-gray-50 cursor-pointer transition"
        >
          <input {...getInputProps()} />

          <Upload className="mb-2 text-gray-400" size={20} />

          {!fileData ? (
            <>
              <p className="text-sm">Klik atau drag file</p>
              <p className="text-xs mt-1">Maksimal 10 MB</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">
                {fileData.file.name}
              </p>

              {/* PROGRESS BAR */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${fileData.progress}%` }}
                />
              </div>

              <p className="text-xs mt-1">{fileData.progress}%</p>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen overflow-y-auto">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          Upload Laporan
        </h1>
        <p className="text-sm text-gray-500">
          Unggah laporan kemajuan atau laporan akhir penelitian.
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="col-span-2 space-y-6">

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold mb-4">Formulir Upload</h2>

            <div className="bg-blue-50 text-blue-700 text-sm p-4 rounded-lg mb-6">
              Target Pelaporan: Laporan Kemajuan 2 (70%)
            </div>

            <DropBox name="laporan" label="Dokumen Laporan (PDF)" />
            <DropBox name="logbook" label="Logbook (PDF/Excel)" />
            <DropBox name="anggaran" label="Bukti Anggaran (ZIP)" />

            <div className="flex justify-end gap-3 mt-6">
              <button className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">
                Simpan Draft
              </button>
              <button
                onClick={simulateUpload}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Submit Laporan
              </button>
            </div>
          </div>

          {/* RIWAYAT */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold mb-4">Riwayat Pelaporan</h2>
            <p className="text-sm text-gray-500">
              (Dummy) Data akan muncul dari backend nanti
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold mb-3">INFO PROYEK</h2>
            <p className="text-sm">
              Analisis Dampak Lingkungan Limbah Pabrik Gula
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-medium text-red-600 mb-1">
              ⚠ Perhatian
            </p>
            <p className="text-xs text-red-500">
              Pastikan dokumen sudah ditandatangani sebelum upload.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}