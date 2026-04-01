import { api } from "@/services/api";
import { LoginPayload, LoginResponse } from "./auth.types";
import {
  RegisterDosenPayload,
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

export const getCurrentUser = async () => {
  const res = await api.get<GetCurrentUserResponse>("/auth/me");
  return res.data;
};
