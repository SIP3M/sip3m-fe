import type { KkmPeriodPayload } from "./kkmPeriod.types";

export const TAHUN_AKADEMIK_REGEX = /^\d{4}\/\d{4}$/;

export function validateTahunAkademik(value: string): string | null {
  const v = value.trim();
  if (!v) return "Tahun akademik wajib diisi";
  if (!TAHUN_AKADEMIK_REGEX.test(v)) return "Format wajib YYYY/YYYY contoh 2025/2026";
  const [a, b] = v.split("/").map(Number);
  if (Number.isNaN(a) || Number.isNaN(b)) return "Tahun akademik tidak valid";
  if (b !== a + 1) return "Tahun akademik harus berurutan, contoh 2025/2026";
  if (a < 2000 || a > 2100 || b < 2000 || b > 2100) return "Tahun di luar rentang 2000-2100";
  return null;
}

export function validateKkmPeriodPayload(payload: KkmPeriodPayload): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!payload.nama_periode?.trim() || payload.nama_periode.trim().length < 3) {
    errors.nama_periode = "Nama periode minimal 3 karakter";
  } else if (payload.nama_periode.trim().length > 150) {
    errors.nama_periode = "Nama periode maksimal 150 karakter";
  }

  const taErr = validateTahunAkademik(payload.tahun_akademik || "");
  if (taErr) errors.tahun_akademik = taErr;

  if (!payload.tahun || Number.isNaN(Number(payload.tahun))) {
    errors.tahun = "Tahun wajib diisi";
  } else {
    const t = Number(payload.tahun);
    if (t < 2000 || t > 2100) errors.tahun = "Tahun harus 2000-2100";
  }

  if (!payload.jenis || !["REGULER", "TEMATIK"].includes(payload.jenis)) {
    errors.jenis = "Jenis wajib REGULER atau TEMATIK";
  }

  if (payload.deskripsi && payload.deskripsi.length > 2000) {
    errors.deskripsi = "Deskripsi maksimal 2000 karakter";
  }

  if (payload.target_peserta !== undefined && payload.target_peserta !== null) {
    const n = Number(payload.target_peserta);
    if (Number.isNaN(n) || n < 0) errors.target_peserta = "Target peserta minimal 0";
  }

  if (payload.minimal_semester !== undefined && payload.minimal_semester !== null && payload.minimal_semester !== 0) {
    const n = Number(payload.minimal_semester);
    if (Number.isNaN(n) || n < 1 || n > 14) errors.minimal_semester = "Minimal semester 1-14";
  }

  if (payload.maks_anggota_kelompok !== undefined && payload.maks_anggota_kelompok !== null) {
    const n = Number(payload.maks_anggota_kelompok);
    if (Number.isNaN(n) || n < 1 || n > 50) errors.maks_anggota_kelompok = "Maks anggota 1-50";
  }

  if (payload.maks_kelompok_per_dosen !== undefined && payload.maks_kelompok_per_dosen !== null && String(payload.maks_kelompok_per_dosen).trim() !== "") {
    const n = Number(payload.maks_kelompok_per_dosen);
    if (Number.isNaN(n) || n < 1 || n > 20) errors.maks_kelompok_per_dosen = "Maks kelompok per dosen 1-20";
  }

  // Date order validation: tgl_buka_daftar < tgl_tutup_daftar < tgl_pembekalan < tgl_pelaksanaan < tgl_penarikan < deadline_laporan
  const order: (keyof KkmPeriodPayload)[] = [
    "tgl_buka_daftar",
    "tgl_tutup_daftar",
    "tgl_pembekalan",
    "tgl_pelaksanaan",
    "tgl_penarikan",
    "deadline_laporan",
  ];
  const dates: { key: string; value: string }[] = [];
  for (const k of order) {
    const v = (payload as unknown as Record<string, unknown>)[k];
    if (typeof v === "string" && v.trim()) {
      dates.push({ key: k, value: v.trim() });
    }
  }
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1].value);
    const curr = new Date(dates[i].value);
    if (!Number.isNaN(prev.getTime()) && !Number.isNaN(curr.getTime()) && curr <= prev) {
      errors[dates[i].key] = `Harus setelah ${dates[i - 1].key.replace(/_/g, " ")} (${dates[i - 1].value})`;
    }
  }

  // ── Pengaturan deadline unggahan (diatur admin LPPM) ──────────────────────
  const JAM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
  const jamKeys: (keyof KkmPeriodPayload)[] = [
    "logbook_individu_jam",
    "logbook_kelompok_jam",
    "jam_laporan_individu",
    "jam_laporan_kelompok",
  ];
  for (const k of jamKeys) {
    const v = (payload as unknown as Record<string, unknown>)[k];
    if (typeof v === "string" && v.trim() && !JAM_REGEX.test(v.trim())) {
      errors[k] = "Format jam harus HH:mm, contoh 23:59";
    }
  }

  // Logbook individu: mingguan (hari 1-7 + jam)
  if (payload.logbook_individu_hari != null && payload.logbook_individu_hari !== 0) {
    const n = Number(payload.logbook_individu_hari);
    if (!Number.isInteger(n) || n < 1 || n > 7) {
      errors.logbook_individu_hari = "Hari tidak valid (1 = Senin .. 7 = Minggu)";
    }
  }

  if (payload.logbook_individu_jam) {
    const v = payload.logbook_individu_jam.trim();
    if (v && !JAM_REGEX.test(v)) {
      errors.logbook_individu_jam = "Format jam harus HH:mm, contoh 23:59";
    }
  }

  // Logbook kelompok: mingguan (hari 1-7 + jam)
  if (payload.logbook_kelompok_hari != null && payload.logbook_kelompok_hari !== 0) {
    const n = Number(payload.logbook_kelompok_hari);
    if (!Number.isInteger(n) || n < 1 || n > 7) {
      errors.logbook_kelompok_hari = "Hari tidak valid (1 = Senin .. 7 = Minggu)";
    }
  }

  // Deadline laporan individu dibuka setelah penarikan → tidak boleh lebih awal.
  if (payload.deadline_laporan_individu && payload.tgl_penarikan) {
    const d = new Date(payload.deadline_laporan_individu);
    const p = new Date(payload.tgl_penarikan);
    if (!Number.isNaN(d.getTime()) && !Number.isNaN(p.getTime()) && d < p) {
      errors.deadline_laporan_individu = "Tidak boleh lebih awal dari Tanggal Penarikan";
    }
  }

  return errors;
}

export function tahunAkademikHint(value: string): string | null {
  if (!value) return null;
  if (!TAHUN_AKADEMIK_REGEX.test(value)) return "Format YYYY/YYYY";
  const [a, b] = value.split("/").map(Number);
  if (b !== a + 1) return "Harus berurutan (2025/2026)";
  return null;
}
