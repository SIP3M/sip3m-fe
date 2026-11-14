export type ProposalStatusKey =
  | "DRAFT"
  | "SUBMITTED"
  | "ADMIN_VERIFIED"
  | "UNDER_REVIEW"
  | "REVISION"
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
