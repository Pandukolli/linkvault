"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  Shield,
  StickyNote,
  PenLine,
  ArrowRight,
  Zap,
  Globe,
  Lock,
  FileText,
  Search,
  Camera,
  Layers,
  Sparkles,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navOpacity = Math.min(scrollY / 100, 1);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* NAVIGATION                                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-500"
        style={{
          backgroundColor: `rgba(248, 250, 252, ${navOpacity * 0.95})`,
          backdropFilter: navOpacity > 0.1 ? "blur(20px) saturate(180%)" : "none",
          borderBottom: navOpacity > 0.3 ? "1px solid var(--border)" : "1px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size={36} showText={false} />
            <div className="flex flex-col leading-none">
              <span className="font-black text-xl tracking-tighter text-foreground font-space">VAULTOS</span>
              <span className="text-[8px] font-bold tracking-[0.4em] uppercase text-muted-foreground/30">CORE ENGINE</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 p-1 bg-secondary border border-border rounded-xl backdrop-blur-sm">
            {["Features", "Modules", "Workflow"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-premium"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated === null ? (
              <div className="w-28 h-10 bg-white/5 animate-pulse rounded-xl" />
            ) : isAuthenticated ? (
              <Link href="/dashboard" className="hidden sm:block">
                <Button className="h-10 px-6 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold rounded-xl text-sm shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:scale-95">
                  Launch Vault <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                  Sign In
                </Link>
                <Link href="/signup" className="hidden sm:block">
                  <Button className="h-10 px-6 bg-accent text-accent-foreground hover:bg-accent/90 font-bold rounded-xl text-sm shadow-lg shadow-accent/20 transition-premium hover:-translate-y-0.5 active:scale-95">
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger
                render={
                  <button className="md:hidden p-2.5 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
                    <Menu className="w-5 h-5" />
                  </button>
                }
              />
              <SheetContent side="right" className="w-[300px] p-0">
                <SheetHeader className="p-6 border-b border-border">
                  <SheetTitle className="text-xl font-black tracking-tighter">VAULTOS</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 p-6">
                  {["Features", "Modules", "Workflow"].map((item) => (
                    <Link
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="px-4 py-3 rounded-xl text-lg font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                    >
                      {item}
                    </Link>
                  ))}
                  <div className="h-px bg-border my-4" />
                  {isAuthenticated ? (
                    <Link href="/dashboard">
                      <Button className="w-full h-12 bg-primary text-white font-bold rounded-xl">
                        Launch Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link href="/login">
                        <Button variant="outline" className="w-full h-12 font-bold rounded-xl">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button className="w-full h-12 bg-accent text-accent-foreground font-bold rounded-xl">
                          Create Free Account
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION                                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <header className="relative pt-44 pb-32 px-6 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-primary rounded-full blur-[200px] opacity-[0.05] animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-accent rounded-full blur-[200px] opacity-[0.05] animate-pulse" style={{ animationDuration: "6s" }} />
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary rounded-full blur-[200px] opacity-[0.03]" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Status badge */}
          <div
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-surface border border-border text-muted-foreground text-[10px] font-black uppercase tracking-[0.25em] mb-12 backdrop-blur-sm shadow-sm transition-premium"
            style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}
          >
            <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-lg shadow-success/50" />
            All Systems Operational — V2.0 Live
          </div>

          {/* Main headline */}
          <h1
            className="text-[40px] leading-[1.1] sm:text-[64px] md:text-[88px] lg:text-[100px] font-black tracking-[-0.04em] md:leading-[0.95] mb-8"
            style={{ animation: "fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both" }}
          >
            <span className="block text-foreground">Your Digital</span>
            <span className="block text-primary">
              Command Center.
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-serif leading-relaxed mb-14"
            style={{ animation: "fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both" }}
          >
            VaultOS is a premium operating system for your digital life.
            Links, notes, blogs, galleries, documents — everything you care about,
            unified under one secure, beautiful vault.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
            style={{ animation: "fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both" }}
          >
            <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
              <Button className="h-16 px-12 text-[13px] font-black uppercase tracking-widest bg-accent text-accent-foreground hover:shadow-2xl hover:shadow-accent/30 rounded-2xl gap-3 w-full sm:w-auto transition-premium hover:-translate-y-1 active:scale-[0.98]">
                Initialize Your Vault
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="#modules">
              <Button variant="outline" className="h-16 px-12 text-[13px] font-bold uppercase tracking-widest border-border text-muted-foreground hover:text-foreground hover:bg-surface rounded-2xl w-full sm:w-auto transition-premium">
                Explore Modules
              </Button>
            </a>
          </div>

          {/* Stats strip */}
          <div
            className="mt-28 flex flex-wrap items-center justify-center gap-x-16 gap-y-8"
            style={{ animation: "fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both" }}
          >
            {[
              { value: "256-bit", label: "Encryption" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "<50ms", label: "Response" },
              { value: "6", label: "Core Modules" },
            ].map((stat) => (
              <div key={stat.label} className="text-center min-w-[100px]">
                <p className="text-3xl font-black text-foreground mb-1">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Divider gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEATURE BENTO GRID                                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="py-32 px-6 relative bg-surface">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12 md:mb-20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">WHY VAULTOS</p>
            <h2 className="text-[32px] md:text-[52px] font-black tracking-[-0.03em] leading-[1.1] md:leading-[1.05] text-foreground mb-6">
              Built for clarity.<br />
              <span className="text-muted-foreground/30">Designed for power.</span>
            </h2>
            <p className="max-w-xl mx-auto text-base text-muted-foreground font-serif leading-relaxed">
              Every pixel engineered for digital professionals who demand excellence from their tools.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Zap, title: "Instant Capture", color: "var(--accent)",
                desc: "Save any URL in milliseconds. Our engine auto-fetches titles, favicons, descriptions, and open-graph previews — zero effort required.",
                tag: "AUTOMATIC",
              },
              {
                icon: Lock, title: "Vault-Grade Security", color: "var(--primary)",
                desc: "Bank-level encryption. Row-level security policies ensure your knowledge is truly private and uniquely yours.",
                tag: "ENTERPRISE",
              },
              {
                icon: Sparkles, title: "AI-Powered Tagging", color: "#7C3AED",
                desc: "Smart categorization that learns your patterns. Auto-suggest tags, mood detection in notes, and intelligent search across all modules.",
                tag: "INTELLIGENT",
              },
              {
                icon: Globe, title: "Public Publishing", color: "var(--success)",
                desc: "Transform private notes into public blog posts with one click. Built-in SEO, social previews, and a discovery feed for your audience.",
                tag: "DISTRIBUTION",
              },
              {
                icon: Layers, title: "Unified Collections", color: "#3B82F6",
                desc: "Group links, notes, and images into intelligent collections. Cross-reference artifacts from any module into logical hierarchies.",
                tag: "ORGANIZED",
              },
              {
                icon: Search, title: "Deep Search", color: "var(--warning)",
                desc: "Full-text search across every module — links, notes, blogs, galleries, and documents. Find anything in milliseconds.",
                tag: "COMPREHENSIVE",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-2xl bg-background border border-border hover:border-primary/20 transition-premium hover:shadow-xl hover:shadow-primary/5 overflow-hidden"
                style={{ animation: `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 * i}s both` }}
              >
                {/* Hover glow */}
                <div
                  className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-[0.05] transition-opacity duration-700"
                  style={{ backgroundColor: feature.color }}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-premium shadow-inner"
                      style={{ backgroundColor: `color-mix(in srgb, ${feature.color}, transparent 90%)`, color: feature.color }}
                    >
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-secondary text-muted-foreground/40 border border-border">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-foreground mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-serif">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MODULE SHOWCASE — The heart of the landing page               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="modules" className="py-32 px-6 relative bg-background">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-primary rounded-full blur-[300px] opacity-[0.02]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4">COMMAND MODULES</p>
            <h2 className="text-[32px] md:text-[52px] font-black tracking-[-0.03em] leading-[1.1] md:leading-[1.05] text-foreground mb-6">
              Six engines.<br />
              <span className="text-muted-foreground/30">One vault.</span>
            </h2>
          </div>

          {/* Module cards — alternating left-right layout */}
          <div className="space-y-8">

            {/* ROW 1: Links + Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Links Module */}
              <div className="group relative rounded-3xl overflow-hidden border border-border bg-surface p-6 sm:p-10 lg:p-12 hover:border-primary/30 transition-premium shadow-sm hover:shadow-xl hover:shadow-primary/5">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary rounded-full blur-[120px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-primary">VAULTOS</span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight mb-4">Save Everything.<br />Find Anything.</h3>
                  <p className="text-sm text-muted-foreground font-serif leading-relaxed mb-8 max-w-md">
                    Paste a URL, and our engine captures the title, favicon, description, and open-graph image automatically. Organize with collections, search instantly, and never lose a bookmark again.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Auto-Metadata", "Favicon Fetch", "Collections", "Favorites", "Search"].map((t) => (
                      <span key={t} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground/60 border border-border">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes Module */}
              <div className="group relative rounded-3xl overflow-hidden border border-border bg-surface p-6 sm:p-10 lg:p-12 hover:border-[#7C3AED]/30 transition-premium shadow-sm hover:shadow-xl hover:shadow-primary/5">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#7C3AED] rounded-full blur-[120px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center shadow-inner">
                      <StickyNote className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#7C3AED]">NOTEBOOK</span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight mb-4">Write Without<br />Boundaries.</h3>
                  <p className="text-sm text-muted-foreground font-serif leading-relaxed mb-8 max-w-md">
                    A rich-text editor with cover images, mood tracking, voice recording, multilingual support, poetry mode, and legacy letters. Your private digital journal, beautifully designed.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Rich Editor", "Mood Tracker", "Voice Notes", "Cover Images", "Poetry Mode", "Daily Pages"].map((t) => (
                      <span key={t} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground/60 border border-border">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: Gallery (full width) */}
            <div className="group relative rounded-3xl overflow-hidden border border-border bg-surface hover:border-accent/30 transition-premium shadow-sm hover:shadow-xl hover:shadow-accent/5">
              <div className="absolute top-0 right-0 w-72 h-72 bg-accent rounded-full blur-[200px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shadow-inner">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-accent">GALLERY</span>
                  </div>
                  <h3 className="text-2xl lg:text-4xl font-black text-foreground tracking-tight mb-4">Visual Archive.<br />Cinematic Stories.</h3>
                  <p className="text-sm text-muted-foreground font-serif leading-relaxed mb-8 max-w-lg">
                    Upload and manage your images in project-based folders. Create cinematic photo stories with templates — polaroid, documentary, travel journal, and more. Lightbox viewer, bulk operations, and drag-and-drop.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Masonry Layout", "Photo Stories", "Project Folders", "Lightbox", "Bulk Ops", "Story Templates"].map((t) => (
                      <span key={t} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground/60 border border-border">{t}</span>
                    ))}
                  </div>
                </div>
                {/* Decorative image grid - High contrast black boxes with white gaps */}
                <div className="grid grid-cols-3 gap-3 p-8 lg:p-14 bg-smoke opacity-100 order-first lg:order-last border-b lg:border-l border-border/50">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-black/20 aspect-square transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/20"
                      style={{ animationDelay: `${i * 80}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ROW 3: Blogs + Documents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Blogs Module */}
              <div className="group relative rounded-3xl overflow-hidden border border-border bg-surface p-6 sm:p-10 lg:p-12 hover:border-success/30 transition-premium shadow-sm hover:shadow-xl hover:shadow-success/5">
                <div className="absolute top-0 right-0 w-48 h-48 bg-success rounded-full blur-[120px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shadow-inner">
                      <PenLine className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-success">EDITORIAL STUDIO</span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight mb-4">Write. Publish.<br />Get Discovered.</h3>
                  <p className="text-sm text-muted-foreground font-serif leading-relaxed mb-8 max-w-md">
                    A distraction-free editor with cover images, categories, reading time estimates, and SEO optimization. Publish to your personal Blog Diary feed with one click.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Full-Screen Editor", "SEO Preview", "Blog Diary", "Categories", "Draft/Publish"].map((t) => (
                      <span key={t} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground/60 border border-border">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Documents Module */}
              <div className="group relative rounded-3xl overflow-hidden border border-border bg-surface p-6 sm:p-10 lg:p-12 hover:border-primary/30 transition-premium shadow-sm hover:shadow-xl hover:shadow-primary/5">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary rounded-full blur-[120px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-primary">ARCHIVES</span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight mb-4">Secure Document<br />Transmission.</h3>
                  <p className="text-sm text-muted-foreground font-serif leading-relaxed mb-8 max-w-md">
                    Upload and archive PDFs, spreadsheets, source code, and any file type. Type-aware icons, instant downloads, and drag-and-drop upload zones built for speed.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Drag & Drop", "Type-Aware Icons", "Download / Delete", "File Size Display", "Secure Storage"].map((t) => (
                      <span key={t} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground/60 border border-border">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* WORKFLOW SECTION                                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="workflow" className="py-32 px-6 relative bg-surface">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-32" />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-success mb-4">HOW IT WORKS</p>
            <h2 className="text-[32px] md:text-[52px] font-black tracking-[-0.03em] leading-[1.1] md:leading-[1.05] text-foreground">
              Three steps to<br />
              <span className="text-muted-foreground/30">digital sovereignty.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary/20 via-[#7C3AED]/20 to-accent/20" />

            {[
              {
                step: "01",
                title: "Create Your Vault",
                desc: "Sign up in seconds with Google or email. Your encrypted personal OS is instantly provisioned and ready.",
                color: "var(--primary)",
                icon: Shield,
              },
              {
                step: "02",
                title: "Capture Everything",
                desc: "Paste links, write notes, upload images, draft blogs, store documents. Every module works together seamlessly.",
                color: "#7C3AED",
                icon: Sparkles,
              },
              {
                step: "03",
                title: "Access Anywhere",
                desc: "Your vault is always available, always synced, always secure. Search across all modules with a single query.",
                color: "var(--accent)",
                icon: Globe,
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                <div
                  className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center mx-auto mb-8 border border-border bg-background group-hover:border-primary/20 transition-premium shadow-sm"
                  style={{ boxShadow: `0 0 40px color-mix(in srgb, ${item.color}, transparent 95%)` }}
                >
                  <item.icon className="w-7 h-7" style={{ color: item.color }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] block mb-4" style={{ color: item.color }}>{item.step}</span>
                <h3 className="text-xl font-black text-foreground mb-3 tracking-tight">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-serif leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TRUST / TECHNOLOGY SECTION                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 relative bg-background">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-32" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mb-4">BUILT WITH</p>
            <h2 className="text-[36px] md:text-[44px] font-black tracking-[-0.03em] leading-[1.1] text-foreground mb-4">
              Enterprise-grade foundation.
            </h2>
            <p className="text-base text-muted-foreground font-serif max-w-lg mx-auto">
              Powered by the same infrastructure that runs the world&apos;s most critical applications.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Next.js 16", desc: "React framework", icon: "⚡" },
              { label: "Supabase", desc: "Auth & Database", icon: "🔐" },
              { label: "TanStack Query", desc: "Data management", icon: "📡" },
              { label: "Row-Level Security", desc: "Data isolation", icon: "🛡️" },
              { label: "Turbopack", desc: "Lightning builds", icon: "🚀" },
              { label: "Edge Functions", desc: "Global delivery", icon: "🌐" },
              { label: "AES-256", desc: "Military encryption", icon: "🔒" },
              { label: "Real-time Sync", desc: "Live updates", icon: "♾️" },
            ].map((tech, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-surface border border-border text-center hover:bg-background hover:border-primary/20 transition-premium shadow-sm"
              >
                <div className="text-2xl mb-3">{tech.icon}</div>
                <p className="text-sm font-black text-foreground mb-1">{tech.label}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FINAL CTA                                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden bg-background">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary rounded-full blur-[300px] opacity-[0.03]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent rounded-full blur-[200px] opacity-[0.03]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-surface border border-border flex items-center justify-center mx-auto mb-10 shadow-sm transition-premium">
            <Sparkles className="w-7 h-7 md:w-9 md:h-9 text-accent" />
          </div>

          <h2 className="text-[36px] md:text-[64px] font-black tracking-[-0.03em] leading-[1.1] md:leading-[1.05] text-foreground mb-8">
            Ready to take<br />
            <span className="text-accent">control?</span>
          </h2>

          <p className="text-lg text-muted-foreground font-serif max-w-xl mx-auto mb-14 leading-relaxed">
            Your links, notes, images, blogs, and documents deserve a premium home.
            Start building your digital vault today — completely free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
              <Button className="h-16 px-14 text-[13px] font-black uppercase tracking-widest bg-accent text-accent-foreground hover:shadow-2xl hover:shadow-accent/30 rounded-2xl gap-3 transition-premium hover:-translate-y-1 active:scale-[0.98]">
                {isAuthenticated ? "Launch Vault" : "Get Started Free"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20">
            No credit card required · Free forever · Your data, your vault
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer className="py-20 px-6 border-t border-border bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
          <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3">
              <Logo size={32} showText={false} />
              <div className="flex flex-col leading-none">
                <span className="font-black text-xl tracking-tighter text-foreground font-space">VAULTOS</span>
                <span className="text-[8px] font-bold tracking-[0.4em] uppercase text-muted-foreground/30">SECURE OPERATING SYSTEM</span>
              </div>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground font-serif leading-relaxed">
              The premium operating system for managing links, notes, images, blogs, and documents. Architected for clarity, power, and digital sovereignty.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-success shadow-lg shadow-green-500/50" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">All Systems Operational</span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-6">Modules</h4>
            <div className="flex flex-col gap-4">
              {[
                { label: "Links", href: "/dashboard" },
                { label: "NoteBook", href: "/dashboard/notes" },
                { label: "Editorial Blog", href: "/dashboard/blogs" },
                { label: "Gallery", href: "/dashboard/gallery" },
                { label: "Collections", href: "/dashboard/collections" },
              ].map((l) => (
                <Link key={l.label} href={l.href} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-premium">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-6">Legal</h4>
            <div className="flex flex-col gap-4">
              {["Privacy Policy", "Terms of Service", "Security", "Blog Diary"].map((l) => (
                <span key={l} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-premium cursor-pointer">
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} VaultOS. Engineered with precision.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold text-muted-foreground/10 uppercase tracking-widest">V2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
