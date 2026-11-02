import type {
  RegisterDosenFieldErrors,
  RegisterDosenForm,
} from "./RegisterDosenPage.types";

/**
 * Aturan validasi per-step — sengaja disamakan dengan registerDosenSchema
 * di backend (src/auth/auth.validation.ts) agar user tidak gagal saat submit.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NIDN_REGEX = /^\d+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

const hasError = (errors: RegisterDosenFieldErrors): boolean =>
  Object.keys(errors).length > 0;

export const validateStep1 = (form: RegisterDosenForm): RegisterDosenFieldErrors => {
  const errors: RegisterDosenFieldErrors = {};

  if (form.nama.trim().length < 3) {
    errors.nama = "Nama lengkap minimal 3 karakter.";
  } else if (form.nama.length > 100) {
    errors.nama = "Nama lengkap hanya boleh maksimal 100 karakter.";
  } else if (!/[A-Za-z]/.test(form.nama)) {
    errors.nama = "Nama harus mengandung minimal 1 huruf.";
  }

  if (!form.tempat.trim()) {
    errors.tempat = "Tempat lahir wajib diisi.";
  } else if (form.tempat.length > 100) {
    errors.tempat = "Tempat lahir hanya boleh maksimal 100 karakter.";
  }

  if (!form.tanggal) {
    errors.tanggal = "Tanggal lahir wajib diisi.";
  } else if (isNaN(Date.parse(form.tanggal))) {
    errors.tanggal = "Tanggal lahir tidak valid.";
  } else if (new Date(form.tanggal) > new Date()) {
    errors.tanggal = "Tanggal lahir tidak boleh di masa depan.";
  } else if (new Date(form.tanggal).getFullYear() < 1940) {
    errors.tanggal = "Tanggal lahir tidak boleh sebelum tahun 1940.";
  }

  if (!form.jk) {
    errors.jk = "Jenis kelamin wajib dipilih.";
  }

  // Alamat opsional (sesuai backend), hanya batas panjang yang ditegakkan.
  if (form.alamat.length > 500) {
    errors.alamat = "Alamat hanya boleh maksimal 500 karakter.";
  }

  if (!form.nohp.trim()) {
    errors.nohp = "Nomor HP wajib diisi.";
  } else if (form.nohp.trim().length > 20) {
    errors.nohp = "Nomor HP hanya boleh maksimal 20 karakter.";
  } else if (!/^\+?\d{9,15}$/.test(form.nohp.replace(/[\s-]/g, ""))) {
    // Standar sistem (sama dengan isValidPhone pendaftaran KKM):
    // digit, boleh diawali +, 9–15 digit (spasi/dash diabaikan).
    errors.nohp = "Nomor HP tidak valid. Gunakan 9–15 digit (boleh diawali +).";
  }

  return errors;
};

export const validateStep2 = (form: RegisterDosenForm): RegisterDosenFieldErrors => {
  const errors: RegisterDosenFieldErrors = {};

  const nidn = form.nidn.trim();
  if (!nidn) {
    errors.nidn = "NIDN wajib diisi.";
  } else if (nidn.length > 20) {
    errors.nidn = "NIDN hanya boleh maksimal 20 karakter.";
  } else if (!NIDN_REGEX.test(nidn)) {
    errors.nidn = "NIDN hanya boleh berisi angka.";
  } else if (nidn.length < 6) {
    errors.nidn = "NIDN minimal 6 digit.";
  }

  if (!form.fakultas) {
    errors.fakultas = "Fakultas wajib dipilih.";
  }

  if (!form.prodi) {
    errors.prodi = "Program Studi wajib dipilih.";
  }

  return errors;
};

export const validateStep3 = (form: RegisterDosenForm): RegisterDosenFieldErrors => {
  const errors: RegisterDosenFieldErrors = {};

  if (form.username.length < 3) {
    errors.username = "Username minimal 3 karakter.";
  } else if (form.username.length > 30) {
    errors.username = "Username hanya boleh maksimal 30 karakter.";
  } else if (!USERNAME_REGEX.test(form.username)) {
    errors.username =
      "Username hanya boleh mengandung huruf, angka, dan underscore.";
  }

  if (!form.email) {
    errors.email = "Email wajib diisi.";
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = "Email format tidak valid.";
  } else if (form.email.length > 100) {
    errors.email = "Email hanya boleh maksimal 100 karakter.";
  }

  if (form.password.length < 8) {
    errors.password = "Password harus minimal 8 karakter.";
  } else if (form.password.length > 100) {
    errors.password = "Password hanya boleh maksimal 100 karakter.";
  } else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
    errors.password = "Password harus mengandung minimal 1 huruf dan 1 angka.";
  }

  if (form.confirm.length < 8) {
    errors.confirm = "Konfirmasi password harus minimal 8 karakter.";
  } else if (form.confirm !== form.password) {
    errors.confirm = "Password dan konfirmasi password harus sama.";
  }

  if (!form.agree) {
    errors.agree = "Anda harus menyetujui kebijakan privasi.";
  }

  return errors;
};

export const stepHasErrors = hasError;

/** Pemetaan nama field backend (zod) -> nama field form. */
const BE_TO_FORM_FIELD: Record<string, keyof RegisterDosenForm> = {
  name: "nama",
  tempat_lahir: "tempat",
  tanggal_lahir: "tanggal",
  jenis_kelamin: "jk",
  alamat: "alamat",
  nomor_hp: "nohp",
  email: "email",
  nidn: "nidn",
  fakultas_id: "fakultas",
  program_studi_id: "prodi",
  username: "username",
  password: "password",
  konfirmasi_password: "confirm",
};

/** Ubah `errors` (fieldErrors) dari respons400 backend menjadi error form. */
export const mapBackendFieldErrors = (
  backendErrors: Record<string, string[] | undefined>,
): RegisterDosenFieldErrors => {
  const mapped: RegisterDosenFieldErrors = {};

  for (const [beField, messages] of Object.entries(backendErrors)) {
    const formField = BE_TO_FORM_FIELD[beField];
    if (formField && messages && messages[0]) {
      mapped[formField] = messages[0];
    }
  }

  return mapped;
};
