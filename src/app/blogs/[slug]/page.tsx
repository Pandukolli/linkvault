"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePublicBlog } from "@/hooks/use-blogs";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Link2, ArrowLeft, Share2, Heart, Lock, ExternalLink } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { BlogCategoryReader } from "@/components/blog-category-reader";

export default function PublicBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: blog, isLoading, error } = usePublicBlog(slug);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const [isAuthor, setIsAuthor] = useState<boolean | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 50) + 12);

  useEffect(() => {
    if (!blog) return;
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthor(!!user && user.id === (blog as any).user_id);
    };
    check();
  }, [blog]);

  // Loading
  if (isLoading || isAuthor === null) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 space-y-8">
        <Skeleton className="h-12 w-3/4 rounded-2xl" />
        <Skeleton className="h-4 w-1/4 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  // Not found
  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0B0F]">
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
          <Lock className="w-8 h-8 text-white/20" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-3">Not Found</h1>
        <p className="text-white/30 text-sm font-medium mb-8">This publication may have been removed or doesn't exist.</p>
        <Link href="/blog-diary" className="px-6 py-3 bg-[#06B6D4] text-black rounded-xl text-xs font-black uppercase tracking-widest">
          Browse Diary
        </Link>
      </div>
    );
  }

  // PRIVATE GATE — non-author sees lock screen
  if (!isAuthor) {
    return (
      <div className="min-h-screen bg-[#0A0B0F] flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-[#06B6D4]/5 border border-[#06B6D4]/10 flex items-center justify-center mb-8 mx-auto">
            <Lock className="w-10 h-10 text-[#06B6D4]/40" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#06B6D4]/60 mb-4">Private Publication</div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase">
            This blog is private
          </h1>
          <p className="text-white/30 text-sm font-medium leading-relaxed mb-10 max-w-xs mx-auto">
            This publication is only visible to its author. Discover other great writing in the Blog Diary.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/blog-diary" className="px-8 py-3 bg-[#06B6D4] text-black rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#06B6D4]/90 transition-all">
              Explore Blog Diary
            </Link>
            <Link href="/" className="px-8 py-3 bg-white/5 text-white border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Go Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // AUTHOR VIEW — category-specific premium reader
  const meta = (blog as any).content?.meta || {};
  const category = meta.category || "";

  // Determine nav/accent color based on category
  const NAV_THEMES: Record<string, { bg: string; text: string; border: string }> = {
    "Personal Essay":      { bg: "#fefdf8", text: "#6b4c1e", border: "rgba(180,140,80,0.15)" },
    "Technical Deep Dive": { bg: "#0d1117", text: "#8b949e",  border: "#30363d" },
    "Tutorial / How-to":   { bg: "#0891b2", text: "#ffffff",  border: "rgba(255,255,255,0.2)" },
    "Story / Narrative":   { bg: "#0a0a0a", text: "#8b8077",  border: "#2a2a2a" },
    "Review":              { bg: "#fafafa", text: "#64748b",  border: "#e2e8f0" },
    "Newsletter":          { bg: "#1e293b", text: "#94a3b8",  border: "#334155" },
    "Journal":             { bg: "#fefce8", text: "#92400e",  border: "#fde68a" },
  };
  const theme = NAV_THEMES[category] || { bg: "#fafafa", text: "#64748b", border: "#e2e8f0" };

  return (
    <>
      {/* Reading Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#06B6D4] origin-left z-50 shadow-md shadow-[#06B6D4]/30"
        style={{ scaleX }}
      />

      {/* Category-aware Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b h-14 flex items-center px-6 justify-between"
        style={{ background: `${theme.bg}e6`, borderColor: theme.border }}>
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-[#06B6D4] flex items-center justify-center shadow-sm">
            <Link2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          </div>
          <span className="text-xs font-black tracking-tighter uppercase" style={{ color: theme.text }}>vaultOS</span>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          {category && (
            <div className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.25em] border"
              style={{ color: theme.text, borderColor: theme.border, background: `${theme.bg}80` }}>
              {category}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/blogs/${(blog as any).id}`}
            className="flex items-center gap-2 h-8 px-4 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] text-[10px] font-black uppercase tracking-widest border border-[#06B6D4]/20 hover:bg-[#06B6D4]/20 transition-all"
          >
            <ExternalLink className="w-3 h-3" /> Edit
          </Link>
          <button
            onClick={() => {
              const url = window.location.href;
              navigator.share?.({ url, title: (blog as any).title }) || navigator.clipboard.writeText(url);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
            style={{ color: theme.text }}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-14" />

      {/* Category-specific reader */}
      <BlogCategoryReader
        title={(blog as any).title || "Untitled"}
        content={(blog as any).content}
        meta={meta}
        publishedAt={(blog as any).published_at || ""}
        updatedAt={(blog as any).updated_at}
      />

      {/* Engagement footer */}
      <div className="py-16 flex flex-col items-center border-t"
        style={{ borderColor: theme.border, background: theme.bg }}>
        <button
          onClick={() => { setIsLiked(!isLiked); setLikesCount(p => isLiked ? p - 1 : p + 1); }}
          className={`p-5 rounded-2xl flex flex-col items-center gap-1 shadow-lg transition-all duration-300 border ${
            isLiked ? "bg-[#06B6D4] text-white shadow-[#06B6D4]/30 border-[#06B6D4]" : "bg-white text-slate-300 hover:text-[#06B6D4] border-slate-100"
          }`}
        >
          <Heart className={`w-7 h-7 ${isLiked ? "fill-current" : ""}`} />
          <span className="text-[10px] font-black uppercase tracking-widest mt-0.5">{likesCount}</span>
        </button>
        <p className="text-sm font-medium text-slate-400 mt-5 mb-3">Enjoying this read?</p>
        <Link href="/blog-diary" className="text-[11px] font-black text-[#06B6D4] uppercase tracking-widest hover:underline">
          Discover more in Blog Diary →
        </Link>
      </div>
    </>
  );
}
