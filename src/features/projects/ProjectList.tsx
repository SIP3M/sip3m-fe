import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, AlertCircle, CheckCircle, Search } from "lucide-react";
import axios from "axios";
import ProjectRow from "./components/ProjectRow";
import {
  MonitoringProjectListItem,
  MonitoringProjectSummary,
  MonitoringStatusFilter,
} from "./project.types";
import { getMonitoringProjects } from "./project.api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/common/Pagination";

const EMPTY_SUMMARY: MonitoringProjectSummary = {
  total_aktif: 0,
  total_selesai: 0,
  total_terlambat: 0,
};

export default function ProjectList() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<MonitoringProjectListItem[]>([]);
  const [summary, setSummary] =
    useState<MonitoringProjectSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MonitoringStatusFilter | "">(
    "",
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const latestRequestId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProjects = async (page: number, search: string) => {
    const requestId = ++latestRequestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const res = await getMonitoringProjects({
        page,
        search,
        statusFilter: statusFilter || undefined,
      });

      if (requestId !== latestRequestId.current) return;

      setProjects(res.data.data);
      setSummary(res.data.summary || EMPTY_SUMMARY);
      setCurrentPage(res.data.meta.currentPage);
      setTotalPages(res.data.meta.totalPages);
      setTotalItems(res.data.meta.totalData);
    } catch (err: unknown) {
      if (requestId !== latestRequestId.current) return;

      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ||
        err.message ||
        "Gagal mengambil data monitoring proyek."
        : err instanceof Error
          ? err.message
          : "Gagal mengambil data monitoring proyek.";

      setError(message);
      setProjects([]);
      setSummary(EMPTY_SUMMARY);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    void fetchProjects(currentPage, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch, statusFilter]);

  const onPageChange = (page: number) => {
    if (page <= 0 || page > totalPages || isLoading) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const statusFilterLabel = useMemo(() => {
    if (statusFilter === "PENDING") return "Pending";
    if (statusFilter === "SEDANG_BERJALAN") return "Sedang Berjalan";
    if (statusFilter === "SELESAI") return "Selesai";
    return "Semua Status";
  }, [statusFilter]);

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-800">
          Monitoring Proyek
        </h1>
        <p className="text-sm text-gray-500">
          Pantau kemajuan penelitian dan pengabdian berjalan.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white shadow-sm ring-gray-200/70">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-500">Total Proyek Aktif</p>
              <h2 className="text-4xl font-bold text-gray-800">
                {summary.total_aktif}
              </h2>
            </div>
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm ring-gray-200/70">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-500">Proyek Selesai</p>
              <h2 className="text-4xl font-bold text-gray-800">
                {summary.total_selesai}
              </h2>
            </div>
            <div className="rounded-xl bg-green-100 p-3 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm ring-gray-200/70">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-500">Proyek Terlambat</p>
              <h2 className="text-4xl font-bold text-gray-800">
                {summary.total_terlambat}
              </h2>
            </div>
            <div className="rounded-xl bg-red-100 p-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden bg-white shadow-sm ring-gray-200/70">
        <CardContent className="space-y-5 p-0">
          <div className="flex flex-col gap-3 border-b p-6 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Daftar Proyek Berjalan
            </h2>

            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
              <div className="relative w-full md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul proyek atau peneliti..."
                  className="h-9 pl-9"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value as MonitoringStatusFilter | "",
                  );
                  setCurrentPage(1);
                }}
                className="h-9 rounded-lg border border-input bg-white px-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="">Semua Status</option>
                <option value="PENDING">Pending</option>
                <option value="SEDANG_BERJALAN">Sedang Berjalan</option>
                <option value="SELESAI">Selesai</option>
              </select>

              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearch("");
                  setStatusFilter("");
                  setCurrentPage(1);
                }}
                disabled={!searchQuery && !statusFilter}
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="px-6 text-xs text-gray-500">
            Menampilkan data status:{" "}
            <span className="font-medium">{statusFilterLabel}</span>
          </div>

          {error && (
            <div className="mx-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-6 py-4">Nama Proyek</th>
                  <th className="px-6 py-4">Ketua Peneliti</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Milestone Berikutnya</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      className="px-6 py-8 text-center text-gray-500"
                      colSpan={6}
                    >
                      Memuat data monitoring proyek...
                    </td>
                  </tr>
                )}

                {!isLoading && projects.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-8 text-center text-gray-500"
                      colSpan={6}
                    >
                      Tidak ada proyek ditemukan.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  projects.map((project) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      onView={(id) => navigate(`/monitoring-project/${id}`)}
                    />
                  ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="border-t px-6 py-4">
              <div className="mb-3 text-sm text-gray-500">
                Total{" "}
                <span className="font-medium text-gray-700">{totalItems}</span>{" "}
                proyek
              </div>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                isLoading={isLoading}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
