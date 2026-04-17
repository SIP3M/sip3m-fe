import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  UserRound,
} from "lucide-react";
import axios from "axios";
import { getMonitoringProjectById } from "./project.api";
import { MonitoringProjectDetail } from "./project.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const getStatusClassName = (status: string) => {
  const key = status
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (key === "ON_TRACK") return "bg-green-100 text-green-600";
  if (key === "DELAYED") return "bg-red-100 text-red-600";
  if (key === "COMPLETED") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
};

const formatDate = (value: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatCurrencyIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const toFileUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  return `https://sip3m-be.vercel.app/${path.replace(/^\/+/, "")}`;
};

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const projectId = Number(id);

  const [project, setProject] = useState<MonitoringProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(projectId) || projectId <= 0) {
      setError("ID proyek tidak valid.");
      setIsLoading(false);
      return;
    }

    const loadDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await getMonitoringProjectById(projectId);
        setProject(res.data);
      } catch (err: unknown) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message ||
            err.message ||
            "Gagal memuat detail monitoring proyek."
          : err instanceof Error
            ? err.message
            : "Gagal memuat detail monitoring proyek.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDetail();
  }, [projectId]);

  const progress = useMemo(
    () => Math.max(0, Math.min(100, project?.progress_percentage || 0)),
    [project?.progress_percentage],
  );

  if (isLoading) {
    return (
      <div className="space-y-4 p-8">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4 p-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Detail proyek tidak ditemukan."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          <h1 className="text-3xl font-semibold text-gray-800">
            {project.title}
          </h1>
          <p className="text-sm text-gray-500">
            Kode Proyek: {project.project_code}
          </p>
        </div>

        <span
          className={`inline-flex rounded-full px-4 py-1.5 text-sm font-medium ${getStatusClassName(project.calculated_status)}`}
        >
          {project.calculated_status}
        </span>
      </div>

      {project.summary && (
        <Card className="bg-white shadow-sm ring-gray-200/70">
          <CardContent className="p-6 text-sm text-gray-700">
            {project.summary}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white shadow-sm ring-gray-200/70">
          <CardContent className="space-y-2 p-5">
            <div className="flex items-center gap-2 text-gray-500">
              <UserRound className="h-4 w-4" /> Peneliti
            </div>
            <p className="font-medium text-gray-800">
              {project.user?.name || "-"}
            </p>
            <p className="text-xs text-gray-500">
              NIDN/NIP: {project.user?.nidn_nip || "-"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm ring-gray-200/70">
          <CardContent className="space-y-2 p-5">
            <div className="flex items-center gap-2 text-gray-500">
              <CalendarDays className="h-4 w-4" /> Periode
            </div>
            <p className="text-sm text-gray-800">
              {formatDate(project.start_date)}
            </p>
            <p className="text-xs text-gray-500">
              s/d {formatDate(project.end_date)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm ring-gray-200/70">
          <CardContent className="space-y-2 p-5">
            <div className="flex items-center gap-2 text-gray-500">
              <CircleDollarSign className="h-4 w-4" /> Dana Terealisasi
            </div>
            <p className="font-medium text-gray-800">
              {formatCurrencyIDR(project.realized_amount)}
            </p>
            <p className="text-xs text-gray-500">
              Status pencairan: {project.disbursement_status}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm ring-gray-200/70">
          <CardContent className="space-y-2 p-5">
            <p className="text-sm text-gray-500">Progress Proyek</p>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full ${progress >= 50 ? "bg-green-500" : "bg-red-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm font-medium text-gray-700">{progress}%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm ring-gray-200/70">
        <CardHeader>
          <CardTitle>Milestone</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-6 py-3">Urutan</th>
                <th className="px-6 py-3">Judul</th>
                <th className="px-6 py-3">Target</th>
                <th className="px-6 py-3">Deadline</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {project.milestones.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    Belum ada milestone.
                  </td>
                </tr>
              )}

              {project.milestones.map((milestone) => (
                <tr key={milestone.id} className="border-t">
                  <td className="px-6 py-3">{milestone.sequence}</td>
                  <td className="px-6 py-3">{milestone.title}</td>
                  <td className="px-6 py-3">{milestone.target_percentage}%</td>
                  <td className="px-6 py-3">
                    {formatDate(milestone.due_date)}
                  </td>
                  <td className="px-6 py-3">{milestone.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm ring-gray-200/70">
        <CardHeader>
          <CardTitle>Dokumen</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-6 py-3">Dokumen</th>
                <th className="px-6 py-3">Tipe</th>
                <th className="px-6 py-3">Ukuran</th>
                <th className="px-6 py-3">Verifikasi</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {project.documents.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    Belum ada dokumen.
                  </td>
                </tr>
              )}

              {project.documents.map((doc) => (
                <tr key={doc.id} className="border-t">
                  <td className="px-6 py-3 font-medium text-gray-700">
                    {doc.title}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {doc.document_type}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {(doc.file_size / 1024).toFixed(1)} KB
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {doc.verification_status}
                  </td>
                  <td className="px-6 py-3">
                    <a
                      href={toFileUrl(doc.file_path)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Lihat
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
