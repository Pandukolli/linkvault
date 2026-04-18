"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";

export default function SignupPage() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error(t("Google sign-up failed. Please try again.", "Google sign-up failed. Please try again."));
      setGoogleLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error(t("Please fill in all fields", "Please fill in all fields"));
      return;
    }
    if (password.length < 6) {
      toast.error(t("Password must be at least 6 characters", "Password must be at least 6 characters"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success(t("Check your email to confirm your account!", "Check your email to confirm your account!"));
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1117] selection:bg-[#06B6D4]/20 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4C2EFF]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#06B6D4]/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md mx-6 z-10"
      >
        <div className="text-center mb-10 flex flex-col items-center">
          <Logo size={48} className="scale-125 mb-4" />
          <p className="text-[#A3A8B8] text-sm font-medium mt-2">{t("Your personal knowledge operating system", "Your personal knowledge operating system")}</p>
        </div>

        <div className="bg-[#1A1D27] rounded-[2.5rem] p-8 sm:p-12 border border-[#24283B] shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#06B6D4]/20 to-transparent" />

          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white tracking-tight">{t("Create Account", "Create Account")}</h2>
            <p className="text-xs font-bold text-[#A3A8B8] mt-1 uppercase tracking-widest">{t("Initialize Your Archive", "Initialize Your Archive")}</p>
          </div>

          <div className="space-y-6">
            <Button
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              variant="outline"
              className="w-full h-14 text-sm font-bold border-[#24283B] bg-transparent hover:bg-[#24283B] hover:text-white transition-all duration-300 rounded-2xl shadow-none gap-3 text-[#F8FAFC]"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#06B6D4]" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#4285F4" className="opacity-80" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" className="opacity-80" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" className="opacity-80" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>{t("Sign up with Google", "Sign up with Google")}</span>
                </>
              )}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#24283B]" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]">
                <span className="bg-[#1A1D27] px-4 text-[#A3A8B8]">{t("or with credentials", "or with credentials")}</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[10px] font-bold uppercase tracking-widest text-[#A3A8B8] ml-1">{t("Full Name", "Full Name")}</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A8B8] group-focus-within:text-[#06B6D4] transition-colors" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-11 h-13 bg-[#0F1117] border-[#24283B] focus:border-[#06B6D4]/30 rounded-2xl font-medium text-white transition-all shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-[#A3A8B8] ml-1">{t("Email Address", "Email Address")}</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A8B8] group-focus-within:text-[#06B6D4] transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="operator@vaultos.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-13 bg-[#0F1117] border-[#24283B] focus:border-[#06B6D4]/30 rounded-2xl font-medium text-white transition-all shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-[#A3A8B8] ml-1">{t("Password", "Password")}</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A8B8] group-focus-within:text-[#06B6D4] transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-13 bg-[#0F1117] border-[#24283B] focus:border-[#06B6D4]/30 rounded-2xl font-medium text-white transition-all shadow-inner"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-[#0F1117] rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-[#06B6D4]/10 hover:shadow-[#06B6D4]/20 transition-all hover:-translate-y-0.5 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>{t("Initialize Archive", "Initialize Archive")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="pt-6 text-center border-t border-[#24283B]">
              <p className="text-xs font-medium text-[#A3A8B8]">
                {t("Already on vaultOS?", "Already on vaultOS?")}{" "}
                <Link
                  href="/login"
                  className="text-[#06B6D4] hover:text-[#06B6D4]/70 transition-all ml-1 font-bold"
                >
                  {t("Sign In", "Sign In")}
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#A3A8B8] opacity-50">© 2026 vaultOS // Personal Knowledge OS</p>
      </motion.div>
    </div>
  );
}
