// LOGIN
export interface LoginPayload {
  identifier: string;
  password: string;
  remember_me?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  nomor_hp: string | null;
  is_active: boolean;
  nidn?: string | null;
  /** NIM mahasiswa (kolom users.nidn_nip) — dari GET /auth/me. */
  nim?: string | null;
  /** Semester berjalan mahasiswa — syarat pendaftaran KKM (harus 7). */
  semester?: number | null;
  fakultas?: string | null;
  program_studi?: string | null;
  instansi?: string | null;
  bidang_keahlian?: string | null;
  pengalaman_review?: string | null;
  roles: {
    id: number;
    roles: string;
    /** Deskripsi role — dari GET /auth/me & login. */
    deskripsi?: string | null;
    /** Role sistem (tidak boleh dihapus/diubah). */
    is_system?: boolean;
    /** Path dashboard default role (role baru → /reviewer-eksternal-dashboard). */
    dashboard_path?: string | null;
  };
  /**
   * Daftar kode izin user (permission dinamis) — dari GET /auth/me & login.
   * ADMIN_SISTEM = superuser: berisi SELURUH kode izin.
   * Fallback: bila undefined (mis. user tersimpan lama), dianggap kosong.
   */
  permissions?: string[];
}

export interface GetCurrentUserResponse {
  message?: string;
  data: User;
}

export interface LoginResponse {
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// REGISTER
export interface RegisterDosenPayload {
  name: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat: string;
  nomor_hp: string;
  email: string;
  nidn: string;
  fakultas_id: number;
  program_studi_id: number;
  username: string;
  password: string;
  konfirmasi_password: string;
}

export interface RegisterReviewerPayload {
  name: string;
  email: string;
  nomor_hp: string;
  instansi: string;
  bidang_keahlian: string;
  pengalaman_review: string;
  cv: File;
  username: string;
  password: string;
  konfirmasi_password: string;
}

export interface RegisterResponse {
  message: string;
  data: User & { is_active: boolean }; // Mengambil struktur User ditambah field is_active
}

export interface MasterData {
  id: number;
  nama: string;
}
