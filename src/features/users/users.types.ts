import { AppRole } from "@/constant/roles";

export type CreateUserRole = AppRole;

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  nidn?: string | null;
  fakultas?: string | null;
  program_studi?: string | null;
  tempat_lahir?: string | null;
  tanggal_lahir?: string | null;
  jenis_kelamin?: string | null;
  alamat?: string | null;
  nomor_hp?: string | null;
  is_active: boolean;
  created_at: string;
  roles: {
    id: number;
    roles: AppRole;
  };
}

export interface CreateUserPayload {
  name: string;
  email: string;
  username?: string;
  password: string;
  roles: CreateUserRole;
  nidn_nip?: string;
  fakultas?: string;
  program_studi?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  alamat?: string;
  nomor_hp?: string;
  is_active?: boolean;
}

export interface GetUsersResponse {
  data: User[];
  pagination?: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

export interface CreateUserResponse {
  message: string;
  data: User;
}

export interface GetUsersParams {
  page?: number;
  status?: "pending" | "active";
  roles?: AppRole;
  search?: string;
}
