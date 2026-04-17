"use client";

import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ className = "", size = 32, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center rounded-md bg-white border border-[#E5E7EB] p-1.5 shadow-sm"
        style={{ width: size + 8, height: size + 8 }}
      >
        <img
          src="/logo 1.png"
          alt="LinkVault Logo"
          className="w-full h-full object-contain"
        />
      </motion.div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-[14px] font-black tracking-tight text-[#111827]">
            LinkVault
          </span>
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#9CA3AF]">
            Artifacts
          </span>
        </div>
      )}
    </div>
  );
}
