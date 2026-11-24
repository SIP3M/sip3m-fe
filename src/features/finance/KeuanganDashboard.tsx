import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  CircleDollarSign,
  ClipboardCheck,
  Hourglass,
  Loader2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/features/auth/usePermission";
import { PERMISSIONS } from "@/constant/permissions";
import {
  approveProjectFunding,
  getFinanceProjects,
  getFinanceSummary,
} from "./finance.api";
import { FinanceProjectListItem, FinanceSummary } from "./finance.types";
import {
  formatCurrency,
  formatDate,
  statusClass,
  statusLabel,
} from "./finance.utils";

const errorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || error.message || fallback
    : error instanceof Error
      ? error.message
      : fallback;

export default function KeuanganDashboard() {
  const { hasPermission } = usePermission();
  const canApprove = hasPermission(PERMISSIONS.KEUANGAN_SETUJUI);
  const canDisburse = hasPermission(PERMISSIONS.KEUANGAN_CAIKAN);

  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [pending, setPending] = useState<FinanceProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [summaryRes, pendingRes] = await Promise.all([
        getFinanceSummary(),
        getFinanceProjects({ status: "MENUNGGU_PERSETUJUAN", limit: 10 }),
      ]);
      setSummary(summaryRes.data);
      setPending(pendingRes.data);
    } catch (err) {
      setError(errorMessage(err, "Gagal memuat dashboard keuangan."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleApprove = async (projectId: number) => {
    setApprovingId(projectId);
    setError(null);
    setSuccess(null);

    try {
      const res = await approveProjectFunding(projectId);
      setSuccess(res.message);
      await load();
    } catch (err) {
      setError(errorMessage(err, "Gagal menyetujui anggaran proyek."));
    } finally {
      setApprovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-gray-500">
        <Loader2 size={16} className="animate-spin text-red-600" />
        Memuat dashboard keuangan...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Keuangan & Hibah</h1>
        <p className="text-sm text-gray-500">
          Ringkasan anggaran proyek yang telah diterima dan status pencairan
          dana.
        </p>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-linear-to-r from-blue-900 to-blue-700 p-5 text-white shadow">
          <div className="flex items-center gap-2 text-sm opacity-80">
            <Wallet size={16} /> Total Anggaran Hibah
          </div>
          <h2 className="mt-2 text-xl font-bold">
            {formatCurrency(summary?.total_anggaran_hibah)}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CircleDollarSign size={16} /> Dana Terserap
          </div>
          <h2 className="mt-2 text-xl font-semibold text-green-600">
            {formatCurrency(summary?.dana_terserap)}
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            {summary?.tercairkan ?? 0} proyek sudah dicairkan
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Hourglass size={16} /> Menunggu Persetujuan
          </div>
          <h2 className="mt-2 text-xl font-semibold text-yellow-600">
            {summary?.menunggu_persetujuan ?? 0} proyek
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            {summary?.disetujui ?? 0} proyek siap dicairkan
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ClipboardCheck size={16} /> Sisa Anggaran
          </div>
          <h2 className="mt-2 text-xl font-semibold text-gray-800">
            {formatCurrency(summary?.sisa_anggaran)}
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            {summary?.jumlah_proyek ?? 0} proyek terdaftar
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-800">
              Anggaran Menunggu Persetujuan
            </h2>
            <p className="text-xs text-gray-500">
              Ketua LPPM menyetujui anggaran sebelum pencairan dapat diinput.
            </p>
          </div>
          <Link
            to="/keuangan-dashboard/pencairan"
            className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Lihat semua <ArrowRight size={15} />
          </Link>
        </div>

        {pending.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">
            Tidak ada anggaran yang menunggu persetujuan.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3">Proyek</th>
                  <th className="px-5 py-3">Ketua</th>
                  <th className="px-5 py-3">Dana Diajukan</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {item.proposal.skema} • {formatDate(item.created_at)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <p>{item.ketua.name}</p>
                      <p className="text-xs text-gray-400">
                        {item.ketua.nidn_nip ?? "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {formatCurrency(item.funding_request_amount)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(item.disbursement_status)}`}
                      >
                        {statusLabel(item.disbursement_status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {canApprove && (
                          <Button
                            onClick={() => void handleApprove(item.id)}
                            disabled={approvingId === item.id}
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            {approvingId === item.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              "Setujui"
                            )}
                          </Button>
                        )}
                        <Link
                          to={`/keuangan-dashboard/pencairan/${item.id}`}
                          className="text-sm text-gray-600 hover:text-blue-600"
                        >
                          Detail
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!canDisburse && (
        <p className="text-xs text-gray-400">
          Anda hanya dapat melihat data keuangan. Input pencairan dana
          dilakukan role KEUANGAN.
        </p>
      )}
    </div>
  );
}
