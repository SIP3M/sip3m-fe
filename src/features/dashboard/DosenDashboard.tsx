import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Activity, AlertCircle, RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { getPengabdianProjects } from "@/features/projects/project.api";
import { getMyProposals } from "@/features/proposals/proposal.api";
import type { PengabdianProject } from "@/features/projects/project.types";
import type { Proposal } from "@/features/proposals/proposal.types";
import { useAuthStore } from "@/features/auth/auth.store";

/* ------------------------------------------------------------------ */
/* Status helpers — label & warna mengikuti ProposalDosen / ProjectDosen*/
/* ------------------------------------------------------------------ */

const normalizeStatus = (status: string) =>
  status
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const proposalStatusLabel: Record<string, string> = {
  REVIEW: "Review",
  UNDER_REVIEW: "Under Review",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  ACCEPTED: "Accepted",
  DRAFT: "Draft",
  REVISION: "Revision",
  REJECTED: "Rejected",
  ADMIN_VERIFIED: "Admin Verified",
  REVIEW_DONE: "Menunggu Keputusan",
};

const proposalStatusStyle: Record<string, string> = {
  REVIEW: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  SUBMITTED: "bg-orange-100 text-orange-600",
  APPROVED: "bg-green-100 text-green-600",
  ACCEPTED: "bg-green-100 text-green-600",
  DRAFT: "bg-gray-100 text-gray-600",
  REVISION: "bg-red-100 text-red-600",
  REJECTED: "bg-red-100 text-red-700",
  ADMIN_VERIFIED: "bg-blue-100 text-blue-700",
  REVIEW_DONE: "bg-indigo-100 text-indigo-700",
};

const projectStatusLabel = (status: string) => {
  switch (normalizeStatus(status)) {
    case "SEDANG_BERJALAN":
      return "Sedang Berjalan";
    case "SELESAI":
    case "COMPLETED":
      return "Selesai";
    case "PENDING":
      return "Menunggu";
    default:
      return status.replace(/_/g, " ");
  }
};

const projectStatusStyle: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  SEDANG_BERJALAN: "bg-green-100 text-green-700",
  SELESAI: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-blue-100 text-blue-700",
};

const isCompletedProject = (status: string) => {
  const key = normalizeStatus(status);
  return key === "SELESAI" || key === "COMPLETED";
};

/** Milestone yang belum selesai (urut sequence) — sumber label "Next: ..." */
const getNextMilestone = (project: PengabdianProject) =>
  [...(project.milestones ?? [])]
    .sort((a, b) => a.sequence - b.sequence)
    .find((milestone) => milestone.status !== "COMPLETED");

