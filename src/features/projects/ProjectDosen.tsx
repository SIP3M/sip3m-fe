import { useState, useEffect, useCallback, FormEvent, useRef } from "react";
import { Check, Upload, Loader2, Search, FileText, RefreshCw, AlertCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getPengabdianProjects, uploadMilestoneDocuments } from "./project.api";
import { PengabdianProject, PengabdianMilestone } from "./project.types";

export default function ProjectDosen() {
  const [projects, setProjects] = useState<PengabdianProject[]>([]);
  const [meta, setMeta] = useState({ totalData: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PengabdianProject | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<PengabdianMilestone | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Files
  const [laporanFile, setLaporanFile] = useState<File | null>(null);
  const [logbookFile, setLogbookFile] = useState<File | null>(null);
  const [anggaranFile, setAnggaranFile] = useState<File | null>(null);

  // Refs
  const laporanRef = useRef<HTMLInputElement>(null);
  const logbookRef = useRef<HTMLInputElement>(null);
  const anggaranRef = useRef<HTMLInputElement>(null);

  // Fetch
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPengabdianProjects({
        page,
        search: debouncedSearch || undefined,
      });
      setProjects(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Gagal memuat proyek.");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Upload handler
  const handleUploadClick = (project: PengabdianProject, milestone: PengabdianMilestone) => {
    setSelectedProject(project);
    setSelectedMilestone(milestone);
    setLaporanFile(null);
    setLogbookFile(null);
    setAnggaranFile(null);
    setIsModalOpen(true);
  };

  const submitUpload = async (e: FormEvent, isDraft: boolean) => {
    e.preventDefault();
    if (!selectedProject || !selectedMilestone) return;
    if (!laporanFile) {
      alert("File Laporan Utama wajib diisi.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("projectId", String(selectedProject.id));
      formData.append("milestoneId", String(selectedMilestone.id));
      formData.append("isDraft", String(isDraft));

      formData.append("laporan", laporanFile);
      if (logbookFile) formData.append("logbook", logbookFile);
      if (anggaranFile) formData.append("anggaran", anggaranFile);

      await uploadMilestoneDocuments(formData);

      setIsModalOpen(false);
      alert(isDraft ? "Draft berhasil disimpan!" : "Dokumen final berhasil dikirim!");
      fetchProjects();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || "Gagal mengunggah dokumen.");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED": return "Selesai";
      case "SEDANG_BERJALAN": return "Sedang Berjalan";
      case "ONGOING": return "Sedang Berjalan";
      case "SELESAI": return "Selesai";
      default: return status.replace(/_/g, " ");
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* HEADER */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Proyek Saya</h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Kelola milestone dan laporan kemajuan penelitian & pengabdian.
          </p>
        </div>
        <button
          onClick={fetchProjects}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-200 bg-white rounded-xl px-4 py-2 transition-all shadow-sm hover:shadow active:scale-95"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-2.5 rounded-2xl shadow-sm mb-6 border border-gray-200/60 max-w-2xl">
        <div className="flex items-center bg-gray-50 px-4 py-2.5 rounded-xl">
          <Search size={18} className="text-gray-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Cari proposal, peneliti, atau dokumen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full placeholder:text-gray-400 text-gray-700"
          />
        </div>
      </div>

      {/* PROJECT LIST */}
      <div className="space-y-6">
        {isLoading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-200/60">
            <Loader2 size={28} className="animate-spin text-red-500" />
            <span className="text-sm font-medium">Memuat proyek Anda...</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center gap-3 py-20 text-center bg-white rounded-2xl shadow-sm border border-gray-200/60">
            <AlertCircle size={36} className="text-red-400" />
            <p className="text-base text-red-600 font-medium">{error}</p>
            <button onClick={fetchProjects} className="text-sm text-gray-500 underline mt-2 hover:text-gray-700 font-medium">Coba Lagi</button>
          </div>
        )}

        {!isLoading && !error && projects.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center bg-white rounded-2xl shadow-sm border border-gray-200/60">
            <div className="bg-gray-50 p-4 rounded-full">
              <FileText size={32} className="text-gray-300" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-700">Belum ada proyek pengabdian.</p>
              <p className="text-sm text-gray-500 mt-1">Proyek yang telah disetujui akan muncul di sini.</p>
            </div>
          </div>
        )}

        {projects.map((project) => {
          // Sort milestones by sequence
          const sortedMilestones = [...project.milestones].sort((a, b) => a.sequence - b.sequence);
          // Find the active ongoing milestone (first that is NOT COMPLETED), ignoring sequence 1
          // Cari milestone pertama yang belum COMPLETED
const ongoingMilestone = sortedMilestones.find((m) => m.status !== "COMPLETED");

          return (
            <div key={project.id} className="bg-white rounded-[1.25rem] shadow-sm p-6 lg:p-8 border border-gray-200/70">

              <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
                <div className="flex-1 max-w-3xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] px-3 py-1 rounded-full font-semibold bg-green-100 text-green-700 tracking-wide">
                      {getStatusLabel(project.status)}
                    </span>
                    <span className="text-xs font-mono text-gray-400 font-medium">
                      {project.project_code}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                    {project.title}
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-4xl">
                    {project.proposal?.id ? "Penelitian fokus pada tahapan kegiatan yang direncanakan untuk mitigasi atau pengembangan sesuai proposal." : "Penelitian pengabdian masyarakat."}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Progress Keseluruhan
                  </p>
                  <div className="flex items-baseline justify-end">
                    <p className="text-[2.5rem] font-extrabold text-red-600 tracking-tight leading-none">
                      {project.overall_progress}
                      <span className="text-2xl font-bold">%</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="relative mt-12 mb-10 mx-auto w-full px-2">
                {/* Horizontal Background Line */}
                <div className="absolute top-[14px] left-[10%] right-[10%] h-[2px] bg-gray-200 -z-0">
                  {/* Active fill line */}
                  <div
                    className="h-full bg-red-500 transition-all duration-1000 ease-out"
                    style={{ width: `${project.overall_progress}%` }}
                  />
                </div>

                <div className="relative z-10 flex justify-between">
                  {sortedMilestones.map((milestone) => {
                    // Force sequence 1 to be visually completed if it's not the only one, or just trust the logic
                    const isVisuallyCompleted = milestone.status === "COMPLETED"
                    const isVisuallyOngoing = ongoingMilestone?.id === milestone.id;
                    const isVisuallyPending = !isVisuallyCompleted && !isVisuallyOngoing;

                    return (
                      <div key={milestone.id} className="flex flex-col items-center text-center w-1/4">
                        <div className="h-8 flex items-center justify-center mb-3">
                          {isVisuallyCompleted && (
                            <div className="w-[30px] h-[30px] rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm ring-4 ring-white">
                              <Check size={18} strokeWidth={3} />
                            </div>
                          )}

                          {isVisuallyOngoing && (
                            <div className="w-[30px] h-[30px] rounded-full bg-white border-[3px] border-red-600 flex items-center justify-center ring-4 ring-white">
                              <div className="w-3 h-3 rounded-full bg-red-600"></div>
                            </div>
                          )}

                          {isVisuallyPending && (
                            <div className="w-[26px] h-[26px] rounded-full bg-white border-[3px] border-gray-300 ring-4 ring-white"></div>
                          )}
                        </div>

                        <p className={`text-[13px] leading-tight font-bold max-w-[140px] ${isVisuallyOngoing ? 'text-red-600' : isVisuallyCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {milestone.title} {milestone.target_percentage > 0 && `(${milestone.target_percentage}%)`}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                          {/* We don't have due_date in the data by default, placeholder format */}
                          2023-11-10
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTION AREA (ONLY SHOWS IF ONGOING MILESTONE EXISTS) */}
{/* ACTION AREA (TERGANTUNG STATUS PROYEK) */}
              {project.status === "PENDING" || project.status === "MENUNGGU_PERSETUJUAN" ? (
                // JIKA PROYEK MASIH PENDING: Tampilkan kotak biru, sembunyikan semua tombol upload
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-10 flex flex-col items-center justify-center gap-3 shadow-sm max-w-4xl mx-auto text-center">
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <AlertCircle size={24} className="text-blue-500" />
                  </div>
                  <p className="text-[14px] font-semibold text-blue-800">
                    Proyek ini sedang menunggu persetujuan / SK dari Admin LPPM untuk dapat dimulai.
                  </p>
                </div>
              ) : ongoingMilestone ? (
                // JIKA PROYEK SUDAH ONGOING: Baru tampilkan tombol upload untuk milestone yang aktif
                <div className="border border-gray-200 bg-white rounded-2xl p-5 mt-10 flex flex-col md:flex-row justify-between items-center gap-5 shadow-sm max-w-4xl mx-auto">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="border border-gray-200 rounded-xl p-3 text-red-600 bg-white shrink-0 shadow-sm">
                      <Upload size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-gray-900">
                        Upload {ongoingMilestone.title} {ongoingMilestone.target_percentage > 0 && `(${ongoingMilestone.target_percentage}%)`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        Tenggat waktu: 10 November 2023
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto justify-end">
                    <button className="px-5 py-2.5 text-[13px] font-bold border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all focus:ring-2 focus:ring-gray-200 outline-none">
                      Lihat Panduan
                    </button>
                    <button
                      onClick={() => handleUploadClick(project, ongoingMilestone)}
                      className="px-5 py-2.5 text-[13px] font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-sm shadow-red-600/30 whitespace-nowrap focus:ring-2 focus:ring-red-600 focus:ring-offset-2 outline-none"
                    >
                      Upload Dokumen
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      {!isLoading && !error && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 text-sm text-gray-600 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="font-medium">
            Halaman {meta.currentPage} dari {meta.totalPages} &bull; <span className="text-gray-400">{meta.totalData} total proyek</span>
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors font-semibold"
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors font-semibold"
            >
              Berikutnya <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL OVERLAY */}
      {isModalOpen && selectedMilestone && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => !isUploading && setIsModalOpen(false)}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 flex justify-between items-start bg-white">
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">Upload Dokumen</h3>
                <p className="text-sm text-gray-500 font-medium">{selectedMilestone.title} &bull; <span className="font-mono text-gray-400">{selectedProject.project_code}</span></p>
              </div>
              <button
                onClick={() => !isUploading && setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isUploading}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form className="px-6 pb-6 space-y-5">
              <div className="bg-blue-50 rounded-xl p-4 flex gap-3 items-start">
                <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Ketentuan Dokumen</p>
                  <p className="text-blue-800/80 leading-relaxed text-xs">
                    Format file harus PDF, DOCX, XLSX, atau ZIP (Maks 10MB). Laporan utama <strong>wajib</strong> diunggah.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Laporan Utama <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.docx,.xlsx,.zip"
                      ref={laporanRef}
                      onChange={(e) => setLaporanFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 border border-gray-200 rounded-xl p-1 focus:ring-2 focus:ring-red-500/20 outline-none transition-all cursor-pointer"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Logbook Kegiatan <span className="text-xs font-medium text-gray-400 ml-1 font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.xlsx,.zip"
                    ref={logbookRef}
                    onChange={(e) => setLogbookFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 border border-gray-200 rounded-xl p-1 outline-none transition-all cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Bukti Penggunaan Anggaran <span className="text-xs font-medium text-gray-400 ml-1 font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.xlsx,.zip"
                    ref={anggaranRef}
                    onChange={(e) => setAnggaranFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 border border-gray-200 rounded-xl p-1 outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 items-center">
              <button
                type="button"
                onClick={() => !isUploading && setIsModalOpen(false)}
                className="px-4 py-2.5 text-[13px] font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                disabled={isUploading}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={(e) => submitUpload(e, true)}
                className="px-4 py-2.5 text-[13px] font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 flex items-center gap-2 transition-colors"
                disabled={isUploading}
              >
                {isUploading ? <Loader2 size={14} className="animate-spin text-gray-400" /> : null}
                Simpan Draft
              </button>
              <button
                type="button"
                onClick={(e) => submitUpload(e, false)}
                className="px-6 py-2.5 text-[13px] font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 flex items-center gap-2 shadow-sm shadow-red-600/30 transition-colors"
                disabled={isUploading}
              >
                {isUploading ? <Loader2 size={16} className="animate-spin text-white/80" /> : <Upload size={16} />}
                Kirim Final
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}