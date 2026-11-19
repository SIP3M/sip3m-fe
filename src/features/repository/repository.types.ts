export type RepositoryMeta = {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};

export type PengabdianRepositoryItem = {
  id: number;
  title: string;
  project_code: string | null;
  created_at: string;
  proposal: {
    id: number;
    lead_researcher_id: number;
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
  documents: {
    id: number;
    file_path: string;
    public_url: string;
    uploaded_at: string;
  }[];
};

export type GetPengabdianRepositoryResponse = {
  message: string;
  data: PengabdianRepositoryItem[];
  meta: RepositoryMeta;
};

export type PublikasiSort = "relevance" | "terbaru" | "terpopuler";

export type PublikasiItem = {
  id: string;
  title: string;
  authors: string[];
  author_count: number;
  year: number | null;
  venue: string | null;
  cited_by_count: number;
  doi: string | null;
  pdf_url: string | null;
  url: string | null;
};

export type GetPublikasiResponse = {
  message: string;
  data: PublikasiItem[];
  meta: RepositoryMeta & { source: "openalex" };
};

export type PengabdianSearchParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type PublikasiSearchParams = {
  search: string;
  page?: number;
  limit?: number;
  sort?: PublikasiSort;
};

// ---------------------------------------------------------------------------
// Repository Dosen (baris PDDikti + angka publikasi SINTA)
// ---------------------------------------------------------------------------

export type DosenRepositorySync = {
  status: "idle" | "syncing" | "unavailable" | "error";
  last_sync_at: string | null;
  message: string | null;
};

export type DosenRepositoryItem = {
  id: string;
  nama: string;
  nidn: string | null;
  prodi: string | null;
  jenjang: string | null;
  scopus: number | null;
  garuda: number | null;
  gs: number | null;
  terhubung: boolean;
};

export type GetDosenRepositoryResponse = {
  message: string;
  data: DosenRepositoryItem[];
  meta: RepositoryMeta & { sync: DosenRepositorySync };
};

export type DosenPublikasiBasis = "scopus" | "garuda" | "googlescholar";

export type DosenPublikasiItem = {
  title: string;
  url: string | null;
  venue: string | null;
  year: number | null;
  quartile: string | null;
  extra: string | null;
};

export type GetDosenPublikasiResponse = {
  message: string;
  data: DosenPublikasiItem[];
  meta: {
    basis: DosenPublikasiBasis;
    total: number;
    synced_at: string;
    source: "live" | "cache";
  };
};

export type DosenSearchParams = {
  page?: number;
  limit?: number;
  search?: string;
};
