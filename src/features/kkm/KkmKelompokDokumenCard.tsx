import { useRef, useState } from "react";
import { Download, Eye, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { deleteKkmKelompokDokumen, uploadKkmKelompokDokumen } from "./kkmKelompok.api";
import {
  KKM_KELOMPOK_DOKUMEN_LABEL,
  KKM_KELOMPOK_DOKUMEN_SLOTS,
  formatFileSize,
  formatDate,
  type KkmKelompokDokumen,
  type KkmKelompokDokumenType,
} from "./kkmKelompok.types";
import { getKkmErrorMessage } from "./kkmKelompok.ui";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

interface Props {
  kelompokId: number;
  dokumen: KkmKelompokDokumen[];
  /** true saat periode SELESAI / bukan admin — semua aksi dinonaktifkan */
  disabled?: boolean;
  onChanged: () => void;
  onToast?: (type: "success" | "error", text: string) => void;
}

export default function KkmKelompokDokumenCard({
  kelompokId,
  dokumen,
  disabled = false,
  onChanged,
  onToast,
}: Props) {
  const fileRefs = useRef<Partial<Record<KkmKelompokDokumenType, HTMLInputElement | null>>>({});
  const [uploadingType, setUploadingType] = useState<KkmKelompokDokumenType | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const notify = (type: "success" | "error", text: string) => onToast?.(type, text);

  const slotOf = (type: KkmKelompokDokumenType) =>
    dokumen.find((d) => d.document_type === type) || null;

  const handlePick = (type: KkmKelompokDokumenType) => {
    if (disabled) return;
    setLocalError(null);
    fileRefs.current[type]?.click();
  };

  const handleUpload = async (type: KkmKelompokDokumenType, file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setLocalError("File harus PDF.");
      notify("error", "File harus PDF.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setLocalError(`Ukuran file maksimal ${formatFileSize(MAX_FILE_BYTES)}.`);
      notify("error", `Ukuran file maksimal ${formatFileSize(MAX_FILE_BYTES)}.`);
      return;
    }
    setLocalError(null);
    setUploadingType(type);
    try {
      const res = await uploadKkmKelompokDokumen(kelompokId, file, type);
      notify("success", res.message || `${KKM_KELOMPOK_DOKUMEN_LABEL[type]} berhasil diunggah.`);
      onChanged();
    } catch (err: unknown) {
      notify("error", getKkmErrorMessage(err, "Gagal mengunggah dokumen."));
    } finally {
      setUploadingType(null);
      const input = fileRefs.current[type];
      if (input) input.value = "";
    }
  };

  const handleDelete = async (doc: KkmKelompokDokumen) => {
    const ok = window.confirm(`Hapus dokumen "${doc.title}"? Slot kembali "Belum diupload".`);
    if (!ok) return;
    setDeletingId(doc.id);
    try {
      const res = await deleteKkmKelompokDokumen(doc.id);
      notify("success", res.message || "Dokumen berhasil dihapus.");
      onChanged();
    } catch (err: unknown) {
      notify("error", getKkmErrorMessage(err, "Gagal menghapus dokumen."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-1">Dokumen Kelompok</h3>
      <p className="text-xs text-gray-400 mb-3">
        3 slot tetap · PDF maks {formatFileSize(MAX_FILE_BYTES)} · unggah baru otomatis menggantikan
        yang lama.
      </p>

      {localError && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {localError}
        </p>
      )}

      <div className="space-y-3">
        {KKM_KELOMPOK_DOKUMEN_SLOTS.map((type) => {
          const doc = slotOf(type);
          const isUploading = uploadingType === type;
          return (
            <div
              key={type}
              className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700">
                    {KKM_KELOMPOK_DOKUMEN_LABEL[type]}
                  </p>
                  {doc ? (
                    <>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-800 truncate">
                        <FileText size={13} className="text-green-600 shrink-0" />
                        <span className="truncate">{doc.title}</span>
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {formatDate(doc.uploaded_at)} · {formatFileSize(doc.file_size)}
                        {doc.uploaded_by ? ` · ${doc.uploaded_by}` : ""}
                      </p>
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                        Terupload
                      </span>
                    </>
                  ) : (
                    <p className="mt-1 text-[11px] text-gray-400">
                      Belum diupload — slot kosong.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {doc && (
                    <>
                      <button
                        type="button"
                        onClick={() => window.open(doc.url, "_blank", "noopener")}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Lihat dokumen"
                      >
                        <Eye size={15} />
                      </button>
                      <a
                        href={doc.url}
                        download={doc.title}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50"
                        title="Download"
                      >
                        <Download size={15} />
                      </a>
                      <button
                        type="button"
                        onClick={() => void handleDelete(doc)}
                        disabled={disabled || deletingId === doc.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40"
                        title="Hapus dokumen"
                      >
                        {deletingId === doc.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handlePick(type)}
                    disabled={disabled || isUploading}
                    title={disabled ? "Periode SELESAI — tidak bisa upload" : doc ? "Ganti file" : "Upload file"}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  >
                    {isUploading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Upload size={12} />
                    )}
                    {doc ? "Ganti" : "Upload"}
                  </button>
                </div>
              </div>

              <input
                ref={(el) => {
                  fileRefs.current[type] = el;
                }}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => void handleUpload(type, e.target.files?.[0] || null)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
