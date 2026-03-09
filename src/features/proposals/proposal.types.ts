export type ProposalStatus =
  | "REVIEW"
  | "SUBMITTED"
  | "APPROVED"
  | "DRAFT"
  | "REVISION"

export interface Proposal {
  id: number
  title: string
  researcher: string
  nidn: string
  schema: string
  year: number
  budget: number
  status: ProposalStatus
}