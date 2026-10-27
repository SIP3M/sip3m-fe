import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { CheckCircle2, Loader2, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { createLogbook } from "@/features/kkm/kkmLogbook.api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** ID kelompok mahasiswa (null = belum ada kelompok; tombol simpan dinonaktifkan) */
  kelompokId: number | null;
  /** Dipanggil setelah entri tersimpan (untuk refresh daftar) */
  onSaved: () => void;
}

/** Style input dipakai bersama agar konsisten antar field */
const FIELD_CLASS =
  "h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-red-400 focus:ring-2 focus:ring-red-100";

const LABEL_CLASS = "mb-1.5 block text-sm font-semibold text-gray-700";

const FORM_AWAL = {
  tanggal: "",
  judul: "",
  deskripsi: "",
};

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB — sama dgn limit BE

const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || "Gagal menyimpan logbook.";
  }
  return "Gagal menyimpan logbook.";
};

export default function TambahLogbookModal({
  open,
  onOpenChange,
  kelompokId,
  onSaved,
}: Props) {
  const [form, setForm] = useState(FORM_AWAL);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const resetForm = () => {
    setForm(FORM_AWAL);
    setFile(null);
    setErrors({});
    setSaveError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && !isSaving) resetForm();
    onOpenChange(next);
  };

  const handleChange = (
    field: keyof typeof FORM_AWAL,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setFile(acceptedFiles[0]);
    setErrors((prev) => ({ ...prev, file: "" }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    maxSize: MAX_FILE_BYTES,
    onDropRejected: () =>
      setErrors((prev) => ({
        ...prev,
        file: "File harus PDF dan ukurannya maksimal 10 MB.",
      })),
  });

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {};

    if (!form.tanggal) nextErrors.tanggal = "Tanggal wajib diisi.";
    if (form.judul.trim().length < 3) nextErrors.judul = "Nama aktivitas minimal 3 karakter.";
    if (form.deskripsi.trim().length < 3) nextErrors.deskripsi = "Deskripsi kegiatan minimal 3 karakter.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!kelompokId) {
      setSaveError("Kelompok Anda belum ditetapkan, logbook belum bisa diisi.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await createLogbook(kelompokId, {
        tanggal: form.tanggal, // input type=date → "YYYY-MM-DD" (format ISO utk BE)
        judul: form.judul.trim(),
        deskripsi: form.deskripsi.trim(),
        file,
      });
      resetForm();
      onOpenChange(false);
      onSaved();
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-2rem)] gap-0 rounded-2xl bg-white p-0 sm:max-w-[560px]"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-bold text-gray-900">
            Tambah Logbook Kegiatan
          </DialogTitle>

          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            aria-label="Tutup"
            className="-mt-1 -mr-1 rounded-lg border-0 p-1 text-gray-400 outline-none transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-red-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-4 px-6 pb-6">
          {saveError && (
            <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
              {saveError}
            </p>
          )}

          {/* TANGGAL */}
          <div>
            <label htmlFor="logbook-tanggal" className={LABEL_CLASS}>
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              id="logbook-tanggal"
              type="date"
              value={form.tanggal}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => handleChange("tanggal", event.target.value)}
              className={`${FIELD_CLASS} ${
                errors.tanggal ? "border-red-300" : ""
              }`}
            />
            {errors.tanggal && (
              <p className="mt-1 text-xs text-red-500">{errors.tanggal}</p>
            )}
          </div>

          {/* NAMA AKTIVITAS */}
          <div>
            <label htmlFor="logbook-aktivitas" className={LABEL_CLASS}>
              Nama Aktivitas <span className="text-red-500">*</span>
            </label>
            <input
              id="logbook-aktivitas"
              type="text"
              placeholder="Contoh: Survey Lokasi UMKM"
              value={form.judul}
              onChange={(event) => handleChange("judul", event.target.value)}
              className={`${FIELD_CLASS} ${
                errors.judul ? "border-red-300" : ""
              }`}
            />
            {errors.judul && (
              <p className="mt-1 text-xs text-red-500">{errors.judul}</p>
            )}
          </div>

          {/* DESKRIPSI */}
          <div>
            <label htmlFor="logbook-deskripsi" className={LABEL_CLASS}>
              Deskripsi Kegiatan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="logbook-deskripsi"
              rows={4}
              placeholder="Jelaskan kegiatan yang dilakukan secara singkat..."
              value={form.deskripsi}
              onChange={(event) =>
                handleChange("deskripsi", event.target.value)
              }
              className={`w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-red-400 focus:ring-2 focus:ring-red-100 ${
                errors.deskripsi ? "border-red-300" : ""
              }`}
            />
            {errors.deskripsi && (
              <p className="mt-1 text-xs text-red-500">{errors.deskripsi}</p>
            )}
          </div>

          {/* UPLOAD FILE LOGBOOK (PDF) */}
          <div>
            <p className={LABEL_CLASS}>
              Upload File Logbook{" "}
              <span className="text-xs font-normal text-gray-400">(opsional)</span>
            </p>

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
                    {(file.size / 1024 / 1024).toFixed(2)} MB — Klik untuk
                    mengganti
                  </p>
                </>
              ) : (
                <>
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <Upload size={20} />
                  </span>
                  <p className="text-sm font-medium text-gray-600">
                    Klik untuk upload file logbook
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    PDF — Maks. 10 MB
                  </p>
                </>
              )}
            </div>
            {errors.file && (
              <p className="mt-1 text-xs text-red-500">{errors.file}</p>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSaving}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving && <Loader2 size={15} className="animate-spin" />}
            {isSaving ? "Menyimpan..." : "Simpan Logbook"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
