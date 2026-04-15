"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

export function TransmissionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [triggerSweep, setTriggerSweep] = useState(false);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    // Trigger the sweep effect on route change
    setTriggerSweep(true);
    const timer = setTimeout(() => setTriggerSweep(false), 800);
    return () => clearTimeout(timer);
  }, [pathname, isFirstRender]);

  return (
    <div className="relative min-h-screen w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* The Light Sweep Overlay */}
      <AnimatePresence>
        {triggerSweep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="transmission-sweep"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
