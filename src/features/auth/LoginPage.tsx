import React, { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import bgImage from "@/assets/images/BG-login.png";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    navigate("/dashboard");
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* BACKGROUND OVERLAY */}
      <div className="absolute inset-0 backdrop-blur-xxs z-0"></div>

      {/* LOGIN FORM */}
      <div className="relative z-10">
        <LoginForm
          form={form}
          handleChange={handleChange}
          handleLogin={handleLogin}
        />
      </div>

      <p className="absolute bottom-2 text-[11px] text-gray-600 ">
        © 2026 Universitas Muhammadiyah Cirebon. All rights reserved.
      </p>
    </div>
  );
};

export default LoginPage;