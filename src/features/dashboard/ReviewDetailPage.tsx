import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, FileText } from "lucide-react";

export default function ReviewDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [scores, setScores] = useState({
    masalah: 0,
    pustaka: 0,
    metode: 0,
    anggaran: 0,
    luaran: 0,
  });

  const [strength, setStrength] = useState("");
  const [weakness, setWeakness] = useState("");
  const [rekomendasi, setRekomendasi] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // 🔥 HITUNG BOBOT
  const total =
    scores.masalah * 0.15 +
    scores.pustaka * 0.15 +
    scores.metode * 0.25 +
    scores.anggaran * 0.1 +
    scores.luaran * 0.35;

  // 🔥 AUTO REKOMENDASI
  useEffect(() => {
    if (total >= 85) setRekomendasi("Direkomendasikan");
    else if (total >= 70) setRekomendasi("Perlu Revisi");
    else setRekomendasi("Ditolak");
  }, [total]);

  // 🔥 LOAD DATA
  useEffect(() => {
    const saved = localStorage.getItem("review-" + id);
    if (saved) {
      const data = JSON.parse(saved);
      setScores(data.scores);
      setStrength(data.strength);
      setWeakness(data.weakness);
      setRekomendasi(data.rekomendasi);
    }
  }, [id]);

  // 🔥 AUTO SAVE
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(
        "review-" + id,
        JSON.stringify({ scores, strength, weakness, rekomendasi })
      );
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 1500);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [scores, strength, weakness, rekomendasi, id]);

  const handleSubmit = () => {
    alert("Review berhasil dikirim!");
    navigate("/reviewer-dashboard");
  };

  const getStatusColor = () => {
    if (total >= 85) return "text-green-600";
    if (total >= 70) return "text-yellow-500";
    return "text-red-600";
  };

  const isValid =
    strength && weakness && scores.masalah > 0 && scores.metode > 0;

  return (
    <div className="bg-gray-50 min-h-screen p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          {/* 🔥 FIX BACK BUTTON */}
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 mb-2 flex items-center gap-1 hover:text-gray-700"
          >
            <ArrowLeft size={16} /> Kembali
          </button>

          <h1 className="text-xl font-semibold text-gray-800">
            Form Penilaian Proposal
          </h1>
          <p className="text-sm text-gray-500">
            Review usulan penelitian #PROP-001
          </p>
        </div>

        <div className="flex flex-col items-end">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg disabled:bg-gray-300"
          >
            Submit Review
          </button>

          {isSaved && (
            <p className="text-xs text-green-600 mt-1">
              Draft tersimpan ✔
            </p>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-3 gap-4">

        {/* LEFT */}
        <div className="col-span-2 space-y-4">

          {/* PROPOSAL */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <h2 className="font-semibold text-gray-800">
                Pengembangan Algoritma AI untuk Deteksi Hama Padi di Cirebon
              </h2>

              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                Penelitian Terapan
              </span>
            </div>

            <p className="text-sm font-medium mt-3">Abstrak</p>
            <p className="text-sm text-gray-500 mt-1">
              Penggunaan teknologi AI dalam pertanian untuk deteksi hama secara otomatis.
            </p>

            <div className="bg-gray-100 rounded-lg p-3 flex justify-between mt-4 text-sm">
              <p>
                Ketua Peneliti <br />
                <span className="text-gray-600">Budi Peneliti</span>
              </p>
              <p>
                Total Anggaran <br />
                <span className="text-gray-600">Rp 15.000.000</span>
              </p>
            </div>

            <div className="mt-4 flex gap-2 text-xs">
              <button
                onClick={() => window.open("/dummy/proposal.pdf", "_blank")}
                className="border px-3 py-1 rounded flex items-center gap-1"
              >
                <FileText size={14} /> Proposal.pdf
              </button>
            </div>
          </div>

          {/* KOMENTAR */}
          <div className="bg-white p-5 rounded-xl shadow-sm space-y-4">
            <div>
              <p className="text-sm font-medium">Kekuatan Proposal</p>
              <textarea
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <p className="text-sm font-medium">
                Kelemahan / Saran Perbaikan
              </p>
              <textarea
                value={weakness}
                onChange={(e) => setWeakness(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2 text-sm"
              />
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="bg-white p-5 rounded-xl shadow-sm">

          <p className="font-semibold mb-4">Indikator Penilaian</p>

          {[
            { label: "Perumusan Masalah", key: "masalah" },
            { label: "Tinjauan Pustaka", key: "pustaka" },
            { label: "Metode Penelitian", key: "metode" },
            { label: "Kelayakan Anggaran", key: "anggaran" },
            { label: "Luaran & Kontribusi", key: "luaran" },
          ].map((item) => (
            <div key={item.key} className="flex justify-between mb-3 text-sm">
              <p>{item.label}</p>
              <input
                type="number"
                value={scores[item.key as keyof typeof scores]}
                onChange={(e) => {
                  const value = Math.min(
                    100,
                    Math.max(0, Number(e.target.value))
                  );
                  setScores({
                    ...scores,
                    [item.key]: value,
                  });
                }}
                className="w-16 border rounded px-2 py-1 text-sm"
              />
            </div>
          ))}

          {/* TOTAL */}
          <div className="mt-4 border-t pt-3">
            <p className="text-sm text-gray-500">Total Skor</p>
            <p className={`text-xl font-bold ${getStatusColor()}`}>
              {total.toFixed(1)}
            </p>

            {/* PROGRESS */}
            <div className="w-full bg-gray-200 h-2 rounded mt-2">
              <div
                className="bg-red-500 h-2 rounded"
                style={{ width: `${total}%` }}
              />
            </div>
          </div>

          {/* REKOMENDASI */}
          <div className="mt-4">
            <p className="text-sm mb-1">Rekomendasi</p>
            <input
              value={rekomendasi}
              readOnly
              className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
            />
          </div>

        </div>

      </div>

    </div>
  );
}