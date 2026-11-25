import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2, Search, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { assignManualReviewer, getReviewerCandidates } from "../review.api";
import type { ReviewerCandidate } from "../review.types";

interface Props {
  open: boolean;
  proposalId: number;
  proposalTitle: string;
  onOpenChange: (open: boolean) => void;
  /** Dipanggil setelah plotting berhasil — untuk memuat ulang daftar. */
  onAssigned: (reviewer: { id: number; name: string }) => void;
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

/**
 * Modal pemilihan reviewer untuk SATU proposal (plotting manual).
 * Kandidat dengan konflik kepentingan tampil namun tidak bisa dipilih.
 * Penugasan masih dapat diubah sesudahnya melalui Edit Penugasan.
 */
export default function ReviewerPickerModal({
  open,
  proposalId,
  proposalTitle,
  onOpenChange,
  onAssigned,
}: Props) {
  const [candidates, setCandidates] = useState<ReviewerCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setSearch("");
    setSelectedId(null);
    setAssignError(null);
    setLoadError(null);
    setCandidates([]);

    setIsLoading(true);
    getReviewerCandidates(proposalId)
      .then((res) => {
        if (!cancelled) setCandidates(res.data.candidates);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(
            getErrorMessage(err, "Gagal memuat daftar kandidat reviewer."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, proposalId]);

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return candidates;
    return candidates.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(query) ||
        (candidate.faculty || "").toLowerCase().includes(query),
    );
  }, [candidates, search]);

  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedId) ?? null,
    [candidates, selectedId],
  );

  const handleConfirmAssign = async () => {
    if (selectedId === null) return;

    setIsAssigning(true);
    setAssignError(null);
    try {
      const res = await assignManualReviewer(proposalId, selectedId);
      setShowConfirm(false);
      onAssigned({
        id: res.data.reviewer.id,
        name: res.data.reviewer.name,
      });
    } catch (err: unknown) {
      setAssignError(
        getErrorMessage(
          err,
          "Gagal melakukan plotting reviewer. Proposal mungkin sudah terplot.",
        ),
      );
      setShowConfirm(false);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isAssigning) return;
    if (!nextOpen) {
      setShowConfirm(false);
      setAssignError(null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="pr-6 text-left leading-snug">
              Pilih Reviewer
            </DialogTitle>
            <DialogDescription className="line-clamp-2">
              {proposalTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            Reviewer yang dipilih akan ditugaskan untuk proposal ini. Penugasan
            masih dapat diubah setelah tersimpan.
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3">
            <Search size={16} className="shrink-0 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama atau fakultas reviewer..."
              className="w-full bg-transparent py-2 text-sm outline-none"
            />
          </div>

          {assignError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {assignError}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-10 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              Memuat kandidat reviewer...
            </div>
          ) : loadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {loadError}
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
              {candidates.length === 0
                ? "Tidak ada kandidat reviewer tersedia."
                : "Tidak ada kandidat yang cocok dengan pencarian."}
            </div>
          ) : (
            <fieldset>
              <legend className="sr-only">Daftar kandidat reviewer</legend>
              <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
                {filteredCandidates.map((candidate) => {
                  const isSelected = selectedId === candidate.id;
                  const isDisabled = !candidate.eligible;

                  return (
                    <label
                      key={candidate.id}
                      className={`flex items-start gap-3 rounded-xl border p-3 transition ${
                        isDisabled
                          ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-70"
                          : isSelected
                            ? "cursor-pointer border-blue-400 bg-blue-50"
                            : "cursor-pointer border-gray-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`reviewer-${proposalId}`}
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => setSelectedId(candidate.id)}
                        className="mt-1 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">
                            {candidate.name}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              candidate.is_sebidang
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {candidate.is_sebidang
                              ? "Sebidang"
                              : "Lintas fakultas"}
                          </span>
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                            Beban {candidate.beban}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {candidate.faculty || "Fakultas tidak terdaftar"}
                        </p>
                        {isDisabled && candidate.alasan.length > 0 && (
                          <p className="mt-1 flex items-start gap-1 text-xs text-red-600">
                            <ShieldAlert
                              size={13}
                              className="mt-0.5 shrink-0"
                            />
                            <span>{candidate.alasan.join("; ")}</span>
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isAssigning}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={selectedId === null || isLoading || isAssigning}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isAssigning && <Loader2 size={15} className="animate-spin" />}
              Plot Reviewer
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Plot reviewer ini?"
        description={
          <>
            <span className="font-medium text-gray-700">
              {selectedCandidate?.name}
            </span>{" "}
            akan ditugaskan sebagai reviewer untuk proposal ini. Penugasan masih
            dapat diubah setelah tersimpan.
          </>
        }
        confirmLabel="Ya, Plot Reviewer"
        cancelLabel="Batal"
        isLoading={isAssigning}
        onConfirm={() => void handleConfirmAssign()}
        variant="default"
      />
    </>
  );
}
