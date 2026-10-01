import axios from "axios";
import { getAccessToken } from "./storage";

const baseURL = import.meta.env.VITE_API_BASE_URL || "https://sip3m-be.vercel.app/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Menambahkan Token Otomatis ke setiap Request
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
