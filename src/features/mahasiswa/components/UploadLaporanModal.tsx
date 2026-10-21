import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CheckCircle2, Loader2, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

/** Format file yang boleh diunggah */
const ACCEPTED = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

/** Batas ukuran file: 20 MB */
const MAX_SIZE = 20 * 1024 * 1024;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Judul modal: "Upload Laporan" atau "Upload Ulang Laporan" */
  title: string;
  /** Jenis laporan, mis. "Laporan Tengah" */
  jenisLaporan: string;
  /** Catatan revisi dari reviewer (hanya mode upload ulang) */
  catatanRevisi?: string | null;
  /** Tampilkan spinner di tombol submit */
  isLoading?: boolean;
  /** Dipanggil setelah file valid dipilih & tombol submit diklik */
  onSubmit: (file: File) => void;
}

export default function UploadLaporanModal({
  open,
  onOpenChange,
  title,
  jenisLaporan,
  catatanRevisi,
  isLoading = false,
  onSubmit,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /** Reset form saat popup ditutup */
  const resetForm = () => {
    setFile(null);
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const onDrop = useCallback(
    (
      acceptedFiles: File[],
      fileRejections: readonly { file: File; errors: readonly { message: string }[] }[],
    ) => {
      if (fileRejections.length > 0) {
        const rejected = fileRejections[0];
        setFile(null);
        setError(
          rejected.file.size > MAX_SIZE
            ? "Ukuran file melebihi batas 20 MB."
            : "Format file harus PDF atau DOCX.",
        );
        return;
      }

      if (acceptedFiles.length === 0) return;
      setFile(acceptedFiles[0]);
      setError(null);
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } =
    useDropzone({
      onDrop,
      multiple: false,
      accept: ACCEPTED,
      maxSize: MAX_SIZE,
      noKeyboard: true,
    });

  const handleSubmit = () => {
    if (!file) {
      setError("Pilih file terlebih dahulu.");
      return;
    }
    onSubmit(file);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : handleOpenChange}>
      <DialogContent
        ref={contentRef}
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          // Fokus diarahkan ke isi dialog (bukan tombol pertama) supaya
          // tidak muncul outline fokus otomatis saat popup dibuka
          event.preventDefault();
          contentRef.current?.focus();
        }}
        className="max-w-[calc(100%-2rem)] gap-0 rounded-2xl bg-white p-0 sm:max-w-[440px]"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
          <div>
            <DialogTitle className="text-base font-bold text-gray-900">
              {title}
            </DialogTitle>
            <p className="mt-0.5 text-xs text-gray-500">{jenisLaporan}</p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            aria-label="Tutup"
            className="-mt-1 -mr-1 rounded-lg border-0 p-1 text-gray-400 outline-none transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-gray-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-4 px-6 pb-4">
          {/* CATATAN REVISI */}
          {catatanRevisi && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-bold text-red-600">
                Catatan Revisi dari Reviewer
              </p>
              <p className="mt-1 text-xs leading-relaxed text-red-600">
                {catatanRevisi}
              </p>
            </div>
          )}

          {/* DROPZONE */}
          <div
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors ${
              isDragActive
                ? "border-red-400 bg-red-50"
                : file
                  ? "border-green-300 bg-green-50/40"
                  : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            <input {...getInputProps()} />

            {file ? (
              <>
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle2 size={20} />
                </span>
                <p className="max-w-full truncate text-sm font-semibold text-gray-700">
                  {file.name}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <Upload size={20} />
                </span>
                <p className="text-sm font-semibold text-gray-700">
                  Drag &amp; drop file di sini
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  PDF, DOCX — Maks. 20 MB
                </p>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openFileDialog();
                  }}
                  className="mt-2 border-0 bg-transparent p-0 text-xs font-bold text-red-600 outline-none hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-200 cursor-pointer"
                >
                  Pilih File
                </button>
              </>
            )}
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {isLoading && <Loader2 size={15} className="animate-spin" />}
            Upload Sekarang
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
