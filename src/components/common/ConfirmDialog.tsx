import { useRef, type ReactNode } from "react";
import { AlertTriangle, Loader2, TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Judul popup, mis. "Hapus Akun?" */
  title: string;
  /** Penjelasan singkat, boleh ReactNode */
  description: ReactNode;
  /** Label tombol konfirmasi */
  confirmLabel?: string;
  /** Label tombol batal */
  cancelLabel?: string;
  /** Tampilkan spinner + disable tombol konfirmasi */
  isLoading?: boolean;
  /** Aksi saat tombol konfirmasi diklik */
  onConfirm: () => void;
  /** "danger" (merah) untuk aksi hapus, "default" (merah muda) untuk aksi biasa */
  variant?: "danger" | "default";
}

/**
 * Popup konfirmasi yang muncul di tengah layar.
 * Dipakai menggantikan window.confirm() yang tampilannya tidak konsisten
 * antar browser.
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  isLoading = false,
  onConfirm,
  variant = "danger",
}: Props) {
  const isDanger = variant === "danger";
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent
        ref={contentRef}
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          // Fokus diarahkan ke isi dialog supaya tidak muncul outline
          // fokus otomatis pada tombol pertama saat popup dibuka
          event.preventDefault();
          contentRef.current?.focus();
        }}
        className="max-w-[calc(100%-2rem)] gap-0 rounded-2xl bg-white p-0 sm:max-w-md"
      >
        <div className="px-6 pt-6 pb-4 text-center">
          {/* IKON */}
          <span
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
              isDanger
                ? "bg-red-50 text-red-500"
                : "bg-amber-50 text-amber-500"
            }`}
          >
            {isDanger ? (
              <TriangleAlert size={26} />
            ) : (
              <AlertTriangle size={26} />
            )}
          </span>

          {/* JUDUL */}
          <DialogTitle className="mt-4 text-lg font-bold text-gray-900">
            {title}
          </DialogTitle>

          {/* DESKRIPSI */}
          <DialogDescription className="mt-2 block text-sm leading-relaxed text-gray-500">
            {description}
          </DialogDescription>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-70 ${
              isDanger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isLoading && <Loader2 size={15} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
