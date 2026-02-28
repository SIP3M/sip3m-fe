import { api } from "@/services/api";
import { LoginPayload } from "./auth.types";

export const login = async (data: LoginPayload) => {
  const res = await api.post("/login", data);
  return res.data;
};