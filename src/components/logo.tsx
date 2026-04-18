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
        className="relative flex items-center justify-center p-0.5"
        style={{ width: size + 4, height: size + 4 }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          
          {/* Main V-Arrow Body */}
          <path
            d="M15 25L45 85L85 25"
            stroke="#1e293b"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Arrow Head */}
          <path
            d="M75 35L85 25L95 35"
            stroke="#1e293b"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Blue Wave/Ribbon */}
          <path
            d="M5 55C25 55 35 35 55 35C75 35 85 55 105 55"
            stroke="url(#waveGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            className="opacity-90"
          />
        </svg>
      </motion.div>

      {showText && (
        <div className="flex flex-col leading-[0.75]">
          <span className="text-[20px] font-black tracking-tighter text-[#1e293b] font-space uppercase">
            VAULTOS
          </span>
          <span className="text-[7px] font-black tracking-[0.5em] uppercase text-[#94a3b8] mt-1">
            CORE ENGINE
          </span>
        </div>
      )}
    </div>
  );
}
