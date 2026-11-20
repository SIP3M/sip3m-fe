import axios from "axios";
import { ExternalLink, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import NewtonCradleLoader from "@/components/common/NewtonCradleLoader";
import Pagination from "@/components/common/Pagination";
import { getDosenPublikasi, getDosenRepository } from "../repository.api";
import type {
  DosenPublikasiBasis,
  DosenPublikasiItem,
  DosenRepositoryItem,
  DosenRepositorySync,
} from "../repository.types";
import SearchPill from "./SearchPill";

/**
 * Tabel dosen repository: baris dari daftar dosen PDDikti (di-sync otomatis
 * saat halaman dibuka, TTL 24 jam), angka publikasi dari SINTA
 * (Scopus / Garuda / Google Scholar). Pencarian hanya berdasarkan nama.
 */

const PAGE_SIZE = 10;
const MIN_SEARCH_LENGTH = 2;
const SYNC_POLL_MS = 5000;

const BASIS_TABS: { key: DosenPublikasiBasis; label: string }[] = [
  { key: "scopus", label: "Scopus" },
  { key: "garuda", label: "Garuda" },
  { key: "googlescholar", label: "Google Scholar" },
];

const extractErrorMessage = (error: unknown, fallback: string): string =>
  axios.isAxiosError(error)
    ? (error.response?.data as { message?: string } | undefined)?.message ??
      error.message
    : fallback;

const formatDateTime = (iso: string | null): string | null => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// ---------------------------------------------------------------------------
// Modal detail publikasi per dosen (fetch on-demand per basis)
// ---------------------------------------------------------------------------

function DosenPublikasiList({
  dosenId,
  basis,
}: {
  dosenId: string;
  basis: DosenPublikasiBasis;
}) {
  const [items, setItems] = useState<DosenPublikasiItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDosenPublikasi(dosenId, basis)
      .then((res) => {
        if (!cancelled) setItems(res.data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(extractErrorMessage(err, "Gagal memuat publikasi."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dosenId, basis]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <NewtonCradleLoader />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-sm text-red-500 py-12">{error}</div>;
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center text-sm text-gray-400 py-12">
        Belum ada publikasi pada basis ini.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={`${item.title}-${index}`}
          className="border rounded-lg p-4 bg-gray-50"
        >
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-800 hover:text-red-600 inline-flex items-start gap-1"
            >
              {item.title}
              <ExternalLink size={13} className="mt-0.5 shrink-0" />
            </a>
          ) : (
            <p className="text-sm font-medium text-gray-800">{item.title}</p>
          )}

          {item.venue && (
            <p className="text-xs text-gray-500 mt-1">{item.venue}</p>
          )}

          <p className="text-xs text-gray-400 mt-1">
            {[item.year, item.quartile, item.extra].filter(Boolean).join(" • ")}
          </p>
        </li>
      ))}
    </ul>
  );
}

