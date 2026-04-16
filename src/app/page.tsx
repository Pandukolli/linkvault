"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Shield,
  FolderOpen,
  StickyNote,
  PenLine,
  Image as ImageIcon,
  ArrowRight,
  Zap,
  Play,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useLinks } from "@/hooks/use-links";

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { links } = useLinks();
  const recentLinks = links?.slice(0, 3) || [];

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const rotate = useTransform(scrollY, [0, 500], [0, 10]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Instant Saving",
      description: "Paste any URL and we auto-fetch metadata instantly. Save in milliseconds.",
    },
    {
      icon: StickyNote,
      title: "Digital Notebooks",
      description: "Premium rich text editing with daily notes and multi-vault support.",
    },
    {
      icon: PenLine,
      title: "Blog Engine",
      description: "Write and publish beautiful artifacts with built-in SEO and social previewing.",
    },
    {
      icon: ImageIcon,
      title: "Visual Gallery",
      description: "Organize thousands of images with cinematic grids and smart sorting.",
    },
    {
      icon: FolderOpen,
      title: "Smart Collections",
      description: "Group any items into categorized collections for professional organization.",
    },
    {
      icon: Shield,
      title: "Vault Security",
      description: "Bank-level encryption and private storage. Your legacy, protected forever.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0B0F] text-slate-100 selection:bg-[#06B6D4]/20 selection:text-[#06B6D4] overflow-x-hidden pt-20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0B0F]/90 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size={32} />
          </Link>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard/project" className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 hover:text-slate-100 transition-colors">PROJECT</Link>
              <Link href="/dashboard/gallery" className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 hover:text-slate-100 transition-colors">GALLERY</Link>
            </div>
            {isAuthenticated === null ? (
              <div className="w-24 h-9 animate-pulse bg-white/5 rounded-full" />
            ) : isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="h-10 px-6 rounded-full bg-white text-black hover:bg-white/90 font-bold transition-all hover:scale-105">
                  Vault
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" className="h-10 px-6 rounded-full text-white/50 hover:text-white hover:bg-white/5 font-bold transition-all">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="h-10 px-6 rounded-full bg-white text-black hover:bg-white/90 font-bold transition-all hover:scale-105">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-15 pb-20 px-6 lg:px-12 relative min-h-[90vh] flex items-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column: Matter & CTA */}
          <div className="relative z-10 text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-[#14151B] text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
              Machine-Assisted Knowledge
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] mb-10 uppercase text-slate-100"
            >
              Next-Gen
              <br />
              <span className="text-[#06B6D4]">Vaulting.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 max-w-lg mb-12 leading-relaxed font-medium tracking-tight"
            >
              A high-end, absolute luxury hub for digital artifacts. Architected for peak performance and immersive organization.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-6"
            >
              <Link href={isAuthenticated ? "/dashboard/links" : "/signup"}>
                <Button size="lg" className="h-16 px-12 text-xs font-bold uppercase tracking-[0.3em] gap-3 rounded-full bg-[#FF4DFF] text-white hover:bg-[#FF4DFF]/90 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-[#FF4DFF]/20">
                  {isAuthenticated ? "Enter Vault" : "Start Consult"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <div className="mt-24 flex items-center gap-16 border-t border-white/5 pt-12">
              <div>
                <p className="text-3xl font-bold tracking-tighter mb-1">5.0</p>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="w-3 h-3 bg-yellow-400 rounded-sm" />)}
                </div>
                <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Global Standard</p>
              </div>
              <div className="max-w-[240px]">
                <p className="text-[12px] leading-relaxed text-white/40 font-medium italic">
                  "Advanced indexing ensures your knowledge is accessible within milliseconds."
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Parallax Composition (Visible on Large Screens) */}
          <div className="relative h-[650px] hidden lg:block">
            <motion.div
              style={{ y: y1, rotate }}
              className="absolute top-0 right-0 w-full h-[550px] rounded-[4rem] bg-black border-3 border-white/100 overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-blue-500 mix-blend-overlay" />
              <div className="p-16 h-full">
                <div className="w-full h-full border-3 border-white/20 rounded-3xl flex items-center justify-center relative bg-black">
                  <div className="absolute top-8 left-8 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[12px] uppercase tracking-[1.5em] text-white/50 font-bold">Secure Diagnosis</span>
                  <div className="absolute inset-x-16 bottom-16 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              </div>
            </motion.div>

            {/* Floating Status Card */}
            <motion.div
              style={{ y: y2 }}
              className="absolute -bottom-12 -left-12 w-72 p-8 rounded-[2.5rem] bg-white text-black shadow-2xl z-20"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-90 text-black">Precision</span>
                <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-black" />
                </div>
              </div>
              <p className="text-4xl font-bold mb-6 tracking-tighter">99.9%</p>
              <div className="flex gap-1.5 items-end h-16">
                {[30, 60, 40, 80, 50, 90, 45, 75, 55, 85].map((h, i) => (
                  <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-black rounded-[2px] opacity-30" />
                ))}
              </div>
            </motion.div>

            {/* Floating Accents */}
            <motion.div
              animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/4 left-0 w-12 h-12 rounded-full bg-blue-500 blur-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-48 px-6 lg:px-12 border-t border-white/2 bg-[#0A0B0F]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-[3rem] bg-[#14151B] border border-white/5 p-12 transition-all duration-700 hover:border-[#06B6D4]/20 hover:scale-[1.02]"
              >
                <div className="w-16 h-16 rounded-[1.5rem] bg-[#1F2129] text-[#06B6D4] flex items-center justify-center mb-10 border border-white/5 transition-transform shadow-xl group-hover:bg-[#06B6D4] group-hover:text-[#0A0B0F]">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black mb-5 tracking-tighter text-slate-100 uppercase">{feature.title}</h3>
                <p className="text-[15px] text-slate-400 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative pt-32 pb-16 px-6 bg-[#0A0B0F] overflow-hidden">
        {/* Aesthetic Separator */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#06B6D4]/30 to-transparent opacity-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-[#06B6D4]/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-20 relative z-10">

          {/* Brand Identity */}
          <div className="flex flex-col gap-8 w-full lg:w-1/3">
            <Logo size={48} showText={true} />
            <p className="text-[11px] leading-relaxed font-medium text-slate-400 capitalize-first-letter max-w-sm">
              The elegant Personal Knowledge OS where notes feel like books, images tell stories, and blogs come alive.
            </p>
          </div>

          {/* Dynamic Recent Links module if authenticated */}
          {isAuthenticated && (
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00F5FF]">Neural Stream (Recent)</span>
              </div>

              {recentLinks.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {recentLinks.map((link, i) => (
                    <Link
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between p-4 rounded-2xl bg-[#14151B] border border-white/5 hover:border-[#00F5FF]/30 transition-all duration-500 hover:translate-x-2"
                    >
                      <div className="flex flex-col gap-1 overflow-hidden pr-4">
                        <span className="text-[12px] font-bold text-white truncate">{link.title || link.url}</span>
                        <span className="text-[9px] text-white/30 uppercase tracking-widest truncate">{new URL(link.url).hostname}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#00F5FF]/10 transition-colors shrink-0">
                        <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-[#00F5FF]" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-white/5 bg-white/5 border-dashed">
                  <span className="text-[11px] font-medium text-white/30">Your vault is empty. Initialize your knowledge base today.</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation Matrix */}
          <div className="w-full lg:w-1/4 flex flex-col gap-8 lg:text-right">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] block">Sectors</span>
              <div className="flex flex-col gap-3 lg:items-end">
                <Link href="/dashboard/project" className="text-[12px] font-bold text-slate-400 hover:text-[#5E7BFF] transition-colors relative group w-max">
                  <span className="relative z-10">Project</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#5E7BFF] scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
                </Link>
                <Link href="/dashboard/gallery" className="text-[12px] font-bold text-slate-400 hover:text-[#FF4DFF] transition-colors relative group w-max">
                  <span className="relative z-10">Gallery</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#FF4DFF] scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
                </Link>
                <Link href="/dashboard/notes" className="text-[12px] font-bold text-slate-400 hover:text-[#06B6D4] transition-colors relative group w-max">
                  <span className="relative z-10">Notes</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#06B6D4] scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
                </Link>
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-white/5">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] block">Directory</span>
              <div className="flex flex-row flex-wrap lg:justify-end gap-x-6 gap-y-2">
                <Link href="#" className="text-[10px] font-medium uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Privacy</Link>
                <Link href="#" className="text-[10px] font-medium uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Terms</Link>
                <Link href="#" className="text-[10px] font-medium uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Manifesto</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Absolute Bottom Signature */}
        <div className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto text-center sm:text-left">
          <p className="text-[9px] font-bold text-[#06B6D4]/40 uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
            System Online — All systems nominal
          </p>
          <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} VaultOS. Architected for the Extraordinary.
          </p>
        </div>
      </footer>
    </div>
  );
}
