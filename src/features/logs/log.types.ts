export type UserRole =
  | "ADMIN"
  | "STAFF"
  | "DOSEN"
  | "REVIEWER"

export interface Log {
  id: number
  timestamp: string
  user: string
  role: UserRole
  module: string
  action: string
  details: string
}