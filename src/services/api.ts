import axios from "axios";

export const api = axios.create({
  baseURL: "https://sip3m-be.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Menambahkan Token Otomatis ke setiap Request
api.interceptors.request.use(
  (config) => {
    // Ambil token dari penyimpanan (localStorage)
    const token = localStorage.getItem("accessToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
