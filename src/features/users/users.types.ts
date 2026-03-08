export interface User {
  id: number
  name: string
  email: string
  role: "ADMIN" | "STAFF" | "DOSEN" | "REVIEWER" | "EXTERNAL"
  status: "Active" | "Inactive"
  nidn?: string
}