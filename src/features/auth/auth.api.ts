import { api } from "@/services/api";
import { LoginPayload, LoginResponse, MasterData } from "./auth.types";
import {
  RegisterDosenPayload,
  RegisterReviewerPayload,
  RegisterResponse,
  GetCurrentUserResponse,
} from "./auth.types";

export const login = async (data: LoginPayload) => {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
};

export const registerDosen = async (data: RegisterDosenPayload) => {
  const res = await api.post<RegisterResponse>("/auth/register/dosen", data);
  return res.data;
};

export const getFakultas = async () => {
  const res = await api.get<MasterData[]>("/fakultas");
  return res.data.data || res.data;
};

export const getProdiByFakultas = async (fakultasId: number) => {
  const res = await api.get<MasterData[]>(`/fakultas/${fakultasId}/program-studi`);
  return res.data.data || res.data;
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
export type { MasterData };

