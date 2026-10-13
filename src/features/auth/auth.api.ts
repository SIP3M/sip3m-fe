import { api } from "@/services/api";
import { DEVICE_ID_HEADER, getDeviceId } from "@/utils/device";
import { LoginPayload, LoginResponse, MasterData } from "./auth.types";
import {
  RegisterDosenPayload,
  RegisterReviewerPayload,
  RegisterResponse,
  GetCurrentUserResponse,
} from "./auth.types";

export const login = async (data: LoginPayload) => {
  const res = await api.post<LoginResponse>("/auth/login", data, {
    headers: { [DEVICE_ID_HEADER]: getDeviceId() },
  });
  return res.data;
};

export const registerDosen = async (data: RegisterDosenPayload) => {
  const res = await api.post<RegisterResponse>("/auth/register/dosen", data);
  return res.data;
};

export const getFakultas = async () => {
  const res = await api.get<{ data: MasterData[] } | MasterData[]>("/fakultas");
  return Array.isArray(res.data) ? res.data : res.data.data;
};

export const getProdiByFakultas = async (fakultasId: number) => {
  const res = await api.get<{ data: MasterData[] } | MasterData[]>(`/fakultas/${fakultasId}/program-studi`);
  return Array.isArray(res.data) ? res.data : res.data.data;
};

export const registerReviewer = async (data: RegisterReviewerPayload) => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("nomor_hp", data.nomor_hp);
  formData.append("instansi", data.instansi);
  formData.append("bidang_keahlian", data.bidang_keahlian);
  formData.append("pengalaman_review", data.pengalaman_review);
  formData.append("cv", data.cv);
  formData.append("username", data.username);
  formData.append("password", data.password);
  formData.append("konfirmasi_password", data.konfirmasi_password);

  const res = await api.post<RegisterResponse>(
    "/auth/register/reviewer",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get<GetCurrentUserResponse>("/auth/me");
  return res.data;
};

export interface UserSession {
  id: string;
  jti: string;
  device_id: string;
  deviceId?: string;
  user_agent: string;
  userAgent?: string;
  ip: string;
  expires_at: string;
  expiresAt?: string;
  created_at: string;
  createdAt?: string;
}

export const logout = async () => {
  const res = await api.post<{ message: string }>("/auth/logout");
  return res.data;
};

export const getSessions = async () => {
  const res = await api.get<{ message: string; data: UserSession[] }>("/auth/sessions");
  return res.data;
};

export const revokeSessionByDeviceId = async (deviceId: string) => {
  const res = await api.delete<{ message: string }>(`/auth/sessions/${encodeURIComponent(deviceId)}`);
  return res.data;
};

export const revokeSessionPost = async (deviceId: string) => {
  const res = await api.post<{ message: string }>("/auth/sessions/revoke", { deviceId });
  return res.data;
};
export type { MasterData };

