import { AppRole } from "@/constant/roles";

export type CreateUserRole = AppRole;
export type UserStatusFilter = "active" | "inactive";

/**
 * Referensi fakultas / program studi pada endpoint /users.
 * Bentuknya seragam `{ id, nama } | null` — JANGAN pernah di-render langsung
 * sebagai React child (menyebabkan error #31). Ambil `.nama` dengan `?.` + fallback.
 *
 * Catatan: /auth/login, /auth/me, /dosen/profile, /dosen/search, /mahasiswa/search
 * BELUM dinormalisasi — tipe endpoint itu berbeda dan tidak memakai tipe ini.
 */
export type UserRef = { id: number; nama: string } | null;

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  nidn?: string | null;
  /** Hanya untuk respons GET/POST/PUT /users — selalu { id, nama } | null */
  fakultas?: UserRef;
  /** Field baru di list; sebelumnya kadang angka (id) di detail */
  program_studi?: UserRef;
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
  /** ID fakultas dalam bentuk STRING, mis. "1" (bukan nama, bukan objek) */
  fakultas?: string;
  /** ID program studi dalam bentuk STRING, mis. "4" */
  program_studi?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  alamat?: string;
  nomor_hp?: string;
  is_active?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  roles?: CreateUserRole;
  nidn_nip?: string;
  /** ID fakultas dalam bentuk STRING. Kirim "" untuk mencabut. */
  fakultas?: string;
  /** ID program studi dalam bentuk STRING. Kirim "" untuk mencabut. */
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

export interface GetUserResponse {
  data: User;
}

export interface UpdateUserResponse {
  message: string;
  data: User;
}

export interface UpdateUserStatusPayload {
  is_active: boolean;
}

export interface UpdateUserStatusResponse {
  message: string;
  data: User;
}

export interface DeleteUserResponse {
  message: string;
}

export interface GetUsersParams {
  page?: number;
  status?: UserStatusFilter;
  roles?: AppRole;
  search?: string;
}
