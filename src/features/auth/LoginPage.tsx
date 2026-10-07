import React, { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import bgImage from "@/assets/images/BG-login.png";
import { useNavigate } from "react-router-dom";
import { login } from "../auth/auth.api";
import axios from "axios";
import { useAuthStore } from "./auth.store";
import { motion } from "framer-motion";
import { APP_ROLES } from "@/constant/roles";
import { User } from "./auth.types";
import { setAuthSession } from "@/services/storage";

const getDashboardPathByRole = (role?: string) => {
  if (role === APP_ROLES.ADMIN_LPPM) return "/admin-dashboard";
  if (role === APP_ROLES.STAFF_LPPM) return "/staff-lppm/staff-dashboard";
  if (role === APP_ROLES.DOSEN) return "/dosen-dashboard";
  if (role === APP_ROLES.REVIEWER) return "/reviewer-dashboard";
  if (role === APP_ROLES.REVIEWER_EKSTERNAL) {
    return "/reviewer-eksternal-dashboard";
  }
  return "/admin-dashboard";
};

const LoginPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 🆕 State untuk toast sukses login (UI only, tidak menyentuh logic auth)
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loggedInName, setLoggedInName] = useState("");

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

      setAuthSession({
        token,
        user,
        rememberMe,
      });

      setUser(user);

      const role = (user as User | undefined)?.roles?.roles;

      // 🆕 Trigger toast sukses sebelum redirect (tidak mengubah role/logic)
      setLoggedInName((user as User | undefined)?.name || "");
      setLoginSuccess(true);

      setTimeout(() => {
        navigate(getDashboardPathByRole(role));
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
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="relative min-h-dvh flex flex-col items-center justify-center bg-cover bg-center px-4 py-8 sm:px-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 backdrop-blur-xxs z-0"></div>

      <div className="relative z-10 w-full max-w-md lg:max-w-4xl xl:max-w-5xl">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 border border-red-300 rounded-xl text-sm text-center font-medium">
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

      <p className="relative z-10 mt-6 px-4 text-center text-[11px] text-gray-600">
        © 2026 Universitas Muhammadiyah Cirebon. All rights reserved.
      </p>
    </motion.div>
  );
};

export default LoginPage;