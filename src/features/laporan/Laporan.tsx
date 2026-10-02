import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  ShieldAlert,
  CheckCircle,
} from "lucide-react";
import { getPengabdianProjects, uploadMilestoneDocuments } from "../projects/project.api";
import { PengabdianProject, PengabdianMilestone } from "../projects/project.types";

type FileItem = {
  file: File;
  progress: number;
  status: "idle" | "uploading" | "done" | "error";
};

// Format file diterima seragam di semua dropzone, sesuai desain
const ACCEPTED_FORMATS = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/zip": [".zip"],
  "application/x-zip-compressed": [".zip"],
};

export default function Laporan() {
  const [projects, setProjects] = useState<PengabdianProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");

  const [files, setFiles] = useState<Record<string, FileItem | null>>({
    laporan: null,
    logbook: null,
    dokumentasi: null,
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

      const projectsWithOngoingReport = res.data.filter((p) => {
        if (p.status === "PENDING" || p.status === "MENUNGGU_PERSETUJUAN") {
          return false;
        }

        const sorted = [...p.milestones].sort((a, b) => a.sequence - b.sequence);
        const hasPendingMilestone = sorted.some((m) => m.status !== "COMPLETED");

        return hasPendingMilestone;
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
  const activeMilestone = sortedMilestones.find((m) => m.status !== "COMPLETED");
  const completedMilestones = sortedMilestones.filter((m) => m.status === "COMPLETED");

  // Skema diambil dari relasi proposal jika tersedia (mengikuti pola project.proposal?.id
  // yang sudah dipakai di ProjectDosen.tsx). Fallback "-" jika field belum ada di response.
  const skemaLabel = (selectedProject as any)?.proposal?.skema || "-";

  const getMilestoneStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED": return "Terverifikasi";
      case "SEDANG_BERJALAN": return "Menunggu Upload";
      case "ONGOING": return "Menunggu Upload";
      default: return status.replace(/_/g, " ");
    }
  };

  const resetForm = () => {
    setFiles({ laporan: null, logbook: null, dokumentasi: null, anggaran: null });
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProjectId(Number(e.target.value));
    resetForm();
  };

  const handleUploadSubmit = async (isDraft: boolean) => {
    if (!selectedProject || !activeMilestone) return;

    if (!files.laporan?.file) {
      alert("File Laporan Kemajuan wajib diunggah.");
      return;
    }
    if (!files.logbook?.file) {
      alert("File Logbook Kegiatan wajib diunggah.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("projectId", String(selectedProject.id));
      formData.append("milestoneId", String(activeMilestone.id));
      formData.append("isDraft", String(isDraft));

      formData.append("laporan", files.laporan.file);
      formData.append("logbook", files.logbook.file);
      if (files.anggaran?.file) formData.append("anggaran", files.anggaran.file);
      // TODO: aktifkan baris ini begitu backend menerima field dokumentasi
      // if (files.dokumentasi?.file) formData.append("dokumentasi", files.dokumentasi.file);

      await uploadMilestoneDocuments(selectedProject.id, activeMilestone.id, formData, (progressEvent) => {
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

      if (!isDraft) {
        fetchProjects();
        resetForm();
      } else {
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
    optional = false,
  }: {
    name: string;
    label: string;
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
      accept: ACCEPTED_FORMATS,
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
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
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
              <p className="text-sm font-medium text-gray-700">Klik untuk upload atau drag file</p>
              <p className="text-xs text-gray-400 mt-1">PDF / DOCX / XLSX / ZIP &bull; Maks. 10 MB</p>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">
          {activeMilestone ? `Upload ${activeMilestone.title}` : "Upload Laporan"}
        </h1>
        <p className="text-sm text-gray-500">
          Unggah dokumen pelaporan sesuai tahapan penelitian yang sedang berlangsung.
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
        <>
          {projects.length > 1 && (
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200/60 mb-6 max-w-2xl">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Pilih Proyek Pengabdian
              </label>
              <select
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 p-3 outline-none transition-colors font-medium cursor-pointer"
                value={selectedProjectId}
                onChange={handleProjectChange}
                disabled={isSubmitting}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.project_code} - {p.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* BANNER MILESTONE AKTIF */}
          {activeMilestone && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <Clock size={16} className="text-blue-600" />
                <p className="text-sm font-bold text-blue-800">{activeMilestone.title}</p>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {getMilestoneStatusLabel(activeMilestone.status)}
                </span>
              </div>
              <p className="text-sm text-blue-700 ml-6">
                Pelaporan perkembangan {completedMilestones.length === 0 ? "awal" : "tahap"} penelitian.
              </p>
              {/* Deadline belum ada field due_date di data milestone, jadi teks generik (bukan tanggal karangan) */}
              <p className="text-xs text-blue-500 ml-6 mt-1">
                Deadline: Sesuai jadwal yang ditentukan LPPM &bull; Keterlambatan dapat memengaruhi pencairan dana tahap berikutnya.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT (FORM) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8 border border-gray-200/60">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Dokumen Wajib
                </p>

                <DropBox
                  name="laporan"
                  label={activeMilestone ? activeMilestone.title : "Laporan Kemajuan"}
                />
                <DropBox
                  name="logbook"
                  label="Logbook Kegiatan"
                />

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-6 mb-3 pt-4 border-t border-gray-100">
                  Dokumen Opsional
                </p>

                <DropBox
                  name="dokumentasi"
                  label="Dokumentasi Penelitian"
                  optional
                />
                <DropBox
                  name="anggaran"
                  label="Bukti Penggunaan Anggaran"
                  optional
                />

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => handleUploadSubmit(true)}
                    disabled={isSubmitting || !files.laporan?.file}
                    className="px-6 py-3 text-sm font-bold border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
                  >
                    Simpan Draft
                  </button>
                  <button
                    onClick={() => handleUploadSubmit(false)}
                    disabled={isSubmitting || !files.laporan?.file}
                    className="px-8 py-3 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-sm shadow-red-600/20 transition-all disabled:opacity-50 outline-none flex items-center justify-center gap-2 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                    ) : (
                      <><Upload size={16} /> Ajukan Verifikasi</>
                    )}
                  </button>
                </div>
              </div>

              {/* STATUS SETELAH PENGAJUAN — UI ONLY, belum ada API riwayat status pengajuan */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200/60">
                <h2 className="text-base font-bold text-gray-900 mb-4">Status Setelah Pengajuan</h2>

                <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                    <Clock size={16} />
                    Menunggu Verifikasi LPPM
                  </span>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                    Proses
                  </span>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-red-700">
                    <AlertCircle size={16} />
                    Perlu Revisi
                  </p>
                  <p className="text-xs text-red-500 mt-1 ml-6">
                    Contoh: "Mohon revisi bagian metodologi dan lampiran dokumentasi penelitian."
                  </p>
                </div>

                <p className="text-[11px] text-gray-400 mt-3">
                  Status di atas adalah contoh tampilan — akan diganti data status pengajuan asli begitu tersedia.
                </p>
              </div>

              {/* RIWAYAT PELAPORAN — memakai data milestone yang sudah COMPLETED (data asli) */}
              {completedMilestones.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200/60">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Riwayat Pelaporan</h2>

                  <div className="space-y-2">
                    {completedMilestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                            <FileText size={15} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{milestone.title}</p>
                            {/* Tanggal submit belum ada field-nya di data milestone */}
                            <p className="text-xs text-gray-400">Tahapan telah diselesaikan</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1 shrink-0">
                          <CheckCircle size={12} />
                          Terverifikasi
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT (SIDEBAR) */}
            <div className="space-y-6">
              {selectedProject && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200/60">
                  <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Info Proyek</h2>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-400">Judul Penelitian</p>
                      <p className="text-sm font-bold text-gray-900 mt-1 leading-snug">
                        {selectedProject.title}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Skema</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">{skemaLabel}</p>
                    </div>

                    {activeMilestone && (
                      <>
                        <div>
                          <p className="text-xs text-gray-400">Tahap Aktif</p>
                          <p className="text-sm font-bold text-red-600 mt-1">{activeMilestone.title}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Status</p>
                          <span className="inline-block mt-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                            {getMilestoneStatusLabel(activeMilestone.status)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200/60">
                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Format File</h2>
                <div className="flex flex-wrap gap-2 mb-2">
                  {["PDF", "DOCX", "XLSX", "ZIP"].map((fmt) => (
                    <span
                      key={fmt}
                      className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400">Maksimal 10 MB per file</p>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-3 items-start">
                <ShieldAlert size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-800 mb-1 uppercase tracking-wide">Perhatian</p>
                  <p className="text-[11px] text-red-700/80 leading-relaxed">
                    Pastikan semua dokumen telah ditandatangani oleh Ketua Peneliti dan diketahui oleh Dekan Fakultas sebelum diunggah.
                  </p>
                </div>
              </div>

              {/* ALUR VERIFIKASI — UI only, tahapan statis untuk konteks proses */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200/60">
                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Alur Verifikasi</h2>
                <div className="space-y-3">
                  {[
                    { step: 1, label: "Upload Dokumen", active: true },
                    { step: 2, label: "Verifikasi Staff LPPM", active: false },
                    { step: 3, label: "Revisi (jika perlu)", active: false },
                    { step: 4, label: "Disetujui LPPM", active: false },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          item.active ? "bg-red-600 text-white" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {item.step}
                      </span>
                      <p className={`text-sm ${item.active ? "font-bold text-gray-900" : "text-gray-500"}`}>
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}