function DosenPublikasiModal({
  dosen,
  initialBasis,
  onClose,
}: {
  dosen: DosenRepositoryItem;
  initialBasis: DosenPublikasiBasis;
  onClose: () => void;
}) {
  const [basis, setBasis] = useState<DosenPublikasiBasis>(initialBasis);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-xl p-6"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Publikasi {dosen.nama}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {[dosen.nidn, dosen.prodi].filter(Boolean).join(" • ")}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup"
            className="cursor-pointer text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* BASIS TABS */}
        <div className="flex gap-2 mt-4">
          {BASIS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setBasis(tab.key)}
              className={`cursor-pointer text-xs px-3 py-1.5 rounded-full border ${
                basis === tab.key
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* BODY — key per basis agar state fetch direset saat ganti tab */}
        <div className="mt-4">
          <DosenPublikasiList key={basis} dosenId={dosen.id} basis={basis} />
        </div>

        {/* FOOTNOTE */}
        <p className="mt-5 text-center text-xs text-gray-400">
          Sumber: SINTA — tanpa login SINTA hanya menampilkan publikasi
          terakhir per basis.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab utama — tabel dosen
// ---------------------------------------------------------------------------

export default function DosenRepositoryTab() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [retryTick, setRetryTick] = useState(0);
  const [items, setItems] = useState<DosenRepositoryItem[]>([]);
  const [totalData, setTotalData] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [sync, setSync] = useState<DosenRepositorySync | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    dosen: DosenRepositoryItem;
    basis: DosenPublikasiBasis;
  } | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError(null);
      }

      try {
        const res = await getDosenRepository({
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
        });
        setItems(res.data);
        setTotalData(res.meta.totalData);
        setTotalPages(res.meta.totalPages);
        setSync(res.meta.sync);
      } catch (err) {
        if (!silent) {
          setError(extractErrorMessage(err, "Gagal memuat daftar dosen."));
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [page, search],
  );

  useEffect(() => {
    void load();
  }, [load, retryTick]);

  // Saat sinkronisasi berjalan di server, poll perubahan statusnya.
  useEffect(() => {
    if (sync?.status !== "syncing") return;
    const timer = setInterval(() => void load(true), SYNC_POLL_MS);
    return () => clearInterval(timer);
  }, [sync?.status, load]);

  const handleSearch = () => {
    const trimmed = searchInput.trim();

    if (trimmed.length > 0 && trimmed.length < MIN_SEARCH_LENGTH) {
      setError(`Masukkan minimal ${MIN_SEARCH_LENGTH} karakter untuk mencari.`);
      return;
    }

    setPage(1);
    setSearch(trimmed);
    setRetryTick((tick) => tick + 1);
  };

  const handlePageChange = (nextPage: number) => {
    setError(null);
    setPage(nextPage);
  };

  const renderSyncBanner = () => {
    if (!sync) return null;

    if (sync.status === "syncing") {
      return (
        <div className="mb-4 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          Menyegarkan data dari PDDikti &amp; SINTA — daftar akan diperbarui
          otomatis.
        </div>
      );
    }

    if (sync.status === "unavailable") {
      return (
        <div className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5">
          {sync.message ??
            "Penyegaran otomatis tidak tersedia di server ini — menampilkan data terakhir tersimpan."}
        </div>
      );
    }

    if (sync.status === "error") {
      return (
        <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
          {sync.message ??
            "Penyegaran data terakhir gagal — menampilkan data terakhir tersimpan."}
        </div>
      );
    }

    return null;
  };

  const renderBody = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-16">
          <NewtonCradleLoader />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-sm text-red-500 py-16">{error}</div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center gap-2 text-gray-400 py-16">
          <Search size={32} />
          <p className="text-sm">
            {search
              ? "Dosen tidak ditemukan."
              : "Belum ada data dosen. Data akan tersinkron otomatis saat halaman ini dibuka."}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-4 py-3 w-12">No</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">NIDN</th>
              <th className="px-4 py-3">Prodi</th>
              <th className="px-4 py-3 text-center">Scopus</th>
              <th className="px-4 py-3 text-center">Garuda</th>
              <th className="px-4 py-3 text-center">Google Scholar</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {items.map((row, index) => (
              <tr key={row.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">
                  {(page - 1) * PAGE_SIZE + index + 1}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-800">{row.nama}</span>
                    {!row.terhubung && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border">
                        belum terhubung SINTA
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3 text-gray-600">{row.nidn ?? "-"}</td>

                <td className="px-4 py-3 text-gray-600">
                  {row.prodi ?? "-"}
                  {row.jenjang && (
                    <span className="text-xs text-gray-400"> ({row.jenjang})</span>
                  )}
                </td>

                <td className="px-4 py-3 text-center tabular-nums">
                  {row.scopus ?? "-"}
                </td>
                <td className="px-4 py-3 text-center tabular-nums">
                  {row.garuda ?? "-"}
                </td>
                <td className="px-4 py-3 text-center tabular-nums">
                  {row.gs ?? "-"}
                </td>

                <td className="px-4 py-3 text-center">
                  <button
                    disabled={!row.terhubung}
                    title={
                      row.terhubung
                        ? "Lihat daftar publikasi"
                        : "Dosen belum terhubung ke SINTA"
                    }
                    onClick={() =>
                      setDetail({ dosen: row, basis: "scopus" })
                    }
                    className={`text-xs px-3 py-1.5 rounded-md border ${
                      row.terhubung
                        ? "cursor-pointer text-red-600 border-red-200 hover:bg-red-50"
                        : "cursor-not-allowed text-gray-300 border-gray-200"
                    }`}
                  >
                    Publikasi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const lastSync = formatDateTime(sync?.last_sync_at ?? null);

  return (
    <div>
      {/* SEARCH */}
      <div className="flex justify-center mb-6">
        <SearchPill
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={handleSearch}
          placeholder="Cari nama dosen..."
        />
      </div>

      {/* JUMLAH */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-medium text-gray-700">
          Daftar Dosen{totalData !== null ? ` (${totalData})` : ""}
        </h2>

        <p className="text-xs text-gray-400">
          Sumber baris: PDDikti • Angka publikasi: SINTA
        </p>
      </div>

      {/* STATUS SINKRONISASI */}
      {renderSyncBanner()}

      {/* TABEL */}
      {renderBody()}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        </div>
      )}

      {/* SUMBER */}
      <p className="mt-6 text-center text-xs text-gray-400">
        {lastSync
          ? `Terakhir disinkronkan: ${lastSync} — diperbarui otomatis setiap 24 jam.`
          : "Data dosen PDDikti dan angka publikasi SINTA — diperbarui otomatis."}
      </p>

      {/* MODAL DETAIL */}
      {detail && (
        <DosenPublikasiModal
          dosen={detail.dosen}
          initialBasis={detail.basis}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}
