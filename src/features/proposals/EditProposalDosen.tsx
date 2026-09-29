import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { editProposalApi } from "./proposal.api";
import axios from "axios";

export default function EditProposalDosen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const proposalId = Number(id);
  const location = useLocation();
  
  // Mengambil data awal proposal yang dikirim dari halaman detail sebelumnya
  const existingProposal = location.state?.proposal;

  // State Form
  const [title, setTitle] = useState(existingProposal?.title || "");
  const [faculty, setFaculty] = useState(existingProposal?.faculty || "");
  const [skema, setSkema] = useState(existingProposal?.skema || "");
  const [amount, setAmount] = useState(existingProposal?.funding_request_amount || "");
  const [sumberData, setSumberData] = useState(existingProposal?.sumber_data_penelitian || "");
  const [instansi, setInstansi] = useState(existingProposal?.instansi || "");
  
  // State File Upload
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [rabFile, setRabFile] = useState<File | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");

    // Gunakan FormData karena kita akan mengunggah file binary
    const formData = new FormData();
    formData.append("title", title);
    formData.append("faculty", faculty);
    formData.append("skema", skema);
    formData.append("funding_request_amount", String(amount));
    formData.append("sumber_data_penelitian", sumberData);
    formData.append("instansi", instansi);
    formData.append("is_draft", "true"); // Tetap REVISION/DRAFT, nanti dosen submit ulangnya di halaman detail

    if (proposalFile) formData.append("proposal_file", proposalFile);
    if (rabFile) formData.append("rab_file", rabFile);

    try {
      await editProposalApi(proposalId, formData);
      alert("Perubahan proposal berhasil disimpan!");
      navigate(`/dosen-dashboard/proposals/${proposalId}`); // Balik ke halaman detail
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.message || "Gagal menyimpan perubahan.");
      } else {
        setErrorMsg("Terjadi kesalahan.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-8 max-w-3xl">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Edit & Perbaiki Proposal</h1>
        <p className="text-sm text-gray-500">Silakan perbarui data atau unggah file revisi yang diminta oleh Reviewer.</p>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700">Judul Proposal</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fakultas</label>
            <input
              type="text"
              required
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none"
            />
          </div>

{/* GANTI BLOK SKEMA PENELITIAN LAMA DENGAN INI */}
<div>
  <label className="block text-sm font-medium text-gray-700">Skema Penelitian</label>
  <select
    required
    value={skema}
    onChange={(e) => setSkema(e.target.value)}
    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none bg-white"
  >
    <option value="PENELITIAN_PENGEMBANGAN">Penelitian Pengembangan</option>
    <option value="PENELITIAN_TERAPAN">Penelitian Terapan</option>
    <option value="PENELITIAN_KOLABORASI">Penelitian Kolaborasi</option>
  </select>
</div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Dana Anggaran (IDR)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sumber Data Penelitian</label>
            <input
              type="text"
              value={sumberData}
              onChange={(e) => setSumberData(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Instansi</label>
          <input
            type="text"
            value={instansi}
            onChange={(e) => setInstansi(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none"
          />
        </div>

        <hr className="my-4 border-gray-100" />

        {/* Upload Bagian File */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">File Proposal Baru (PDF) </label>
            <div className="mt-1 flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Upload size={14} />
                <span>Pilih File</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setProposalFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-gray-500 truncate max-w-xs">
                {proposalFile ? proposalFile.name : "Belum ada file baru dipilih"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">File RAB Baru (PDF/Excel) </label>
            <div className="mt-1 flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Upload size={14} />
                <span>Pilih File</span>
                <input
                  type="file"
                  accept=".pdf,.xls,.xlsx"
                  onChange={(e) => setRabFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-gray-500 truncate max-w-xs">
                {rabFile ? rabFile.name : "Belum ada file baru dipilih"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-300"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}