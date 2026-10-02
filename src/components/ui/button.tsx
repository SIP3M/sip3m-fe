import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
  size?: string;
  asChild?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  className = "",
  children,
  variant,
  size,
  asChild,
  ...props
}) => {
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
};

export { Button };
export default Button;

