import { InputHTMLAttributes } from "react";

export type RegisterReviewerForm = {
  nama: string;
  email: string;
  nohp: string;
  instansi: string;
  bidang: string;
  pengalaman: string;
  file: File | null;
  username: string;
  password: string;
  confirm: string;
  agree: boolean;
};

export type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export interface FormTextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export interface PasswordInputProps extends FormInputProps {
  show: boolean;
  toggle: () => void;
}
