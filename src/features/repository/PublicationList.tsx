import { Search, FileText } from "lucide-react";
import { useState } from "react";

type Publication = {
  id: number;
  title: string;
  author: string;
  year: number;
  category: string;
  description: string;
  pdfUrl: string;
  views: number;
};

export default function PublicationList() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"terbaru" | "terpopuler">("terbaru");

  const publications: Publication[] = [
    {
      id: 1,
      title: "Analisis Dampak Lingkungan Limbah Pabrik Gula",
      author: "Dr. Alam Lingkungan",
      year: 2023,
      category: "Penelitian Dasar",
      description:
        "Penelitian fokus pada analisis parameter lingkungan limbah cair dari pabrik gula di wilayah Cirebon Timur untuk mitigasi pencemaran sungai.",
      pdfUrl: "/dummy/limbah-gula.pdf",
      views: 120,
    },
    {
      id: 2,
      title: "Pengembangan UMKM Batik Trusmi Berbasis Digital",
      author: "Dr. Ekonomi Kreatif",
      year: 2022,
      category: "Pengabdian",
      description:
        "Program pengabdian untuk meningkatkan penjualan UMKM melalui digital marketing dan marketplace.",
      pdfUrl: "/dummy/batik-trusmi.pdf",
      views: 300,
    },
  ];

  // 🔍 FILTER SEARCH
  const filteredData = publications
    .filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (activeFilter === "terpopuler") return b.views - a.views;
      return b.year - a.year;
    });

  // 📄 DOWNLOAD HANDLER
  const handleDownload = (url: string, title: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = title + ".pdf";
    link.click();
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          Repository Penelitian & Pengabdian
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">
          Akses terbuka hasil penelitian dan pengabdian kepada masyarakat sivitas
          akademika Universitas Muhammadiyah Cirebon.
        </p>
      </div>

      {/* SEARCH */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center w-full max-w-2xl bg-white shadow-sm rounded-full px-4 py-2 border">
          <Search className="text-gray-400 mr-2" size={18} />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Cari judul penelitian, nama dosen, atau kata kunci..."
            className="flex-1 outline-none text-sm"
          />

          <button className="bg-red-600 text-white text-sm px-5 py-1.5 rounded-full">
            Cari
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-medium text-gray-700">
          Penelitian ({filteredData.length})
        </h2>

        <div className="flex gap-4 text-xs">
          <button
            onClick={() => setActiveFilter("terpopuler")}
            className={activeFilter === "terpopuler" ? "text-gray-800 font-medium" : "text-gray-400"}
          >
            Terpopuler
          </button>

          <button
            onClick={() => setActiveFilter("terbaru")}
            className={activeFilter === "terbaru" ? "text-red-600 font-medium" : "text-gray-400"}
          >
            Terbaru
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div key={item.id} className="bg-white border rounded-xl p-5 shadow-sm">

              <div className="flex justify-between items-start">

                {/* LEFT */}
                <div>
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-md">
                    {item.category}
                  </span>

                  <h3 className="mt-2 text-base font-semibold text-gray-800">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    {item.author} • {item.year}
                  </p>

                  <p className="text-sm text-gray-500 mt-2 max-w-xl">
                    {item.description}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    👁 {item.views} views
                  </p>
                </div>

                {/* RIGHT */}
                <button
                  onClick={() => handleDownload(item.pdfUrl, item.title)}
                  className="flex items-center gap-1 text-xs border px-3 py-1.5 rounded-md hover:bg-gray-100"
                >
                  <FileText size={14} />
                  PDF
                </button>

              </div>

            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 mt-10">
            Data tidak ditemukan 😢
          </div>
        )}
      </div>

    </div>
  );
}