import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/features/auth/usePermission";
import { PERMISSIONS } from "@/constant/permissions";
import {
  approveProjectFunding,
  disburseProject,
  getFinanceProjectById,
} from "./finance.api";
import { FinanceProjectDetail } from "./finance.types";
import {
  formatCurrency,
  formatDate,
  statusClass,
  statusLabel,
  toFileUrl,
} from "./finance.utils";

type Tab = "informasi" | "pencairan";

const errorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || error.message || fallback
    : error instanceof Error
      ? error.message
      : fallback;

export default function FinanceDetailPage() {
  const { id } = useParams();
  const projectId = Number(id);

  const { hasPermission } = usePermission();
  const canApprove = hasPermission(PERMISSIONS.KEUANGAN_SETUJUI);
  const canDisburse = hasPermission(PERMISSIONS.KEUANGAN_CAIKAN);

  const [project, setProject] = useState<FinanceProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("informasi");

  const [isApproving, setIsApproving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [proof, setProof] = useState<File | null>(null);

  const load = useCallback(async () => {
    if (!Number.isInteger(projectId) || projectId <= 0) {
      setError("ID proyek tidak valid.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await getFinanceProjectById(projectId);
      setProject(res.data);
      setAmount(res.data.realized_amount ? String(res.data.realized_amount) : "");
      setNote(res.data.disbursement_note ?? "");
    } catch (err) {
      setError(errorMessage(err, "Gagal memuat detail keuangan proyek."));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleApprove = async () => {
    if (!project) return;

    setIsApproving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await approveProjectFunding(project.id);
      setSuccess(res.message);
      await load();
    } catch (err) {
      setError(errorMessage(err, "Gagal menyetujui anggaran proyek."));
    } finally {
      setIsApproving(false);
    }
  };

  const handleDisburse = async () => {
    if (!project) return;

    setFormError(null);
    setSuccess(null);

    const parsed = Number(amount);
    if (!amount.trim() || Number.isNaN(parsed)) {
      setFormError("Nominal wajib diisi.");
      return;
    }
    if (parsed <= 0) {
      setFormError("Nominal harus lebih dari 0.");
      return;
    }
    if (parsed > project.funding_request_amount) {
      setFormError(
        `Nominal melebihi dana yang diajukan (${formatCurrency(project.funding_request_amount)}).`,
      );
      return;
    }

    setIsSaving(true);

    try {
      const res = await disburseProject(project.id, {
        realized_amount: parsed,
        note,
        transfer_proof: proof,
      });
      setSuccess(res.message);
      setProof(null);
      await load();
    } catch (err) {
      setFormError(errorMessage(err, "Gagal menyimpan pencairan dana."));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-gray-500">
        <Loader2 size={16} className="animate-spin text-red-600" />
        Memuat detail keuangan...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4 p-8">
        <p className="text-sm text-red-600">
          {error ?? "Data keuangan proyek tidak ditemukan."}
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft size={16} className="mr-2" /> Kembali
        </Button>
      </div>
    );
  }

  const dapatInput =
    canDisburse &&
    (project.disbursement_status === "DISETUJUI" ||
      project.disbursement_status === "TERCAIRKAN");
  const rabUrl = toFileUrl(project.proposal.rab_file_path);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/keuangan-dashboard/pencairan"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={15} /> Kembali ke daftar
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-800">
            {project.title}
          </h1>
          <p className="text-sm text-gray-500">
            {project.project_code ?? "-"} • {project.proposal.skema}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(project.disbursement_status)}`}
        >
          {statusLabel(project.disbursement_status)}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-blue-50 p-5">
          <p className="text-sm text-blue-600">Dana Diajukan</p>
          <h2 className="mt-1 text-xl font-bold text-blue-900">
            {formatCurrency(project.funding_request_amount)}
          </h2>
        </div>
        <div className="rounded-xl bg-green-50 p-5">
          <p className="text-sm text-green-600">Dana Cair</p>
          <h2 className="mt-1 text-xl font-bold text-green-800">
            {formatCurrency(project.realized_amount)}
          </h2>
        </div>
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Sisa Anggaran</p>
          <h2 className="mt-1 text-xl font-bold text-gray-800">
            {formatCurrency(project.sisa_anggaran)}
          </h2>
        </div>
      </div>

      {canApprove && project.disbursement_status === "MENUNGGU_PERSETUJUAN" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <Clock size={16} />
            Anggaran proyek ini belum disetujui. Setujui agar KEUANGAN dapat
            menginput pencairan.
          </div>
          <Button
            onClick={() => void handleApprove()}
            disabled={isApproving}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {isApproving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={15} className="mr-1" /> Setujui Anggaran
              </>
            )}
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="flex border-b text-sm">
          <button
            type="button"
            onClick={() => setTab("informasi")}
            className={`px-5 py-3 font-medium ${
              tab === "informasi"
                ? "border-b-2 border-red-600 text-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Informasi & Anggaran
          </button>
          <button
            type="button"
            onClick={() => setTab("pencairan")}
            className={`px-5 py-3 font-medium ${
              tab === "pencairan"
                ? "border-b-2 border-red-600 text-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pencairan
          </button>
        </div>

        {tab === "informasi" ? (
          <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2">
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Judul Proposal</p>
                <p className="text-gray-800">{project.proposal.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Ketua Peneliti</p>
                <p className="text-gray-800">{project.ketua.name}</p>
                <p className="text-xs text-gray-500">
                  NIDN/NIP: {project.ketua.nidn_nip ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Fakultas</p>
                <p className="text-gray-800">{project.ketua.fakultas ?? "-"}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Skema</p>
                <p className="text-gray-800">{project.proposal.skema}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Sumber Pendanaan</p>
                <p className="text-gray-800">
                  {project.proposal.sumber_pendanaan ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">RAB</p>
                {rabUrl ? (
                  <a
                    href={rabUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <FileText size={14} /> Lihat file RAB
                  </a>
                ) : (
                  <p className="text-gray-500">Belum diunggah</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400">
                  Periode Pelaksanaan
                </p>
                <p className="text-gray-800">
                  {formatDate(project.start_date)} —{" "}
                  {formatDate(project.end_date)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
            <div className="space-y-3 text-sm">
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-400">Status Persetujuan</p>
                <p className="text-gray-800">
                  {project.approved_by
                    ? `Disetujui ${project.approved_by} • ${formatDate(project.disbursement_approved_at)}`
                    : "Belum disetujui Ketua LPPM"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Dana Cair</p>
                <p className="text-gray-800">
                  {formatCurrency(project.realized_amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {project.disbursed_at
                    ? `Dicairkan ${formatDate(project.disbursed_at)}${project.disbursed_by ? ` oleh ${project.disbursed_by}` : ""}`
                    : "Belum dicairkan"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Catatan</p>
                <p className="text-gray-800">
                  {project.disbursement_note || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Bukti Transfer</p>
                {project.transfer_proof_url ? (
                  <a
                    href={project.transfer_proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <FileText size={14} /> Lihat bukti transfer
                  </a>
                ) : (
                  <p className="text-gray-500">Belum diunggah</p>
                )}
              </div>
            </div>

            {dapatInput ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">
                    Nominal Dana Cair
                  </label>
                  <Input
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value.replace(/[^\d]/g, ""))
                    }
                    placeholder="0"
                    inputMode="numeric"
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Maksimal {formatCurrency(project.funding_request_amount)}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-gray-500">
                    Catatan (opsional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border bg-white p-3 text-sm"
                    placeholder="Keterangan pencairan dana..."
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">
                    Bukti Transfer (opsional, PDF/JPG/PNG maks. 5 MB)
                  </label>
                  <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-gray-500 hover:bg-gray-50">
                    <Upload size={16} />
                    {proof ? proof.name : "Pilih file bukti transfer"}
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) =>
                        setProof(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                </div>

                {formError && (
                  <p className="text-sm text-red-600">{formError}</p>
                )}

                <Button
                  onClick={() => void handleDisburse()}
                  disabled={isSaving}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Simpan Pencairan"
                  )}
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-gray-500">
                {project.disbursement_status === "MENUNGGU_PERSETUJUAN"
                  ? "Pencairan dapat diinput setelah Ketua LPPM menyetujui anggaran."
                  : "Anda tidak memiliki izin untuk menginput pencairan dana."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
