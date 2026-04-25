import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle2, Loader2, AlertCircle, FileText } from "lucide-react";
import { getPengabdianProjects, uploadMilestoneDocuments } from "../projects/project.api";
import { PengabdianProject, PengabdianMilestone } from "../projects/project.types";

type FileItem = {
  file: File;
  progress: number;
  status: "idle" | "uploading" | "done" | "error";
};

export default function Laporan() {
  const [projects, setProjects] = useState<PengabdianProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");

  const [files, setFiles] = useState<Record<string, FileItem | null>>({
    laporan: null,
    logbook: null,
    anggaran: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const res = await getPengabdianProjects({ limit: 100 });
      // Only keep projects that have an ongoing milestone with sequence > 1
      const projectsWithOngoingReport = res.data.filter((p) => {
        const sorted = [...p.milestones].sort((a, b) => a.sequence - b.sequence);
        return sorted.some((m) => m.status !== "COMPLETED" && m.sequence > 1);
      });
      setProjects(projectsWithOngoingReport);
      if (projectsWithOngoingReport.length > 0) {
        setSelectedProjectId(projectsWithOngoingReport[0].id);
      }
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const sortedMilestones = selectedProject ? [...selectedProject.milestones].sort((a, b) => a.sequence - b.sequence) : [];
  const activeMilestone = sortedMilestones.find((m) => m.status !== "COMPLETED" && m.sequence > 1);

  const resetForm = () => {
    setFiles({ laporan: null, logbook: null, anggaran: null });
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProjectId(Number(e.target.value));
    resetForm();
  };

  const handleUploadSubmit = async (isDraft: boolean) => {
    if (!selectedProject || !activeMilestone) return;

    if (!files.laporan?.file) {
      alert("File Laporan Utama wajib diunggah.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("projectId", String(selectedProject.id));
      formData.append("milestoneId", String(activeMilestone.id));
      formData.append("isDraft", String(isDraft));

      formData.append("laporan", files.laporan.file);
      if (files.logbook?.file) formData.append("logbook", files.logbook.file);
      if (files.anggaran?.file) formData.append("anggaran", files.anggaran.file);

      // We track overall progress for all files simultaneously here
      await uploadMilestoneDocuments(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));

        setFiles((prev) => {
          const newFiles = { ...prev };
          Object.keys(newFiles).forEach((key) => {
            if (newFiles[key]) {
              newFiles[key]!.progress = percentCompleted;
              newFiles[key]!.status = percentCompleted === 100 ? "done" : "uploading";
            }
          });
          return newFiles;
        });
      });

      alert(isDraft ? "Draft berhasil disimpan!" : "Dokumen final berhasil dikirim!");

      // Refresh to remove the project from the list if it's no longer ONGOING, or reset form
      if (!isDraft) {
        fetchProjects();
        resetForm();
      } else {
        // If draft, just reset form to show empty
        resetForm();
      }

    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || "Gagal mengunggah dokumen.");
      setFiles((prev) => {
        const newFiles = { ...prev };
        Object.keys(newFiles).forEach((key) => {
          if (newFiles[key]) newFiles[key]!.status = "error";
        });
        return newFiles;
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const DropBox = ({
    name,
    label,
    accept,
    optional = false,
  }: {
    name: string;
    label: string;
    accept: Record<string, string[]>;
    optional?: boolean;
  }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];

      setFiles((prev) => ({
        ...prev,
        [name]: { file, progress: 0, status: "idle" },
      }));
    }, [name]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      multiple: false,
      accept,
    });

    const fileData = files[name];

    return (
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-gray-700">
            {label} {!optional && <span className="text-red-500">*</span>}
          </p>
          {optional && <span className="text-xs font-medium text-gray-400">Opsional</span>}
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors
            ${isDragActive ? "border-red-400 bg-red-50" : "border-gray-200 hover:bg-gray-50 bg-white"}
            ${fileData ? "border-green-300 bg-green-50/30 hover:bg-green-50/50" : ""}
          `}
        >
          <input {...getInputProps()} disabled={isSubmitting} />

          {!fileData ? (
            <>
              <div className={`p-3 rounded-full mb-3 ${isDragActive ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                <Upload size={20} />
              </div>
              <p className="text-sm font-medium text-gray-700">Tarik & lepas file di sini</p>
              <p className="text-xs text-gray-400 mt-1">atau klik untuk menelusuri (Maks 10 MB)</p>
            </>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center gap-2 mb-3">
                {fileData.status === "done" ? (
                  <CheckCircle2 size={20} className="text-green-500" />
                ) : (
                  <FileText size={20} className="text-blue-500" />
                )}
                <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]" title={fileData.file.name}>
                  {fileData.file.name}
                </p>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${fileData.status === 'error' ? 'bg-red-500' : fileData.status === 'done' ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${fileData.progress}%` }}
                />
              </div>

              <div className="flex justify-between w-full mt-2">
                <p className="text-xs font-medium text-gray-500">
                  {fileData.status === "uploading" ? "Mengunggah..." : fileData.status === "done" ? "Selesai" : fileData.status === "error" ? "Gagal" : "Siap diunggah"}
                </p>
                <p className="text-xs font-semibold text-gray-700">{fileData.progress}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoadingProjects) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
        <p className="text-sm font-medium">Memuat data proyek...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">
          Upload Laporan
        </h1>
        <p className="text-sm text-gray-500">
          Kelola dan unggah laporan kemajuan serta laporan akhir penelitian Anda secara terpusat.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <CheckCircle2 size={36} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Tidak Ada Laporan Tertunda</h3>
          <p className="text-sm text-gray-500 max-w-md">Saat ini tidak ada proyek pengabdian yang membutuhkan unggahan laporan kemajuan atau laporan akhir.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT (FORM) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8 border border-gray-200/60">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Formulir Upload Dokumen</h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Proyek Pengabdian</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 block p-3 outline-none transition-colors font-medium"
                  value={selectedProjectId}
                  onChange={handleProjectChange}
                  disabled={isSubmitting}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.project_code} - {p.title}</option>
                  ))}
                </select>
              </div>

              {activeMilestone && (
                <div className="bg-blue-50/50 border border-blue-100 text-blue-800 text-sm p-4 rounded-xl mb-8 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="font-bold">Target Pelaporan</p>
                    <p className="text-blue-600/80 mt-0.5">{activeMilestone.title} {activeMilestone.target_percentage > 0 && `(${activeMilestone.target_percentage}%)`}</p>
                  </div>
                </div>
              )}

              <DropBox
                name="laporan"
                label="Dokumen Laporan"
                accept={{ 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }}
              />
              <DropBox
                name="logbook"
                label="Logbook Kegiatan"
                accept={{ 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }}
                optional
              />
              <DropBox
                name="anggaran"
                label="Bukti Penggunaan Anggaran"
                accept={{ 'application/zip': ['.zip'], 'application/x-zip-compressed': ['.zip'] }}
                optional
              />

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => handleUploadSubmit(true)}
                  disabled={isSubmitting || !files.laporan?.file}
                  className="px-6 py-3 text-sm font-bold border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 outline-none focus:ring-2 focus:ring-gray-200"
                >
                  Simpan Draft
                </button>
                <button
                  onClick={() => handleUploadSubmit(false)}
                  disabled={isSubmitting || !files.laporan?.file}
                  className="px-8 py-3 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-sm shadow-red-600/20 transition-all disabled:opacity-50 outline-none flex items-center justify-center gap-2 focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                  ) : (
                    <><Upload size={16} /> Kirim Final</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT (SIDEBAR) */}
          <div className="space-y-6">
            {selectedProject && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200/60 sticky top-6">
                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Info Proyek Aktif</h2>
                <div className="mb-5">
                  <span className="text-[10px] font-mono font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {selectedProject.project_code}
                  </span>
                  <p className="text-sm font-bold text-gray-900 mt-2 leading-snug">
                    {selectedProject.title}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Progress Keseluruhan</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: `${selectedProject.overall_progress}%` }}></div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{selectedProject.overall_progress}%</span>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mt-6 flex gap-3 items-start">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-800 mb-1">Perhatian</p>
                    <p className="text-[11px] text-red-700/80 leading-relaxed">
                      Pastikan semua dokumen telah disetujui dan ditandatangani sebelum mengunggah. Mengunggah laporan final akan otomatis memajukan tahapan proyek Anda.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}