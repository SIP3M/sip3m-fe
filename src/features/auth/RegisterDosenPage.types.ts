export interface RegisterDosenForm {
  nama: string;
  tempat: string;
  tanggal: string;
  jk: string;
  alamat: string;
  nohp: string;
  nidn: string;
  fakultas: string;
  prodi: string;
  username: string;
  email: string;
  password: string;
  confirm: string;
  agree: boolean;
}

/** Error per-field (key mengikuti RegisterDosenForm) */
export type RegisterDosenFieldErrors = Partial<
  Record<keyof RegisterDosenForm, string>
>;
