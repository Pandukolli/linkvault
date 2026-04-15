"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function DashboardStage() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return <div className="fixed inset-0 bg-black" />;

  return (
    <div className="fixed inset-0 z-0 bg-[#0A0B0F] overflow-hidden pointer-events-none" />
  );
}
