import type { PropsWithChildren } from "react";

interface CardProps extends PropsWithChildren {
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <section
      className={`rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}
