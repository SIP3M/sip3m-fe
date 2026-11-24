import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Download, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/features/auth/usePermission";
import { PERMISSIONS } from "@/constant/permissions";
import { downloadFinanceExcel, getFinanceProjects } from "./finance.api";
import {
  FinanceDisbursementStatus,
  FinanceMeta,
  FinanceProjectListItem,
} from "./finance.types";
import { formatCurrency, formatDate, statusClass, statusLabel } from "./finance.utils";

const LIMIT = 10;

const STATUS_OPTIONS: { value: "" | FinanceDisbursementStatus; label: string }[] = [
  { value: "", label: "Semua status" },
  { value: "MENUNGGU_PERSETUJUAN", label: "Menunggu Persetujuan" },
  { value: "DISETUJUI", label: "Disetujui" },
  { value: "TERCAIRKAN", label: "Tercairkan" },
  { value: "DITOLAK", label: "Ditolak" },
];

const errorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || error.message || fallback
    : error instanceof Error
      ? error.message
      : fallback;

export default function FinanceListPage() {
  const { hasPermission } = usePermission();
  const canExport = hasPermission(PERMISSIONS.KEUANGAN_EXPORT);

  const [items, setItems] = useState<FinanceProjectListItem[]>([]);
  const [meta, setMeta] = useState<FinanceMeta | null>(null);
  const [status, setStatus] = useState<"" | FinanceDisbursementStatus>("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [tahun, setTahun] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await getFinanceProjects({
        status,
        search,
        tahun: tahun ? Number(tahun) : "",
        page,
        limit: LIMIT,
      });
      setItems(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(errorMessage(err, "Gagal memuat daftar pencairan dana."));
    } finally {
      setIsLoading(false);
    }
  }, [status, search, tahun, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      await downloadFinanceExcel({
        status,
        search,
        tahun: tahun ? Number(tahun) : "",
      });
    } catch (err) {
      setError(errorMessage(err, "Gagal mengunduh rekap keuangan."));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pencairan Dana</h1>
        <p className="text-sm text-gray-500">
          Proyek dari proposal yang telah diterima beserta status pencairannya.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as "" | FinanceDisbursementStatus);
                setPage(1);
              }}
              className="rounded-lg border bg-white px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Input
              value={tahun}
              onChange={(e) => {
                setTahun(e.target.value.replace(/\D/g, "").slice(0, 4));
                setPage(1);
              }}
              placeholder="Tahun"
              className="w-24"
            />
          </div>

          <div className="flex flex-1 items-center gap-2">
            <div className="relative w-full max-w-sm">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Cari judul, kode proyek, nama/NIDN ketua..."
                className="w-full pl-9"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              Cari
            </Button>
          </div>

          {canExport && (
            <Button
              variant="outline"
              onClick={() => void handleExport()}
              disabled={isExporting}
              className="inline-flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Download size={15} />
              )}
              Export Excel
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 px-5 py-10 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin text-red-600" />
            Memuat data pencairan...
          </div>
        ) : items.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-400">
            Belum ada proyek dengan anggaran pada filter ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3">Proyek</th>
                  <th className="px-5 py-3">Ketua</th>
                  <th className="px-5 py-3">Dana Diajukan</th>
                  <th className="px-5 py-3">Dana Cair</th>
                  <th className="px-5 py-3">Sisa</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {item.project_code ?? "-"} • {item.proposal.skema}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <p>{item.ketua.name}</p>
                      <p className="text-xs text-gray-400">
                        {item.ketua.nidn_nip ?? "-"} •{" "}
                        {item.ketua.fakultas ?? "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {formatCurrency(item.funding_request_amount)}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {formatCurrency(item.realized_amount)}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {formatCurrency(item.sisa_anggaran)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(item.disbursement_status)}`}
                      >
                        {statusLabel(item.disbursement_status)}
                      </span>
                      <p className="mt-1 text-xs text-gray-400">
                        {item.disbursed_at
                          ? `Cair ${formatDate(item.disbursed_at)}`
                          : "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/keuangan-dashboard/pencairan/${item.id}`}
                        className="text-sm text-gray-600 hover:text-blue-600"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-sm text-gray-500">
            <p>
              Halaman {meta.currentPage} dari {meta.totalPages} •{" "}
              {meta.totalData} proyek
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={meta.currentPage <= 1 || isLoading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                disabled={meta.currentPage >= meta.totalPages || isLoading}
                onClick={() =>
                  setPage((prev) => Math.min(meta.totalPages, prev + 1))
                }
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
