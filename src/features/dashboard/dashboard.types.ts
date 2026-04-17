export type ProposalStatusKey =
  | "DRAFT"
  | "SUBMITTED"
  | "ADMIN_VERIFIED"
  | "UNDER_REVIEW"
  | "REVISION"
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

export interface AdminDashboardData {
  summaryCards: AdminSummaryCards;
  statusChart: AdminStatusChartItem[];
  kategoriChart: AdminKategoriChartItem[];
  trendBulanan: AdminTrendBulananItem[];
}

export interface GetAdminDashboardResponse {
  message: string;
  data: AdminDashboardData;
}
