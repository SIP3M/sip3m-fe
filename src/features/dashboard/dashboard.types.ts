export type ProposalStatusKey =
  | "DRAFT"
  | "SUBMITTED"
  | "ADMIN_VERIFIED"
  | "UNDER_REVIEW"
  | "REVISION"
  | "REVISION_PENDING"
  | "REVIEW_DONE"
  | "ACCEPTED"
  | "REJECTED"
  | string;

export interface AdminSummaryCards {
  totalProposal: number;
  dosenAktif: number;
  proposalDisetujui: number;
  menungguReview: number;
}

export interface AdminStatusChartItem {
  status: ProposalStatusKey;
  jumlah: number;
}

export interface AdminKategoriChartItem {
  skema: string;
  jumlah: number;
}

export interface AdminTrendBulananItem {
  bulan: string;
  jumlah: number;
}

export interface AdminFakultasChartItem {
  fakultas: string;
  jumlah: number;
}

export interface AdminRecentProposalItem {
  id: number;
  title: string;
  status: ProposalStatusKey;
  created_at: string;
}

export interface AdminDashboardData {
  summaryCards: AdminSummaryCards;
  statusChart: AdminStatusChartItem[];
  kategoriChart: AdminKategoriChartItem[];
  trendBulanan: AdminTrendBulananItem[];
  fakultasChart: AdminFakultasChartItem[];
  recentProposals: AdminRecentProposalItem[];
  /** Tahun unik dari created_at proposal — untuk isi dropdown filter */
  tahunTersedia: number[];
}

export interface GetAdminDashboardResponse {
  message: string;
  data: AdminDashboardData;
}

// =============================================
// Dashboard Staff LPPM (fokus proposal penelitian)
// =============================================

export interface StaffSummaryCards {
  totalProposal: number;
  /** Proposal berstatus SUBMITTED — menunggu verifikasi administratif */
  perluVerifikasi: number;
  proposalDisetujui: number;
  dosenAktif: number;
}

export interface StaffVerifikasiChartItem {
  label: string;
  jumlah: number;
}

export interface StaffAktivitasHarianItem {
  /** Key ISO (YYYY-MM-DD) */
  tanggal: string;
  /** Label hari pendek, mis. "Sen" */
  hari: string;
  /** Proposal masuk (created_at) pada hari itu */
  masuk: number;
  /** Proposal diproses/diubah (updated_at) pada hari itu */
  diproses: number;
}

export interface StaffProposalPerluVerifikasiItem {
  id: number;
  title: string;
  faculty: string | null;
  status: ProposalStatusKey;
  created_at: string;
}

export type StaffPrioritasKey = "verifikasi" | "plotting" | "review";

export interface StaffPrioritasItem {
  key: StaffPrioritasKey;
  jumlah: number;
}

export interface StaffDashboardData {
  summaryCards: StaffSummaryCards;
  /** Donut pipeline verifikasi — jumlahnya selalu = totalProposal */
  verifikasiChart: StaffVerifikasiChartItem[];
  /** 7 hari terakhir (urut, paling akhir = hari ini) */
  aktivitasMingguan: StaffAktivitasHarianItem[];
  /** Maks 5 proposal SUBMITTED, antrean terlama lebih dulu */
  proposalPerluVerifikasi: StaffProposalPerluVerifikasiItem[];
  /** Derive dari data: menunggu verifikasi / menunggu plotting / review berjalan */
  prioritas: StaffPrioritasItem[];
  recentProposals: AdminRecentProposalItem[];
}

export interface GetStaffDashboardResponse {
  message: string;
  data: StaffDashboardData;
}
