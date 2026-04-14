import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Proposal = {
  id: number;
  date: string;
  title: string;
  researcher: string;
  schema: string;
};

const proposals: Proposal[] = [
  {
    id: 1,
    date: "2023-10-20",
    title: "Pemberdayaan UMKM Batik Trusmi Melalui Digital Marketing",
    researcher: "Sari Ekonomi, M.M",
    schema: "Pengabdian Masyarakat",
  },
];

export default function ProposalStaff() {
  const navigate = useNavigate();

  return (
    <div className="p-8">

      {/* TITLE */}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Verifikasi Proposal
        </h1>
        <p className="text-sm text-gray-500">
          Daftar proposal baru yang menunggu pemeriksaan administrasi.
        </p>
      </div>

      {/* CARD */}

      <div className="bg-white rounded-xl shadow-sm p-6">

        {/* SEARCH */}

        <div className="flex items-center border rounded-lg px-3 w-72 mb-6">
          <Search size={16} className="text-gray-400" />
          <input
            className="w-full p-2 outline-none text-sm"
            placeholder="Cari peneliti atau judul proposal..."
          />
        </div>

        {/* TABLE */}

        <table className="w-full text-sm">

          <thead className="text-gray-500 text-left border-b">
            <tr>
              <th className="py-3">Tgl Masuk</th>
              <th>Judul Proposal</th>
              <th>Peneliti</th>
              <th>Skema</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>

            {proposals.map((p) => (
              <tr key={p.id} className="border-b">

                <td className="py-4">{p.date}</td>

                <td className="max-w-xs">
                  {p.title}
                </td>

                <td>{p.researcher}</td>

                <td>{p.schema}</td>

                <td>
                  <button
                    onClick={() =>
                      navigate(`/staff-lppm/verifikasi-proposal/${p.id}`)
                    }
                    className="bg-red-600 text-white text-xs px-3 py-1 rounded-md hover:bg-red-700"
                  >
                    Verifikasi
                  </button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}