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
        className="relative flex items-center justify-center overflow-hidden rounded-xl bg-white/5 border border-white/10 p-1.25"
        style={{ width: size + 10, height: size + 10 }}
      >
        <img
          src="/logo 1.png"
          alt="VaultOS Logo"
          className="w-full h-full object-contain brightness-125 contrast-110"
          style={{
            filter: "drop-shadow(0 0 12px rgba(163, 255, 61, 0.4))"
          }}
        />
        {/* Scanline Effect (CRT Style) */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%]" />
      </motion.div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-[14px] font-black tracking-[0.25em] text-white -mb-0.5">
            Vault<span className="uppercase text-[#A3FF3D]">OS</span>
          </span>
          <span className="text-[7px] font-bold tracking-[0.5em] uppercase text-white/20">
            Neural Grid
          </span>
        </div>
      )}
    </div>
  );
}

