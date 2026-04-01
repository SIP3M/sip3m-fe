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
  fakultas?: string | null;
  program_studi?: string | null;
  instansi?: string | null;
  bidang_keahlian?: string | null;
  pengalaman_review?: string | null;
  roles: {
    id: number;
    roles: string;
  };
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
  fakultas: string;
  program_studi: string;
  username: string;
  password: string;
  konfirmasi_password: string;
}

export interface RegisterResponse {
  message: string;
  data: User & { is_active: boolean }; // Mengambil struktur User ditambah field is_active
}
