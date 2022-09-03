import clsx from "clsx";
import React from "react";
import {overrideTailwindClasses} from "tailwind-override";

const Button = ({
  children,
  className,
  disabled,
  active,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={overrideTailwindClasses(
        clsx(
          "rounded-sm border-none bg-white px-4 py-2 text-black shadow-sm transition-transform hover:brightness-90 focus:outline-none disabled:brightness-75",
          className,
          {
            "scale-110 brightness-90": active,
          },
        ),
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
