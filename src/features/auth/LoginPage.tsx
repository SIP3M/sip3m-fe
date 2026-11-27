import React, { useEffect, useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import bgImage from "@/assets/images/BG-login.png";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../auth/auth.api";
import axios from "axios";
import { useAuthStore } from "./auth.store";
import { motion } from "framer-motion";
import { User } from "./auth.types";
import { setAuthSession } from "@/services/storage";
import { resolveDashboardPath } from "./dashboardPath";

/** Pesan ramah untuk kode error alur OAuth Google (dari ?oauth_error=). */
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  not_configured:
    "Login Google belum dikonfigurasi sistem. Silakan gunakan login biasa.",
  invalid_state:
    "Sesi login Google tidak valid atau sudah kedaluwarsa. Silakan coba lagi.",
  access_denied: "Login dengan Google dibatalkan.",
  email_not_verified:
    "Email Google Anda belum diverifikasi. Verifikasi dulu di akun Google.",
  email_not_registered:
    "Email Google Anda belum terdaftar di sistem. Hubungi admin untuk mendaftarkan akun.",
  inactive: "Akun Anda belum diverifikasi oleh Ketua LPPM.",
  exchange_failed: "Gagal memproses login dengan Google. Silakan coba lagi.",
  server_error: "Terjadi kesalahan saat login dengan Google. Silakan coba lagi.",
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // State untuk toast sukses login (UI only, tidak menyentuh logic auth)
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loggedInName, setLoggedInName] = useState("");

  useEffect(() => {
    if (searchParams.get("reason") === "session_replaced") {
      setErrorMessage("Sesi kamu di browser ini digantikan login baru. Silakan login ulang.");
    }

    // Hasil alur OAuth Google (redirect dari BE dengan ?oauth_error=<kode>)
    const oauthError = searchParams.get("oauth_error");
    if (oauthError) {
      setErrorMessage(OAUTH_ERROR_MESSAGES[oauthError] ?? OAUTH_ERROR_MESSAGES.server_error);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setErrorMessage("");

      const payload = {
        identifier: form.email,
        password: form.password,
        remember_me: rememberMe,
      };

      const response = await login(payload);

      const token = response.data.token;
      const user = response.data.user;

      const role = (user as User | undefined)?.roles?.roles;
      if (role === "REVIEWER_EKSTERNAL" && !user.is_active) {
        setErrorMessage("akun anda belum di validasi oleh admin lppm.");
        setIsLoading(false);
        return;
      }

      setAuthSession({
        token,
        user,
        rememberMe,
      });

      setUser(user);

      // Trigger toast sukses sebelum redirect (tidak mengubah role/logic)
      setLoggedInName((user as User | undefined)?.name || "");
      setLoginSuccess(true);

      setTimeout(() => {
        navigate(resolveDashboardPath(user as User | undefined));
      }, 1800);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;

        if (responseData?.errors) {
          const firstErrorKey = Object.keys(responseData.errors)[0];
          const specificErrorMessage = responseData.errors[firstErrorKey][0];

          setErrorMessage(specificErrorMessage);
        } else {
          setErrorMessage(
            responseData?.message || "Terjadi kesalahan pada server.",
          );
        }
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="relative min-h-[125dvh] flex flex-col items-center justify-center bg-cover bg-center px-4 py-8 sm:px-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        {errorMessage && (
          <div className="mb-4 w-full max-w-[690px] xl:max-w-[710px] p-3 bg-red-100 text-red-600 border border-red-300 rounded-xl text-xs sm:text-sm text-center font-medium shadow-sm">
            {errorMessage}
          </div>
        )}

        <LoginForm
          form={form}
          handleChange={handleChange}
          handleLogin={handleLogin}
          rememberMe={rememberMe}
          handleRememberMeChange={setRememberMe}
          isLoading={isLoading}
          loginSuccess={loginSuccess}
          userName={loggedInName}
        />
      </div>

      <p className="relative z-10 mt-5 px-4 text-center text-xs text-gray-800">
        © 2026 Universitas Muhammadiyah Cirebon. All rights reserved.
      </p>
    </motion.div>
  );
};

export default LoginPage;
