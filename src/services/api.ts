import axios from "axios";

export const api = axios.create({
  baseURL: "https://sip3m-be.vercel.app/api",
  // withCredentials: true,
});