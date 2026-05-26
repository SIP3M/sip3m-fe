import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = ({
  className = "",
  disabled,
  ...props
}) => {
  return (
    <input
      disabled={disabled}
      className={`
        w-full
        min-h-[44px]
        rounded-xl
        border border-gray-300
        bg-white
        px-4 py-2.5
        text-sm text-gray-900
        placeholder:text-gray-400
        shadow-sm
        transition-all duration-200 ease-in-out
        hover:border-gray-400
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
        disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
        autofill:bg-white
        ${className}
      `}
      {...props}
    />
  );
};

export default Input;