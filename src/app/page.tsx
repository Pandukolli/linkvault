"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  Shield,
  FolderOpen,
  StickyNote,
  PenLine,
  Image as ImageIcon,
  ArrowRight,
  Zap,
  Globe,
  Lock,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useLinks } from "@/hooks/use-links";

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { links } = useLinks();
  const recentLinks = links?.slice(0, 3) || [];

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Instant Capture",
      description: "Save any web artifact in milliseconds. Automated metadata extraction ensures your vault stays organized without effort.",
    },
    {
      icon: StickyNote,
      title: "Professional Notes",
      description: "A premium writing environment designed for clarity. Daily journals, technical documentation, and long-form essays.",
    },
    {
      icon: PenLine,
      title: "Content Engine",
      description: "Transform your notes into beautiful public blogs. Built-in SEO and social previews for professional distribution.",
    },
    {
      icon: ImageIcon,
      title: "Visual Archive",
      description: "Manage high-resolution imagery with precision. Cinematic grids and smart sorting for your visual assets.",
    },
    {
      icon: FolderOpen,
      title: "Smart Collections",
      description: "Group disjointed artifacts into logical hierarchies. Cross-referencing makes your knowledge truly accessible.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption standards. Your personal knowledge is private, secure, and uniquely yours.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size={36} showText={false} />
            <span className="font-bold text-xl tracking-tight text-[#111827]">LinkVault</span>
          </Link>
          
          <div className="flex items-center gap-10">
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-semibold text-[#6B7280] hover:text-[#2563EB] transition-colors">Features</Link>
              <Link href="/dashboard/gallery" className="text-sm font-semibold text-[#6B7280] hover:text-[#2563EB] transition-colors">Gallery</Link>
            </div>
            
            <div className="flex items-center gap-4">
              {isAuthenticated === null ? (
                <div className="w-20 h-9 bg-[#F1F5F9] animate-pulse rounded-md" />
              ) : isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold px-6 h-10 rounded-md">
                    Launch Vault
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-bold text-[#111827] hover:text-[#2563EB] transition-colors">
                    Login
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-[#F97316] text-white hover:bg-[#EA580C] font-bold px-6 h-10 rounded-md shadow-lg shadow-orange-500/20">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] text-xs font-bold uppercase tracking-widest mb-10 mx-auto">
            <Globe className="w-3.5 h-3.5" />
            V2.0 is now live
          </div>
          
          <h1 className="text-[48px] md:text-[80px] font-black tracking-tight leading-[1.05] text-[#111827] mb-8">
            The Professional <br />
            <span className="text-[#2563EB]">Knowledge OS.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#6B7280] mb-12 font-serif leading-relaxed">
            LinkVault is a high-fidelity environment for digital artifacts. Architected for peak performance, deep focus, and immersive organization.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
              <Button className="h-16 px-10 text-base font-bold bg-[#F97316] text-white hover:bg-[#EA580C] rounded-md gap-3 shadow-xl shadow-orange-500/20 w-full sm:w-auto">
                Start Your Collection
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="h-16 px-10 text-base font-bold border-[#E5E7EB] text-[#111827] hover:bg-white rounded-md w-full sm:w-auto">
                Existing User
              </Button>
            </Link>
          </div>

          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto pt-16 border-t border-[#E5E7EB]">
             {[
               { label: "Uptime", value: "99.9%" },
               { label: "Encryption", value: "AES-256" },
               { label: "Latency", value: "< 2ms" },
               { label: "Users", value: "10k+" }
             ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-black text-[#111827] mb-1">{stat.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">{stat.label}</p>
                </div>
             ))}
          </div>
        </div>
      </header>

      {/* Feature Section */}
      <section id="features" className="py-32 bg-white border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-[32px] md:text-[44px] font-black tracking-tight text-[#111827] mb-4">Core Infrastructure</h2>
            <p className="text-lg text-[#6B7280] font-serif max-w-xl mx-auto">Built for clarity and strength. A unified system for all your digital knowledge.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="p-10 bg-[#F8FAFC] border border-[#E5E7EB] rounded-md group hover:border-[#2563EB] transition-all duration-300">
                <div className="w-12 h-12 rounded-md bg-white border border-[#E5E7EB] text-[#2563EB] flex items-center justify-center mb-8 group-hover:bg-[#2563EB] group-hover:text-white group-hover:border-[#2563EB] transition-colors">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-[#6B7280] font-serif">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="bg-[#111827] p-12 md:p-24 rounded-md text-white overflow-hidden relative shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-[32px] md:text-[56px] font-black tracking-tight leading-[1.1] mb-8">
                Ready to secure your <br />
                digital legacy?
              </h2>
              <Link href="/signup">
                <Button className="h-16 px-12 text-base font-bold bg-[#F97316] text-white hover:bg-[#EA580C] rounded-md gap-3 mx-auto">
                  Initialize Your Vault
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            {/* Visual background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB] blur-[160px] opacity-20 -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F97316] blur-[160px] opacity-20 -ml-32 -mb-32" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-[#E5E7EB] bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
          <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3">
              <Logo size={32} showText={false} />
              <span className="font-bold text-lg tracking-tight text-[#111827]">LinkVault</span>
            </Link>
            <p className="max-w-sm text-sm text-[#6B7280] font-serif leading-relaxed">
              The high-end environment for managing links, notes, images, and professional writing. Architected for the extraordinary.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#111827] mb-6">Network</h4>
            <div className="flex flex-col gap-4">
              <Link href="/dashboard/links" className="text-sm font-semibold text-[#6B7280] hover:text-[#2563EB] transition-colors">Digital Vault</Link>
              <Link href="/dashboard/blogs" className="text-sm font-semibold text-[#6B7280] hover:text-[#2563EB] transition-colors">Publication</Link>
              <Link href="/dashboard/notes" className="text-sm font-semibold text-[#6B7280] hover:text-[#2563EB] transition-colors">Notebook</Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#111827] mb-6">Directory</h4>
            <div className="flex flex-col gap-4">
              <Link href="#" className="text-sm font-semibold text-[#6B7280] hover:text-[#2563EB] transition-colors">Legal Framework</Link>
              <Link href="#" className="text-sm font-semibold text-[#6B7280] hover:text-[#2563EB] transition-colors">Data Privacy</Link>
              <Link href="#" className="text-sm font-semibold text-[#6B7280] hover:text-[#2563EB] transition-colors">Manifesto</Link>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[#E5E7EB] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} LinkVault. All Systems Operational.
          </p>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-[#111827]">Operational</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
