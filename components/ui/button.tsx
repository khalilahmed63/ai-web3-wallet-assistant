import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:scale-[1.02] hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}
