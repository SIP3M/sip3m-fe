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

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}
