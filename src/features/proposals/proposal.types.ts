/** Jenis opsi dinamis dari master referensi — nilai bebas (string). */
export type SumberPendanaan = string;

/** Fallback statis saat API master referensi belum/tidak termuat. */
export const SUMBER_PENDANAAN_OPTIONS: SumberPendanaan[] = [
  "Internal Kampus",
  "Kemendikbudristek",
  "Mandiri",
  "Lainnya",
];

export const SKEMA_OPTIONS = [
  "Penelitian Pengembangan",
  "Penelitian Terapan",
  "Penelitian Kolaborasi",
] as const;

// API GET mengirim kode enum (PENELITIAN_*/INTERNAL_*), sedangkan form memakai
// label — nilai dari API harus dinormalkan sebelum dipakai di form/submit.
const SKEMA_ENUM_TO_LABEL: Record<string, string> = {
  PENELITIAN_PENGEMBANGAN: "Penelitian Pengembangan",
  PENELITIAN_TERAPAN: "Penelitian Terapan",
  PENELITIAN_KOLABORASI: "Penelitian Kolaborasi",
};

const SUMBER_PENDANAAN_ENUM_TO_LABEL: Record<string, string> = {
  INTERNAL_KAMPUS: "Internal Kampus",
  KEMENDIKBUDRISTEK: "Kemendikbudristek",
  MANDIRI: "Mandiri",
  LAINNYA: "Lainnya",
};

/** Normalisasi skema dari API/DB ke label form. Label sudah benar diteruskan. */
export const toSkemaLabel = (value?: string | null): string => {
  if (!value) return "";
  return SKEMA_ENUM_TO_LABEL[value] ?? value;
};

/** Normalisasi sumber_pendanaan dari API/DB ke label form (null tetap null). */
export const toSumberPendanaanLabel = (
  value?: string | null,
): string | null => {
  if (!value) return null;
  return SUMBER_PENDANAAN_ENUM_TO_LABEL[value] ?? value;
};

export type ProposalStatus =
  | "REVIEW"
  | "SUBMITTED"
  | "APPROVED"
  | "DRAFT"
  | "REVISION"
  | "ADMIN_VERIFIED"
  | "UNDER_REVIEW"
  | "REVIEW_DONE"
  | "REJECTED"
  | "ACCEPTED";

export interface Proposal {
  id: number;
  title: string;
  lead_researcher_id: number;
  // Opsi B: ketua eksplisit dari Peran "Ketua Peneliti" — nullable untuk proposal lama
  nama_ketua?: string | null;
  nidn_ketua?: string | null;
  user?: {
    name: string;
    nidn_nip: string;
  } | null;
  faculty: string;
  skema: string;
  sumber_data_penelitian?: string | null;
  instansi?: string | null;
  sumber_pendanaan?: SumberPendanaan | null;
  abstrak?: string | null;
  tujuan_penelitian?: string | null;
  metode_penelitian?: string | null;
  dosen_terlibat?: string | null;
  nidn_dosen_terlibat?: string | null;
  nama_anggota?: string | null;
  nim_anggota?: string | null;
  funding_request_amount: number;
  status: ProposalStatus;
  proposal_file_path: string | null;
  rab_file_path: string | null;
  file_info?: {
    proposal_file?: {
      previous_path?: string | null;
      previous_name?: string | null;
      current_path?: string | null;
      current_name?: string | null;
      replaced?: boolean;
    };
    rab_file?: {
      previous_path?: string | null;
      previous_name?: string | null;
      current_path?: string | null;
      current_name?: string | null;
      replaced?: boolean;
    };
  };
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  reviews?: Array<{
    id: number;
    status: string;
    rekomendasi_akhir?: string | null;
    kelemahan_proposal?: string | null;
    kekuatan_proposal?: string | null;
    notes?: string | null;
    created_at: string;
    reviewer?: {
      name: string;
    } | null;
  }> | null;
}

export interface ProposalMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface GetAllProposalsResponse {
  message: string;
  data: Proposal[];
  meta: ProposalMeta;
}

export interface GetProposalByIdResponse {
  message: string;
  data: Proposal;
}

export type ProposalStatusUpdate =
  | "ADMIN_VERIFIED"
  | "UNDER_REVIEW"
  | "REVISION"
  | "ACCEPTED"
  | "REJECTED";

export interface UpdateProposalStatusPayload {
  status: ProposalStatusUpdate;
  notes?: string;
}

export interface UpdateProposalStatusResponse {
  message: string;
  data: Proposal;
}

export interface UpsertProposalPayload {
  title?: string;
  faculty?: string;
  skema?: string;
  sumber_data_penelitian?: string;
  sumber_pendanaan?: SumberPendanaan;
  // Opsi B: ketua dari baris Peran === "Ketua Peneliti" (omit jika tidak ada -> BE null)
  nama_ketua?: string;
  nidn_ketua?: string;
  instansi?: string;
  funding_request_amount?: number | string;
  dosen_terlibat?: string;
  nidn_dosen_terlibat?: string;
  nama_anggota?: string;
  nim_anggota?: string;
  is_draft?: boolean;
  proposal_file?: File;
  rab_file?: File;
  detail_sumber_penelitian?: string;
  tujuan_penelitian?: string;
  metode_penelitian?: string;
}

export interface DeleteProposalResponse {
  message: string;
}

export interface SubmitProposalResponse {
  message: string;
  data: Proposal;
}
