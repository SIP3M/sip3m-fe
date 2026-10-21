import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CheckCircle2, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export interface LogbookBaru {
  tanggal: string;
  durasi: string;
  aktivitas: string;
  deskripsi: string;
  foto?: File | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LogbookBaru) => void;
}

/** Style input dipakai bersama agar konsisten antar field */
const FIELD_CLASS =
  "h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-red-400 focus:ring-2 focus:ring-red-100";

const LABEL_CLASS = "mb-1.5 block text-sm font-semibold text-gray-700";

const FORM_AWAL = {
  tanggal: "",
  durasi: "",
  aktivitas: "",
  deskripsi: "",
};

export default function TambahLogbookModal({
  open,
  onOpenChange,
  onSubmit,
}: Props) {
  const [form, setForm] = useState(FORM_AWAL);
  const [foto, setFoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setForm(FORM_AWAL);
    setFoto(null);
    setErrors({});
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
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
    setFoto(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxSize: 5 * 1024 * 1024,
    onDropRejected: () => setFoto(null),
  });

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.tanggal) nextErrors.tanggal = "Tanggal wajib diisi.";
    if (!form.durasi) nextErrors.durasi = "Durasi kegiatan wajib diisi.";
    if (!form.aktivitas) nextErrors.aktivitas = "Nama aktivitas wajib diisi.";
    if (!form.deskripsi) nextErrors.deskripsi = "Deskripsi kegiatan wajib diisi.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    // TODO: kirim ke API logbook mahasiswa (belum ada endpoint)
    onSubmit({ ...form, foto });
    handleOpenChange(false);
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
          {/* TANGGAL + DURASI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="logbook-tanggal" className={LABEL_CLASS}>
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                id="logbook-tanggal"
                type="text"
                placeholder="Contoh: 01 Feb 2026"
                value={form.tanggal}
                onChange={(event) => handleChange("tanggal", event.target.value)}
                className={`${FIELD_CLASS} ${
                  errors.tanggal ? "border-red-300" : ""
                }`}
              />
              {errors.tanggal && (
                <p className="mt-1 text-xs text-red-500">{errors.tanggal}</p>
              )}
            </div>

            <div>
              <label htmlFor="logbook-durasi" className={LABEL_CLASS}>
                Durasi Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                id="logbook-durasi"
                type="text"
                placeholder="Contoh: 3 jam"
                value={form.durasi}
                onChange={(event) => handleChange("durasi", event.target.value)}
                className={`${FIELD_CLASS} ${
                  errors.durasi ? "border-red-300" : ""
                }`}
              />
              {errors.durasi && (
                <p className="mt-1 text-xs text-red-500">{errors.durasi}</p>
              )}
            </div>
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
              value={form.aktivitas}
              onChange={(event) => handleChange("aktivitas", event.target.value)}
              className={`${FIELD_CLASS} ${
                errors.aktivitas ? "border-red-300" : ""
              }`}
            />
            {errors.aktivitas && (
              <p className="mt-1 text-xs text-red-500">{errors.aktivitas}</p>
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

          {/* UPLOAD FOTO */}
          <div>
            <p className={LABEL_CLASS}>Upload Foto Dokumentasi</p>

            <div
              {...getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors ${
                isDragActive
                  ? "border-red-400 bg-red-50"
                  : foto
                    ? "border-green-300 bg-green-50/40"
                    : "border-gray-300 bg-white hover:bg-gray-50"
              }`}
            >
              <input {...getInputProps()} />

              {foto ? (
                <>
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 size={20} />
                  </span>
                  <p className="max-w-full truncate text-sm font-semibold text-gray-700">
                    {foto.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {(foto.size / 1024 / 1024).toFixed(2)} MB — Klik untuk
                    mengganti
                  </p>
                </>
              ) : (
                <>
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <Upload size={20} />
                  </span>
                  <p className="text-sm font-medium text-gray-600">
                    Klik untuk upload foto kegiatan
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    JPG, PNG — Maks. 5 MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 cursor-pointer"
          >
            Simpan Logbook
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
