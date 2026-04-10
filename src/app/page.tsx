"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  Link2,
  Sparkles,
  Shield,
  FolderOpen,
  StickyNote,
  PenLine,
  Image as ImageIcon,
  FileText,
  Briefcase,
  ListMusic,
  ArrowRight,
  Zap,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Instant Link Saving",
      description: "Paste any URL and we auto-fetch title, description, and favicon. Save in seconds.",
    },
    {
      icon: StickyNote,
      title: "Digital Notebooks",
      description: "Beautiful note-taking with rich text editing. Create multiple notebooks, daily notes, and more.",
    },
    {
      icon: PenLine,
      title: "Blog Publishing",
      description: "Write and publish beautiful blogs with SEO optimization. Draft, preview, and share with the world.",
    },
    {
      icon: ImageIcon,
      title: "Image Gallery",
      description: "Upload and organize thousands of images. Drag-and-drop reordering with folders and captions.",
    },
    {
      icon: FileText,
      title: "Document Vault",
      description: "Store PDFs, documents and files securely. One-click download in original format.",
    },
    {
      icon: Briefcase,
      title: "Resume Builder",
      description: "Build professional resumes with beautiful templates. One-click export as PDF.",
    },
    {
      icon: FolderOpen,
      title: "Smart Collections",
      description: "Group any items into collections. Organize links, notes, images — everything in one place.",
    },
    {
      icon: Sparkles,
      title: "AI Auto-Tagging",
      description: "Optional AI-powered categorization. Organize your entire digital life effortlessly.",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Row Level Security, encrypted storage, and strict access policies. Your data, your privacy.",
    },
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Link2 className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <span className="text-xl font-black tracking-tighter text-black uppercase">LinkVault</span>
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated === null ? (
              <div className="w-24 h-9 animate-pulse bg-slate-50 rounded-lg" />
            ) : isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm" className="gap-1.5 h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">
                  Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-10 rounded-xl text-black font-bold hover:bg-slate-100">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="gap-1.5 h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-100 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 animate-fade-in-up">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-subtle-pulse" />
            Premium Personal Life OS
          </div>

          <h1
            className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tight leading-[0.9] mb-8 animate-fade-in-up text-black uppercase"
            style={{ animationDelay: "0.1s" }}
          >
            Digital chaos,
            <br />
            <span className="text-primary italic">mastered.</span>
          </h1>

          <p
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-bold tracking-tight animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            A high-end, absolute luxury hub for your links, notes, images, and documents. Built for clients who demand the best in organization and security.
          </p>

          <div
            className="flex items-center justify-center gap-4 flex-wrap animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {isAuthenticated === null ? (
              <div className="w-48 h-12 bg-slate-50 animate-pulse rounded-xl" />
            ) : isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-10 text-base font-black uppercase tracking-widest gap-2 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                  Open Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" className="h-14 px-10 text-base font-black uppercase tracking-widest gap-2 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                    Create Your Vault
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-10 text-base font-black uppercase tracking-widest rounded-2xl border-2 border-black text-black hover:bg-black hover:text-white transition-all hover:-translate-y-1"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-2 shadow-2xl shadow-primary/5">
            <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-white">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-6 py-1.5 rounded-full bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    linkvault.app/dashboard
                  </div>
                </div>
              </div>
              <div className="p-10 md:p-16 grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Links Saved", value: "2,847", icon: Link2 },
                  { label: "Notes Written", value: "482", icon: StickyNote },
                  { label: "Blogs Published", value: "23", icon: PenLine },
                  { label: "Images Stored", value: "1,294", icon: ImageIcon },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="group relative overflow-hidden rounded-3xl border border-primary/10 bg-primary/5 p-6 text-center shadow-lg shadow-primary/5 hover:bg-primary/10 transition-all duration-300"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <stat.icon className="w-6 h-6 mx-auto mb-4 text-primary relative z-10" />
                    <div className="text-3xl font-black tracking-tighter text-black relative z-10">{stat.value}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 relative z-10">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 border-y border-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-black uppercase">
              The Absolute Standard.
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg font-bold tracking-tight">
              One app to unify your digital existence. Engineered for performance and luxury.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-3xl bg-primary/5 border border-primary/10 p-8 hover:bg-primary/10 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <div className="w-12 h-12 rounded-2xl bg-white text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-primary/10 relative z-10">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-3 tracking-tight text-black uppercase relative z-10">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium relative z-10">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-[3rem] border border-slate-100 bg-white p-16 md:p-24 shadow-2xl shadow-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-black uppercase relative z-10">
              Your legacy,
              <br />
              <span className="text-primary italic">secured.</span>
            </h2>
            <p className="text-slate-500 mb-12 max-w-lg mx-auto text-lg font-bold tracking-tight relative z-10">
              Join the elite circle of users who treat their digital life as a premium asset.
            </p>
            <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
              <Button size="lg" className="h-14 px-12 text-base font-black uppercase tracking-widest gap-2 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 relative z-10">
                {isAuthenticated ? "Open Dashboard" : "Initiate Setup"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 px-6 bg-slate-50/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white stroke-[3]" />
            </div>
            <span className="text-base font-black uppercase tracking-tighter">LinkVault</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} LINKVAULT — PERSONAL LIFE OPERATING SYSTEM.
          </p>
        </div>
      </footer>
    </div>
  );
}
