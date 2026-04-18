"use client";

import { useState, useMemo } from "react";
import { usePublicBlogs } from "@/hooks/use-blogs";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, Clock, Calendar, Hash, BookOpen, Rss,
  Filter, Globe, ArrowRight, ChevronDown, Sparkles, Link2
} from "lucide-react";

const CATEGORIES = ["All", "Personal Essay", "Technical Deep Dive", "Tutorial / How-to", "Story / Narrative", "Review", "Newsletter", "Journal"];

export default function BlogDiaryPage() {
  const router = useRouter();
  const { data: blogs = [], isLoading } = usePublicBlogs();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = useMemo(() => {
    return blogs.filter((b) => {
      const meta = (b as any).content?.meta || {};
      const searchMatch =
        !search ||
        (b.title?.toLowerCase().includes(search.toLowerCase()) ||
         (meta.excerpt || b.seo_description || "").toLowerCase().includes(search.toLowerCase()) ||
         (meta.authorName || "").toLowerCase().includes(search.toLowerCase()));
      const catMatch =
        selectedCategory === "All" || meta.category === selectedCategory;
      return searchMatch && catMatch;
    });
  }, [blogs, search, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB] h-16 flex items-center px-8 justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo size={28} showText={true} />
        </Link>
        <Link
          href="/dashboard/blogs"
          className="flex items-center gap-2 h-10 px-5 rounded-md bg-[#2563EB] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#1D4ED8] transition-all shadow-lg shadow-blue-500/10"
        >
          <Rss className="w-3.5 h-3.5" /> Start Publishing
        </Link>
      </nav>

      {/* Hero */}
      <div className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#2563EB]/5 border border-[#2563EB]/10">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2563EB]">Open Archive</span>
            </div>
          </div>

          <h1 className="text-7xl md:text-8xl font-black text-[#111827] tracking-tighter leading-none mb-8 uppercase">
            Blog
            <br />
            <span className="text-[#2563EB]">Diary</span>
          </h1>
          <p className="text-[#6B7280] text-xl font-serif italic max-w-2xl mx-auto leading-relaxed">
            A premium collective of architectural thoughts, development journals, and high-fidelity stories from the community.
          </p>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-12 mt-12 py-8 bg-white border border-[#E5E7EB] rounded-md shadow-sm max-w-2xl mx-auto">
            {[
              { label: "Publications", value: blogs.length },
              { label: "Authors", value: [...new Set(blogs.map((b: any) => b.user_id))].length },
              { label: "Archive Nodes", value: CATEGORIES.length - 1 },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-black text-[#111827]">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Filter & Search Index */}
      <div className="px-6 max-w-6xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#9CA3AF]" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Query the public index..."
                    className="w-full h-14 pl-14 pr-6 bg-white border border-[#E5E7EB] rounded-md text-[#111827] placeholder:text-[#9CA3AF] text-sm font-semibold outline-none focus:border-[#2563EB] transition-all shadow-sm"
                />
            </div>
            <div className="flex flex-wrap gap-2 items-center md:max-w-md">
                {CATEGORIES.slice(0, 4).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all ${
                            selectedCategory === cat
                            ? "bg-[#111827] border-[#111827] text-white"
                            : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB]"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="px-6 max-w-7xl mx-auto pb-40">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-md bg-white border border-[#E5E7EB]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-40 text-center rounded-md border border-dashed border-[#E5E7EB] bg-white">
            <BookOpen className="w-16 h-16 text-[#E5E7EB] mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-[#9CA3AF] tracking-tight mb-2 uppercase">Index Empty</h3>
            <p className="text-sm text-[#6B7280] font-serif max-w-xs mx-auto mb-10">No public transmissions detected under this query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((blog, i) => {
              const meta = (blog as any).content?.meta || {};
              const coverImage = meta.coverImage || null;
              const excerpt = meta.excerpt || blog.seo_description || "An editorial artifact from the VaultOS archive.";
              const authorName: string = meta.authorName || "Archivist";

              return (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white border border-[#E5E7EB] rounded-md overflow-hidden hover:border-[#F97316] hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-500 cursor-pointer flex flex-col h-full"
                  onClick={() => router.push(`/blogs/${blog.slug}`)}
                >
                  {/* Cover */}
                  <div className="h-56 w-full bg-[#F8FAFC] relative overflow-hidden border-b border-[#E5E7EB]">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt=""
                        className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-[#E5E7EB]" />
                      </div>
                    )}
                    {meta.category && (
                        <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-md border border-[#E5E7EB] text-[#111827] text-[9px] font-bold uppercase tracking-widest rounded-md">
                                {meta.category}
                            </span>
                        </div>
                    )}
                  </div>

                  {/* Detail */}
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-5">
                       <div className="w-6 h-6 rounded-md bg-[#F1F5F9] border border-[#E5E7EB] flex items-center justify-center text-[10px] font-bold text-[#2563EB]">
                          {authorName[0]}
                       </div>
                       <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">{authorName}</span>
                       <span className="text-[10px] font-bold text-[#E5E7EB]">•</span>
                       <span className="text-[9px] font-bold text-[#9CA3AF] uppercase">{new Date((blog as any).published_at || blog.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>

                    <h3 className="text-2xl font-bold text-[#111827] uppercase tracking-tight leading-tight mb-4 group-hover:text-[#2563EB] transition-colors">
                      {blog.title || "Untitled Transmission"}
                    </h3>

                    <p className="text-sm font-serif italic text-[#6B7280] line-clamp-3 leading-relaxed mb-8 flex-1">
                      {excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-[#F1F5F9]">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5" /> {meta.readingTime || "3"} MIN READ
                        </div>
                        <div className="flex items-center gap-1.5 text-[#2563EB] text-[10px] font-bold uppercase tracking-wider transition-transform group-hover:translate-x-1">
                            Access <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
