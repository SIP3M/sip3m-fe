import {
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { AlertCircle, Check, ChevronsUpDown, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { MasterData } from "./auth.api";

/**
 * Kit field bersama untuk halaman registrasi (dosen & reviewer).
 * Satu sumber kelas kontrol agar tinggi, radius, focus, dan gaya error seragam.
 */

const fieldControlClass = ({
  error = false,
  className,
}: {
  error?: boolean;
  className?: string;
} = {}) =>
  cn(
    "w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition",
    "focus:outline-none focus:bg-white",
    "disabled:cursor-not-allowed disabled:opacity-50",
    error
      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
      : "border-gray-200 bg-[#f9f9f9] focus:border-[#e10600] focus:ring-4 focus:ring-[#e10600]/10",
    className,
  );

export const FieldLabel = ({
  htmlFor,
  label,
  required = false,
}: {
  htmlFor?: string;
  label: string;
  required?: boolean;
}) => (
  <label
    htmlFor={htmlFor}
    className="mb-1.5 block text-sm font-medium text-gray-700"
  >
    {label}
    {required && <span className="ml-0.5 text-[#e10600]">*</span>}
  </label>
);

export const FieldError = ({ error }: { error?: string }) =>
  error ? (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
      <AlertCircle size={12} className="shrink-0" aria-hidden />
      {error}
    </p>
  ) : null;

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
}

export const TextField = ({
  label,
  required,
  error,
  className,
  ...props
}: TextFieldProps) => (
  <div>
    <FieldLabel htmlFor={props.name} label={label} required={required} />
    <input
      {...props}
      id={props.id ?? props.name}
      aria-invalid={error ? true : undefined}
      className={fieldControlClass({ error: !!error, className })}
    />
    <FieldError error={error} />
  </div>
);

export const PasswordField = ({
  label,
  required,
  error,
  className,
  ...props
}: TextFieldProps) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <FieldLabel htmlFor={props.name} label={label} required={required} />
      <div className="relative">
        <input
          {...props}
          id={props.id ?? props.name}
          type={show ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          className={fieldControlClass({
            error: !!error,
            className: cn("pr-10", className),
          })}
        />
        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-400 transition hover:text-[#e10600]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <FieldError error={error} />
    </div>
  );
};

export interface TextAreaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: string;
}

export const TextAreaField = ({
  label,
  required,
  error,
  className,
  ...props
}: TextAreaFieldProps) => (
  <div>
    <FieldLabel htmlFor={props.name} label={label} required={required} />
    <textarea
      {...props}
      id={props.id ?? props.name}
      aria-invalid={error ? true : undefined}
      className={fieldControlClass({
        error: !!error,
        className: cn("min-h-[88px] resize-y", className),
      })}
    />
    <FieldError error={error} />
  </div>
);

export const AgreeCheckbox = ({
  name,
  checked,
  onChange,
  error,
  children,
}: {
  name: string;
  checked?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  children: ReactNode;
}) => (
  <div>
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-gray-700">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#e10600]"
      />
      <span>{children}</span>
    </label>
    <FieldError error={error} />
  </div>
);

/** Banner pesan error API — ditaruh di atas isi kartu form. */
export const FormAlert = ({ message }: { message?: string }) =>
  message ? (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
      <span>{message}</span>
    </motion.div>
  ) : null;

/** Stepper berlabel — lingkaran + connector animasi, dipakai semua halaman register. */
export const RegisterStepper = ({
  labels,
  current,
}: {
  labels: string[];
  current: number;
}) => (
  <div className="mb-10 flex items-center justify-between px-6">
    {labels.map((label, i) => {
      const num = i + 1;
      const isDone = current > num;
      const isCurrent = current === num;

      return (
        <div key={label} className="flex flex-1 items-center">
          <div className="relative z-10 flex flex-col items-center bg-white">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition",
                isDone && "border-[#e10600] bg-[#e10600] text-white",
                isCurrent &&
                  "border-[#e10600] bg-white text-[#e10600] ring-4 ring-[#e10600]/10",
                !isDone &&
                  !isCurrent &&
                  "border-gray-300 bg-white text-gray-400",
              )}
            >
              {isDone ? <Check size={14} aria-hidden /> : num}
            </div>

            <span
              className={cn(
                "mt-2 w-24 text-center text-xs",
                isDone || isCurrent
                  ? "font-medium text-gray-800"
                  : "text-gray-400",
              )}
            >
              {label}
            </span>
          </div>

          {i < labels.length - 1 && (
            <div className="relative mx-2 mt-4 h-0.5 flex-1 bg-gray-200">
              <motion.div
                initial={false}
                animate={{ width: isDone ? "100%" : "0%" }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute inset-y-0 left-0 bg-[#e10600]"
              />
            </div>
          )}
        </div>
      );
    })}
  </div>
);

/** Combobox pencarian (Shadcn Popover + Command) — untuk Fakultas/Program Studi. */
export const SearchableSelect = ({
  label,
  required = false,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
}: {
  label: string;
  required?: boolean;
  options: MasterData[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  error?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <FieldLabel label={label} required={required} />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={disabled}
            className={fieldControlClass({
              error: !!error,
              className: "flex items-center justify-between text-left",
            })}
            role="combobox"
            aria-expanded={open}
          >
            {value ? (
              options.find((opt) => opt.id.toString() === value)?.nama
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-full max-w-[400px] border-none p-0 shadow-lg">
          <Command>
            <CommandInput
              placeholder="Cari..."
              className="border-none focus:ring-0"
            />
            <CommandList>
              <CommandEmpty>Tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.id}
                    value={opt.nama} // cmdk mencari berdasarkan value ini
                    onSelect={() => {
                      onChange(opt.id.toString());
                      setOpen(false);
                    }}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === opt.id.toString()
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {opt.nama}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <FieldError error={error} />
    </div>
  );
};
