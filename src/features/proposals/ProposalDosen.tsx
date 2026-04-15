import { Eye, Pencil, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// ====== TYPES ======
type Proposal = {
  id: number;
  title: string;
  code: string;
  schema: string;
  year: number;
  status: "REVIEW" | "SUBMITTED" | "APPROVED" | "DRAFT" | "REVISION";
};

// ====== FAKE API (ganti ke backend kamu) ======
async function fetchProposals(): Promise<Proposal[]> {
  // TODO: ganti ke fetch/axios ke backend
  return new Promise((res) =>
    setTimeout(() =>
      res([
        {
          id: 1,
          title: "Pengembangan Algoritma AI untuk Deteksi Hama Padi di Cirebon",
          code: "PROP - 001",
          schema: "Penelitian Terapan",
          year: 2023,
          status: "REVIEW",
        },
        {
          id: 2,
          title: "Pemberdayaan UMKM Batik Trusmi Melalui Digital Marketing",
          code: "PROP - 002",
          schema: "Pengabdian Masyarakat",
          year: 2023,
          status: "SUBMITTED",
        },
        {
          id: 3,
          title: "Analisis Dampak Lingkungan Limbah Pabrik Gula",
          code: "PROP - 003",
          schema: "Penelitian Dasar",
          year: 2023,
          status: "APPROVED",
        },
        {
          id: 4,
          title: "Sistem Monitoring IoT untuk Kualitas Air Sungai",
          code: "PROP - 004",
          schema: "Penelitian Terapan",
          year: 2023,
          status: "DRAFT",
        },
        {
          id: 5,
          title: "Revitalisasi Bahasa Daerah Cirebon Berbasis Aplikasi Mobile",
          code: "PROP - 005",
          schema: "Penelitian Dasar",
          year: 2023,
          status: "REVISION",
        },
      ]),
    500)
  );
}

function getStatusStyle(status: Proposal["status"]) {
  switch (status) {
    case "REVIEW":
      return "bg-yellow-100 text-yellow-600";
    case "SUBMITTED":
      return "bg-orange-100 text-orange-600";
    case "APPROVED":
      return "bg-green-100 text-green-600";
    case "DRAFT":
      return "bg-gray-200 text-gray-600";
    case "REVISION":
      return "bg-yellow-200 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function ProposalDosen() {
  const navigate = useNavigate();

  const [data, setData] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 3;

  useEffect(() => {
    fetchProposals().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return data.filter((p) => {
      const matchQuery = p.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchStatus =
        statusFilter === "ALL" || p.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [data, query, statusFilter]);

  const totalPage = Math.ceil(filtered.length / pageSize);

  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="p-6 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Proposal Saya
          </h1>
          <p className="text-sm text-gray-500">
            Kelola usulan penelitian dan pengabdian Anda.
          </p>
        </div>

        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">
          + Buat Proposal Baru
        </button>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {/* SEARCH + FILTER */}
        <div className="flex justify-between mb-4">
          <div className="flex items-center border rounded-lg px-3 w-72">
            <Search size={16} className="text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-2 outline-none text-sm"
              placeholder="Cari judul proposal..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 text-sm"
          >
            <option value="ALL">Semua</option>
            <option value="REVIEW">Review</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="DRAFT">Draft</option>
            <option value="REVISION">Revision</option>
          </select>
        </div>

        {/* TABLE */}
        <table className="w-full text-sm">
          <thead className="text-gray-400 border-b text-left">
            <tr>
              <th className="pb-3">Judul Proposal</th>
              <th>Skema</th>
              <th>Tahun</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : (
              paginated.map((p) => (
                <tr
                  key={p.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="py-4">
                    <div className="font-medium text-gray-800">
                      {p.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {p.code}
                    </div>
                  </td>

                  <td className="text-gray-600">{p.schema}</td>
                  <td className="text-gray-600">{p.year}</td>

                  <td>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getStatusStyle(
                        p.status
                      )}`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td>
                    {p.status === "DRAFT" || p.status === "REVISION" ? (
                      <button className="flex items-center gap-1 text-xs border px-2 py-1 rounded hover:bg-gray-50">
                        <Pencil size={14} /> Edit
                      </button>
                    ) : (
                      <div className="relative group inline-block">
                        <Eye
                          size={16}
                          className="text-gray-500 cursor-pointer hover:text-black"
                          onClick={() =>
                            navigate(`/dosen-dashboard/proposals/${p.id}`)
                          }
                        />
                        <div className="absolute bottom-full mb-1 hidden group-hover:block text-xs bg-black text-white px-2 py-1 rounded">
                          Lihat Detail
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex justify-end mt-4 gap-2 text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPage)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded border ${
                page === i + 1 ? "bg-red-600 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPage}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}