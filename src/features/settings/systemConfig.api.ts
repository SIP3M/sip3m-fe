import { api } from "@/services/api";

// ─── Types (sinkron dengan src/system-config/ di backend) ──────────────

export interface GoogleOAuthConfig {
  client_id: string;
  /** Secret ter-mask — asli tidak pernah dikirim ke FE. */
  client_secret_masked: string | null;
  is_configured: boolean;
  updated_at: string | null;
}

export interface UpdateGoogleOAuthPayload {
  client_id: string;
  /** Kosong = pertahankan secret lama. */
  client_secret?: string;
}

// ─── Kredensial OAuth Google (ADMIN_SISTEM) ─────────────────────────────

export const getGoogleOAuthConfig = async (): Promise<GoogleOAuthConfig> => {
  const res = await api.get<{ message?: string; data: GoogleOAuthConfig }>(
    "/system-config/google",
  );
  return res.data.data;
};

export const updateGoogleOAuthConfig = async (
  payload: UpdateGoogleOAuthPayload,
): Promise<GoogleOAuthConfig> => {
  const res = await api.put<{ message?: string; data: GoogleOAuthConfig }>(
    "/system-config/google",
    payload,
  );
  return res.data.data;
};
