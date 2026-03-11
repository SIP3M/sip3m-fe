export type FinanceStatus =
  | "APPROVED"
  | "PENDING"
  | "DISBURSED"

export interface Finance {
  id: number 
  project: string
  leader: string
  rab: number
  realization: number
  status: FinanceStatus
  date: string
}