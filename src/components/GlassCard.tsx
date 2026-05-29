"use client";

import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export default function GlassCard({
  children,
  className = "",
  hover = false,
  style,
}: GlassCardProps) {
  return (
    <div
      className={`glass-card p-6 transition-all duration-300 ${
        hover
          ? "hover:bg-white/[0.08] hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5 cursor-pointer"
          : ""
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
