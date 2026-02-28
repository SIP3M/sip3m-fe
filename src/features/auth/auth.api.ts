import { api } from "@/services/api";
import { LoginPayload, LoginResponse } from "./auth.types";

export const login = async (data: LoginPayload) => {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data; 
};