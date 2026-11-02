export type RegisterReviewerForm = {
  nama: string;
  email: string;
  nohp: string;
  instansi: string;
  bidang: string;
  pengalaman: string;
  file: File | null;
  username: string;
  password: string;
  confirm: string;
  agree: boolean;
};

export type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[] | string>;
};