export default function DosenDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [projects, setProjects] = useState<PengabdianProject[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalTotal, setProposalTotal] = useState(0);
  const [revisionTotal, setRevisionTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [projectRes, proposalRes, revisionRes] = await Promise.all([
        getPengabdianProjects({ limit: 100 }),
        getMyProposals({ page: 1 }),
        getMyProposals({ page: 1, status: "REVISION" }),
      ]);

      setProjects(projectRes.data ?? []);
      setProposals(proposalRes.data ?? []);
      setProposalTotal(proposalRes.meta?.totalData ?? proposalRes.data?.length ?? 0);
      setRevisionTotal(
        revisionRes.meta?.totalData ?? revisionRes.data?.length ?? 0,
      );
    } catch {
      setLoadError("Gagal memuat data dashboard. Silakan coba muat ulang.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeProjects = useMemo(
    () => projects.filter((project) => !isCompletedProject(project.status)),
    [projects],
  );

  // Grafik progres: diambil dari overall_progress milik BE (0/30/70/100),
  // bukan dihitung dari sequence milestone.
  const lineData = useMemo(
    () =>
      activeProjects.map((project) => ({
        name:
          project.title.length > 16
            ? `${project.title.slice(0, 16)}…`
            : project.title,
        value: project.overall_progress ?? 0,
      })),
    [activeProjects],
  );

  // Distribusi status proposal milik sendiri (halaman "Proposal Saya")
  const pieData = useMemo(() => {
    const count = (keys: string[]) =>
      proposals.filter((proposal) => keys.includes(normalizeStatus(proposal.status)))
        .length;

    return [
      {
        name: "Disetujui",
        value: count(["APPROVED", "ACCEPTED", "ADMIN_VERIFIED"]),
        color: "#22c55e",
      },
      {
        name: "Review",
        value: count(["SUBMITTED", "UNDER_REVIEW", "REVIEW"]),
        color: "#facc15",
      },
      {
        name: "Menunggu Keputusan",
        value: count(["REVIEW_DONE"]),
        color: "#6366f1",
      },
      {
        name: "Revisi",
        value: count(["REVISION", "REJECTED"]),
        color: "#f97316",
      },
    ];
  }, [proposals]);

  const pieTotal = pieData.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="p-4 sm:p-6 min-h-screen overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Selamat Datang, {user?.name || "Dosen"}
          </h1>
          <p className="text-gray-500 text-sm">
            Kelola penelitian dan pengabdian Anda di sini.
          </p>
        </div>
        <button
          onClick={() => void fetchDashboard()}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-200 bg-white rounded-xl px-4 py-2 cursor-pointer transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-60"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          Muat Ulang
        </button>
      </div>

      {loadError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
        </div>
      ) : (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Proposal</p>
                <p className="text-xl font-bold">{proposalTotal}</p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Activity className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Proyek Aktif</p>
                <p className="text-xl font-bold">{activeProjects.length}</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-xl flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertCircle className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Perlu Revisi</p>
                <p className="text-xl font-bold">{revisionTotal}</p>
              </div>
            </div>
          </div>

          {/* Middle Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Progres proyek — overall_progress dari API */}
            <div className="bg-white p-4 rounded-xl">
              <h2 className="font-semibold text-gray-700 mb-1">
                Progres Proyek Pengabdian
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Persentase keseluruhan tiap proyek aktif (dari API)
              </p>

              {lineData.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">
                  Belum ada proyek aktif.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={lineData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Donut Chart — distribusi status proposal milik sendiri */}
            <div className="bg-white p-4 rounded-xl flex flex-col items-center">
              <h2 className="font-semibold text-gray-700 mb-1 w-full">
                Status Proposal
              </h2>
              <p className="text-sm text-gray-400 mb-4 w-full">
                Distribusi status proposal yang diajukan
              </p>

              {pieTotal === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">
                  Belum ada proposal.
                </div>
              ) : (
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}

              <div className="flex gap-4 mt-2 text-sm flex-wrap justify-center">
                {pieData.map((entry) => (
                  <span key={entry.name} style={{ color: entry.color }}>
                    ■ {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Proposal Saya */}
            <div className="bg-white p-4 rounded-xl">
              <div className="flex justify-between mb-3">
                <h2 className="font-semibold text-gray-700">Proposal Saya</h2>
                <span
                  className="text-sm text-gray-400 cursor-pointer hover:text-gray-600"
                  onClick={() => navigate("/dosen-dashboard/proposals")}
                >
                  Lihat Semua
                </span>
              </div>

              {proposals.length === 0 ? (
                <p className="text-sm text-gray-400">Belum ada proposal.</p>
              ) : (
                <div className="space-y-3 text-sm">
                  {proposals.slice(0, 5).map((proposal) => {
                    const key = normalizeStatus(proposal.status);
                    return (
                      <div
                        key={proposal.id}
                        className="flex justify-between gap-4 cursor-pointer"
                        onClick={() =>
                          navigate(`/dosen-dashboard/proposals/${proposal.id}`)
                        }
                      >
                        <p className="line-clamp-2">{proposal.title}</p>
                        <span
                          className={`px-2 rounded shrink-0 h-fit ${
                            proposalStatusStyle[key] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {proposalStatusLabel[key] || proposal.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Proyek Berjalan */}
            <div className="bg-white p-4 rounded-xl">
              <div className="flex justify-between mb-3">
                <h2 className="font-semibold text-gray-700">Proyek Berjalan</h2>
                <span
                  className="text-sm text-gray-400 cursor-pointer hover:text-gray-600"
                  onClick={() => navigate("/dosen-dashboard/project-dosen")}
                >
                  Lihat Semua
                </span>
              </div>

              {activeProjects.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Tidak ada proyek yang sedang berjalan.
                </p>
              ) : (
                <div className="space-y-4 text-sm">
                  {activeProjects.slice(0, 5).map((project) => {
                    const next = getNextMilestone(project);
                    const progress = Math.max(
                      0,
                      Math.min(100, project.overall_progress ?? 0),
                    );

                    return (
                      <div
                        key={project.id}
                        className="cursor-pointer"
                        onClick={() =>
                          navigate("/dosen-dashboard/project-dosen")
                        }
                      >
                        <div className="flex justify-between gap-4">
                          <p className="line-clamp-1">{project.title}</p>
                          <span
                            className={`px-2 rounded shrink-0 h-fit ${
                              projectStatusStyle[
                                normalizeStatus(project.status)
                              ] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {projectStatusLabel(project.status)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded mt-1">
                          <div
                            className="bg-red-500 h-2 rounded transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                          {progress}% · Next:{" "}
                          {next ? next.title : "Semua milestone selesai"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
