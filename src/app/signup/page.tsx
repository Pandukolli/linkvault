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
import { Link2, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-background selection:bg-primary/20">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md mx-6"
      >
        {/* Simple Brand Header */}
        <div className="text-center mb-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 mb-6">
              <Link2 className="w-8 h-8 text-white stroke-[2.5]" />
            </div>
            <h1 className="text-3xl font-black text-black tracking-tight uppercase">LinkVault</h1>
        </div>

        {/* Simplified Auth Card */}
        <div className="bg-card rounded-[2.5rem] p-10 sm:p-12 border-[1.5px] border-border shadow-2xl shadow-black/5 relative overflow-hidden">
          
          <div className="text-center mb-10">
             <h2 className="text-2xl font-black text-black tracking-tight">{t("Create Account", "Create Account")}</h2>
             <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-60">{t("Start your premium archive", "Start your premium archive")}</p>
          </div>

          <div className="space-y-6">
            <Button
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              variant="outline"
              className="w-full h-14 text-sm font-bold border-border/60 hover:border-primary hover:bg-white transition-all duration-300 rounded-xl shadow-none gap-3"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#4285F4" className="opacity-20" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#4285F4" className="opacity-40" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-black">{t("Sign up with Google", "Sign up with Google")}</span>
                </>
              )}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]">
                <span className="bg-card px-4 text-slate-300">{t("or with email", "or with email")}</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("Full Name", "Full Name")}</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-11 h-13 bg-white/50 border-border/50 focus:border-primary focus:bg-white rounded-xl font-bold text-black transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("Email Address", "Email Address")}</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-13 bg-white/50 border-border/50 focus:border-primary focus:bg-white rounded-xl font-bold text-black transition-all"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("Password", "Password")}</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-13 bg-white/50 border-border/50 focus:border-primary focus:bg-white rounded-xl font-bold text-black transition-all"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>{t("Sign Up", "Sign Up")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="pt-6 text-center">
              <p className="text-xs font-bold text-slate-400">
                {t("Already have an account?", "Already have an account?")}{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/70 transition-all ml-1 border-b-2 border-primary/10 hover:border-primary"
                >
                  {t("Sign in", "Sign in")}
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Simple Footer */}
        <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 opacity-50 italic">© 2026 LinkVault // Professional Archive</p>
      </motion.div>
    </div>
  );
}
