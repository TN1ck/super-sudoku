import clsx from "clsx";
import React from "react";
import {twMerge} from "tailwind-merge";

type ButtonVariant = "default" | "accent" | "note";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  variant?: ButtonVariant;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  default: "border-border bg-button text-button-text hover:bg-button-hover",
  accent: "border-accent bg-accent text-accent-text hover:border-accent-hover hover:bg-accent-hover",
  note: "border-note bg-note text-accent-text hover:brightness-95",
};

const Button = ({
  children,
  className,
  disabled,
  active,
  variant = "default",
  onClick,
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={twMerge(
        clsx(
          "rounded-sm border px-2 py-1 shadow-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 md:px-4 md:py-2",
          VARIANT_CLASSES[variant],
          className,
          {
            "scale-110 brightness-95": active,
          },
        ),
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
