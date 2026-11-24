import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ChevronDown, Loader2, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import type { Proposal } from "@/features/proposals/proposal.types";
import { getReviewerCandidates, reassignReviewer } from "../review.api";
import type { ReviewerCandidate } from "../review.types";

interface Props {
  open: boolean;
  proposal: Proposal | null;
  onOpenChange: (open: boolean) => void;
  /** Dipanggil setelah reviewer berhasil diganti — untuk memuat ulang daftar. */
  onReassigned: (reviewer: { id: number; name: string }) => void;
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-orange-100 text-orange-600",
  ADMIN_VERIFIED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  REVIEW: "bg-yellow-100 text-yellow-700",
  REVISION: "bg-red-100 text-red-600",
  REVISI: "bg-red-100 text-red-600",
  REVIEW_DONE: "bg-indigo-100 text-indigo-700",
  ACCEPTED: "bg-green-100 text-green-600",
  APPROVED: "bg-green-100 text-green-600",
  REJECTED: "bg-red-100 text-red-700",
};

const getStatusKey = (status: string) =>
  status
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const formatProposalCode = (id: number) =>
  `PROP-${String(id).padStart(4, "0")}`;

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
 * Modal untuk mengubah (edit) penugasan reviewer pada proposal yang
 * sudah terplot. Menampilkan informasi proposal + reviewer saat ini,
 * lalu memilih reviewer pengganti dari daftar kandidat.
 */
export default function EditReviewerModal({
  open,
  proposal,
  onOpenChange,
  onReassigned,
}: Props) {
  const proposalId = proposal?.id ?? 0;
  const currentReviewerName = proposal?.assigned_reviewer?.name ?? "-";
  const leadName =
    proposal?.nama_ketua || proposal?.user?.name || "-";
  const statusKey = getStatusKey(proposal?.status ?? "");

  const [candidates, setCandidates] = useState<ReviewerCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || proposalId <= 0) return;

    let cancelled = false;
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

  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedId) ?? null,
    [candidates, selectedId],
  );

  const handleConfirmReassign = async () => {
    if (selectedId === null) return;

    setIsAssigning(true);
    setAssignError(null);
    try {
      const res = await reassignReviewer(proposalId, selectedId);
      setShowConfirm(false);
      onReassigned({
        id: res.data.reviewer.id,
        name: res.data.reviewer.name,
      });
    } catch (err: unknown) {
      setAssignError(getErrorMessage(err, "Gagal mengubah penugasan reviewer."));
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

  if (!proposal) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] w-full gap-0 overflow-hidden rounded-2xl bg-white p-0 sm:max-w-2xl">
          <div className="max-h-[calc(90vh-4.5rem)] overflow-y-auto px-6 pt-5 pb-5">
            {/* HEADER */}
            <div className="pr-8">
              <p className="text-xs font-bold tracking-wide text-red-500">
                {formatProposalCode(proposal.id)}
              </p>
              <DialogTitle className="mt-1 text-xl font-bold text-gray-900">
                Ubah Penugasan Reviewer
              </DialogTitle>
              <DialogDescription className="mt-1">
                Perubahan hanya berlaku untuk proposal ini.
              </DialogDescription>
            </div>

            <div className="my-5 h-px bg-gray-100" />

            {/* 01 — INFORMASI PROPOSAL */}
            <section>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-red-500">01</span>
                <h3 className="text-base font-semibold text-gray-800">
                  Informasi Proposal
                </h3>
              </div>

              <div className="mt-3 rounded-xl bg-gray-50 p-5">
                <p className="text-base font-semibold leading-snug text-gray-900">
                  {proposal.title}
                </p>

                <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Ketua Peneliti
                    </dt>
                    <dd className="mt-1 text-sm text-gray-700">{leadName}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Bidang
                    </dt>
                    <dd className="mt-1 text-sm text-gray-700">
                      {proposal.faculty || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Skema
                    </dt>
                    <dd className="mt-1 text-sm text-gray-700">
                      {proposal.skema || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Status Proposal
                    </dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                          STATUS_BADGE[statusKey] ??
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {proposal.status}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* 02 — INFORMASI PENUGASAN */}
            <section className="mt-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-red-500">02</span>
                <h3 className="text-base font-semibold text-gray-800">
                  Informasi Penugasan
                </h3>
              </div>

              <div className="mt-3 rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Reviewer saat ini
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {currentReviewerName}
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    Terplot
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor={`reviewer-pengganti-${proposal.id}`}
                  className="text-sm font-semibold text-gray-800"
                >
                  Nama Reviewer Pengganti
                </label>

                <div className="relative mt-2">
                  <select
                    id={`reviewer-pengganti-${proposal.id}`}
                    value={selectedId ?? ""}
                    onChange={(event) =>
                      setSelectedId(
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                    disabled={isLoading || isAssigning || loadError !== null}
                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-700 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  >
                    <option value="" disabled>
                      {isLoading
                        ? "Memuat reviewer..."
                        : "Cari dan pilih reviewer..."}
                    </option>
                    {candidates.map((candidate) => (
                      <option
                        key={candidate.id}
                        value={candidate.id}
                        disabled={!candidate.eligible}
                      >
                        {candidate.name}
                        {candidate.faculty ? ` — ${candidate.faculty}` : ""}
                        {!candidate.eligible
                          ? " (konflik kepentingan)"
                          : ` (beban ${candidate.beban})`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
                  />
                </div>

                {isLoading && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <Loader2 size={14} className="animate-spin" />
                    Memuat kandidat reviewer...
                  </p>
                )}

                {loadError && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
                    <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                    {loadError}
                  </p>
                )}

                {!isLoading && !loadError && candidates.length === 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    Tidak ada kandidat reviewer tersedia.
                  </p>
                )}

                {selectedCandidate && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium ${
                        selectedCandidate.is_sebidang
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {selectedCandidate.is_sebidang
                        ? "Sebidang"
                        : "Lintas fakultas"}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                      Beban {selectedCandidate.beban}
                    </span>
                    {selectedCandidate.alasan.length > 0 && (
                      <span className="text-red-600">
                        {selectedCandidate.alasan.join("; ")}
                      </span>
                    )}
                  </div>
                )}

                {assignError && (
                  <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {assignError}
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* FOOTER */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isAssigning}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={selectedId === null || isLoading || isAssigning}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {isAssigning && <Loader2 size={15} className="animate-spin" />}
              Simpan Perubahan
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Ubah penugasan reviewer?"
        description={
          <>
            Reviewer akan diubah dari{" "}
            <span className="font-medium text-gray-700">
              {currentReviewerName}
            </span>{" "}
            menjadi{" "}
            <span className="font-medium text-gray-700">
              {selectedCandidate?.name}
            </span>
            . Perubahan ini menggantikan reviewer yang sudah ditugaskan.
          </>
        }
        confirmLabel="Ya, Simpan Perubahan"
        cancelLabel="Batal"
        isLoading={isAssigning}
        onConfirm={() => void handleConfirmReassign()}
        variant="default"
      />
    </>
  );
}
