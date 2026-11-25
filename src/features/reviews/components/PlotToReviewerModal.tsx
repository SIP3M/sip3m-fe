import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2, Search, ShieldAlert, UserRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  bulkAssignProposalReviewers,
  type BulkAssignReviewersResponse,
} from "@/features/proposals/proposal.api";
import type { Proposal } from "@/features/proposals/proposal.types";
import {
  getActiveReviewers,
  type ReviewerOption,
} from "@/features/users/Users.api";

interface Props {
  open: boolean;
  /** Proposal terpilih dari tabel (sudah berstatus ADMIN_VERIFIED). */
  proposals: Proposal[];
  onOpenChange: (open: boolean) => void;
  /** Dipanggil setelah proses bulk selesai — untuk memuat ulang daftar. */
  onCompleted: (res: BulkAssignReviewersResponse) => void;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
};

const formatProposalCode = (id: number) =>
  `PROP-${String(id).padStart(4, "0")}`;

/**
 * Modal "Plot ke Reviewer Tertentu": pilih SATU reviewer (dengan search),
 * lalu tugaskan ke seluruh proposal yang dipilih dari tabel. Proposal yang
 * bermasalah (sudah terplot/konflik) dilewati backend dan dilaporkan di
 * bagian gagal.
 */
export default function PlotToReviewerModal({
  open,
  proposals,
  onOpenChange,
  onCompleted,
}: Props) {
  const [reviewers, setReviewers] = useState<ReviewerOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setSearch("");
    setSelectedId(null);
    setSubmitError(null);
    setLoadError(null);
    setReviewers([]);

    setIsLoading(true);
    getActiveReviewers()
      .then((data) => {
        if (!cancelled) setReviewers(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(
            getErrorMessage(err, "Gagal memuat daftar reviewer aktif."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const filteredReviewers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reviewers;
    return reviewers.filter(
      (reviewer) =>
        reviewer.name.toLowerCase().includes(query) ||
        reviewer.email.toLowerCase().includes(query),
    );
  }, [reviewers, search]);

  const selectedReviewer = useMemo(
    () => reviewers.find((reviewer) => reviewer.id === selectedId) ?? null,
    [reviewers, selectedId],
  );

  const handleConfirm = async () => {
    if (selectedId === null || proposals.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await bulkAssignProposalReviewers(
        proposals.map((proposal) => proposal.id),
        selectedId,
      );
      setShowConfirm(false);
      onCompleted(res);
    } catch (err: unknown) {
      setSubmitError(
        getErrorMessage(err, "Gagal melakukan plotting reviewer massal."),
      );
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    if (!nextOpen) {
      setShowConfirm(false);
      setSubmitError(null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[85vh] w-full gap-0 overflow-hidden rounded-2xl bg-white p-0 sm:max-w-2xl">
          <div className="max-h-[calc(85vh-4.5rem)] overflow-y-auto px-6 pt-5 pb-5">
            <DialogHeader className="pr-8">
              <DialogTitle className="text-left leading-snug">
                Plot ke Reviewer Tertentu
              </DialogTitle>
              <DialogDescription>
                Pilih satu reviewer untuk menugaskan seluruh proposal yang
                dipilih.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              <span className="font-semibold">{proposals.length} proposal</span>{" "}
              akan ditugaskan ke reviewer yang dipilih. Proposal yang sudah
              terplot atau mengalami konflik kepentingan akan dilewati dan
              dilaporkan sebagai gagal.
            </div>

            {submitError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {/* PILIH REVIEWER */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-800">
                Reviewer Penugasan
              </h3>

              <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                <Search size={16} className="shrink-0 text-gray-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama atau email reviewer..."
                  disabled={isLoading || isSubmitting}
                  className="w-full bg-transparent py-2 text-sm text-gray-700 outline-none disabled:cursor-not-allowed"
                />
              </div>

              {isLoading ? (
                <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <Loader2 size={14} className="animate-spin" />
                  Memuat reviewer aktif...
                </p>
              ) : loadError ? (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
                  <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                  {loadError}
                </p>
              ) : filteredReviewers.length === 0 ? (
                <p className="mt-2 text-xs text-gray-500">
                  {reviewers.length === 0
                    ? "Tidak ada reviewer aktif."
                    : "Tidak ada reviewer yang cocok dengan pencarian."}
                </p>
              ) : (
                <fieldset className="mt-2">
                  <legend className="sr-only">Daftar reviewer aktif</legend>
                  <div className="max-h-[36vh] space-y-2 overflow-y-auto pr-1">
                    {filteredReviewers.map((reviewer) => {
                      const isSelected = selectedId === reviewer.id;

                      return (
                        <label
                          key={reviewer.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                            isSelected
                              ? "border-blue-400 bg-blue-50"
                              : "border-gray-200 bg-white hover:border-blue-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="plot-to-reviewer"
                            checked={isSelected}
                            disabled={isSubmitting}
                            onChange={() => setSelectedId(reviewer.id)}
                            className="mt-1 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-gray-800">
                                {reviewer.name}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                <UserRound size={11} />
                                Reviewer
                              </span>
                            </div>
                            <p className="mt-0.5 break-all text-xs text-gray-500">
                              {reviewer.email}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              )}
            </div>

            {/* PROPOSAL TERPILIH */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-gray-800">
                Proposal Terpilih ({proposals.length})
              </h3>
              <div className="mt-2 max-h-[24vh] space-y-2 overflow-y-auto pr-1">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-400">
                          {formatProposalCode(proposal.id)}
                        </p>
                        <h4 className="line-clamp-2 text-sm font-semibold text-gray-800">
                          {proposal.title}
                        </h4>
                      </div>
                      <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-medium text-orange-700">
                        {proposal.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {proposal.faculty || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={
                selectedId === null ||
                proposals.length === 0 ||
                isLoading ||
                isSubmitting
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              Plot {proposals.length} Proposal
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Plot ke reviewer ini?"
        description={
          <>
            <span className="font-medium text-gray-700">
              {proposals.length} proposal
            </span>{" "}
            akan ditugaskan kepada{" "}
            <span className="font-medium text-gray-700">
              {selectedReviewer?.name}
            </span>
            . Proposal bermasalah akan dilewati dan dilaporkan sebagai gagal.
          </>
        }
        confirmLabel="Ya, Plot Sekarang"
        cancelLabel="Batal"
        isLoading={isSubmitting}
        onConfirm={() => void handleConfirm()}
        variant="default"
      />
    </>
  );
}
