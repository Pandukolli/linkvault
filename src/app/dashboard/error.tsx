"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error bubble:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-6 text-center animate-in fade-in zoom-in duration-300">
      <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-8 border border-destructive/20 shadow-xl shadow-destructive/5">
        <AlertTriangle className="w-10 h-10 text-destructive animate-pulse" />
      </div>
      
      <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
        Sector Anomaly Detected
      </h1>
      <p className="text-muted-foreground text-base max-w-md mx-auto mb-10 font-serif leading-relaxed">
        The Vault encountered an unexpected error while retrieving your data. 
        Your information remains secure, but the current view is unavailable.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Button 
          onClick={() => reset()}
          className="h-11 px-8 gap-2 bg-primary text-white hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
        >
          <RefreshCw className="w-4 h-4" />
          Re-establish Connection
        </Button>
        
        <Link href="/">
          <Button variant="outline" className="h-11 px-8 gap-2 font-bold border-border hover:bg-secondary transition-colors">
            <Home className="w-4 h-4" />
            Return to Surface
          </Button>
        </Link>
      </div>

      <div className="mt-12 p-3 bg-secondary/50 rounded-lg border border-border">
        <p className="text-[10px] font-mono whitespace-pre-wrap break-all text-muted-foreground opacity-50 uppercase tracking-widest">
          Error UUID: {error.digest || "SYSTEM_GENERAL_FAULT"}
        </p>
      </div>
    </div>
  );
}
