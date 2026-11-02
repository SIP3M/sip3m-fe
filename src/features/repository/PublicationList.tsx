import { useState } from "react";
import PengabdianRepositoryTab from "./components/PengabdianRepositoryTab";
import PublikasiDosenTab from "./components/PublikasiDosenTab";

const TABS = [
  { key: "pengabdian", label: "Repository Pengabdian" },
  { key: "publikasi", label: "Publikasi Dosen" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function PublicationList() {
  const [activeTab, setActiveTab] = useState<TabKey>("pengabdian");

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

      {/* TABS */}
      <div className="flex justify-center gap-2 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-sm px-5 py-2 rounded-full border cursor-pointer transition-colors ${
              activeTab === tab.key
                ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* KONTEN */}
      {activeTab === "pengabdian" ? (
        <PengabdianRepositoryTab />
      ) : (
        <PublikasiDosenTab />
      )}
    </div>
  );
}
