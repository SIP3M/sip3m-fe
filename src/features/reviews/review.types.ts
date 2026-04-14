export interface ReviewProposal {
  id: number;
  title: string;
  category: string;
  status: string;
}

export interface ReviewerOption {
  id: number;
  name: string;
  email: string;
  role: "REVIEWER" | "REVIEWER_EKSTERNAL";
}

export interface AssignReviewersResponse {
  message: string;
  data: {
    id: number;
    status: string;
    updated_at: string;
  };
}
