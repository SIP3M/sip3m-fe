import React, { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import bgImage from "@/assets/images/BG-login.png";
import { useNavigate } from "react-router-dom";
import { login } from "../auth/auth.api";
import axios from "axios";
import { useAuthStore } from "./auth.store";
import { motion } from "framer-motion";
import { APP_ROLES } from "@/constant/roles";

const LoginPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      };

      const response = await login(payload);

      const token = response.data.token;
      const user = response.data.user;

      localStorage.setItem("accessToken", token);
      localStorage.setItem("userData", JSON.stringify(user));

      setUser(user);

      // FIX ROLE REDIRECT
      const role =
        user?.roles?.role ||
        user?.roles?.name ||
        user?.role ||
        user?.roles;

      if (role === APP_ROLES.ADMIN_LPPM) {
        navigate("/admin-dashboard");
      } 
      else if (role === APP_ROLES.STAFF_LPPM) {
        navigate("/staff-lppm/admin-dashboard");
      } 
      else if (role === APP_ROLES.DOSEN) {
        navigate("/dosen-dashboard");
      } 
      else if (role === APP_ROLES.REVIEWER) {
        navigate("/reviewer-dashboard");
      } 
      else if (role === APP_ROLES.REVIEWER_EKSTERNAL) {
        navigate("/reviewer-eksternal-dashboard");
      } 
      else {
        navigate("/admin-dashboard"); // fallback supaya tidak stuck
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;

        if (responseData?.errors) {
          const firstErrorKey = Object.keys(responseData.errors)[0];
          const specificErrorMessage =
            responseData.errors[firstErrorKey][0];

          setErrorMessage(specificErrorMessage);
        } else {
          setErrorMessage(
            responseData?.message || "Terjadi kesalahan pada server."
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
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 backdrop-blur-xxs z-0"></div>

      <div className="relative z-10">
        {errorMessage && (
          <div className="mb-4 mx-4 p-3 bg-red-100 text-red-600 border border-red-300 rounded text-sm text-center font-medium">
            {errorMessage}
          </div>
        )}

        <LoginForm
          form={form}
          handleChange={handleChange}
          handleLogin={handleLogin}
          isLoading={isLoading}
        />
      </div>

      <p className="absolute bottom-2 text-[11px] text-gray-600">
        © 2026 Universitas Muhammadiyah Cirebon. All rights reserved.
      </p>
    </motion.div>
  );
};

export default LoginPage;