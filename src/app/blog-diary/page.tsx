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
  const [showCategories, setShowCategories] = useState(false);

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
    <div className="min-h-screen bg-[#0A0B0F]">

      {/* Fixed Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0B0F]/90 backdrop-blur-xl border-b border-white/5 h-14 flex items-center px-6 justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#06B6D4] flex items-center justify-center">
            <Link2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          </div>
          <span className="text-xs font-black text-white uppercase tracking-tighter">vaultOS</span>
        </Link>
        <Link
          href="/dashboard/blogs"
          className="flex items-center gap-2 h-8 px-4 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] text-[10px] font-black uppercase tracking-widest border border-[#06B6D4]/20 hover:bg-[#06B6D4]/20 transition-all"
        >
          <Rss className="w-3 h-3" /> My Blogs
        </Link>
      </nav>

      {/* Hero */}
      <div className="pt-28 pb-20 px-6 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-[#06B6D4]/30" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#06B6D4]">Community Feed</span>
            </div>
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-[#06B6D4]/30" />
          </div>

          <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
            BLOG
            <br />
            <span className="text-[#06B6D4]">DIARY</span>
          </h1>
          <p className="text-white/40 text-lg font-medium max-w-xl mx-auto leading-relaxed">
            Discover voices from the vault. Published stories, essays, and deep-dives from every corner of the community.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-10">
            {[
              { label: "Publications", value: blogs.length },
              { label: "Authors", value: [...new Set(blogs.map((b: any) => b.user_id))].length },
              { label: "Categories", value: CATEGORIES.length - 1 },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-white">{s.value}</div>
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Search + Filters */}
      <div className="px-6 max-w-5xl mx-auto mb-12">
        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or topic..."
            className="w-full h-14 pl-14 pr-6 bg-[#0D0E14] border border-white/5 rounded-2xl text-white placeholder:text-white/15 text-sm font-medium outline-none focus:border-[#06B6D4]/30 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white text-lg">×</button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-white/20 uppercase tracking-widest mr-2">
            <Filter className="w-3 h-3" /> Filter
          </div>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-[#06B6D4] border-[#06B6D4] text-black"
                  : "border-white/5 text-white/25 hover:border-white/15 hover:text-white/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="px-6 max-w-6xl mx-auto pb-32">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-3xl bg-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-40 text-center"
          >
            <BookOpen className="w-16 h-16 text-white/10 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-white/20 uppercase tracking-tighter mb-3">
              {search ? "No matches found" : "No published blogs yet"}
            </h3>
            <p className="text-[11px] text-white/10 font-black uppercase tracking-[0.3em] max-w-xs mx-auto">
              {search ? "Try a different search term or category" : "Be the first to publish a blog from your dashboard"}
            </p>
            {!search && (
              <Link href="/dashboard/blogs" className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-[#06B6D4] text-black rounded-xl text-[11px] font-black uppercase tracking-widest">
                Start Writing
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                {filtered.length} publication{filtered.length !== 1 ? "s" : ""}
                {selectedCategory !== "All" && <span> in <span className="text-[#06B6D4]">{selectedCategory}</span></span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((blog, i) => {
                const meta = (blog as any).content?.meta || {};
                const coverImage = meta.coverImage || null;
                const excerpt = meta.excerpt || blog.seo_description || "A thoughtful piece by this author.";
                const readingTime = meta.readingTime || "3";
                const tags: string[] = meta.tags || [];
                const category: string = meta.category || "";
                const authorName: string = meta.authorName || "vaultOS Author";
                const authorAvatar: string = meta.authorAvatar || "";

                return (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative bg-[#0D0E14] border border-white/5 rounded-3xl flex flex-col overflow-hidden cursor-pointer transition-all duration-500 hover:border-[#06B6D4]/20 hover:shadow-2xl hover:shadow-[#06B6D4]/5 hover:-translate-y-1"
                    onClick={() => router.push(`/blogs/${blog.slug}`)}
                  >
                    {/* Cover */}
                    <div className="h-48 w-full bg-[#1F2129] relative overflow-hidden flex-shrink-0">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={blog.title || "Blog cover"}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-white/5 group-hover:text-white/10 transition-colors" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E14] via-transparent to-transparent" />

                      {/* Category badge */}
                      {category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-[#06B6D4]/20 border border-[#06B6D4]/30 backdrop-blur-xl text-[#06B6D4] text-[9px] font-black uppercase tracking-widest rounded-full">
                            {category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Author */}
                      <div className="flex items-center gap-2.5 mb-4">
                        {authorAvatar ? (
                          <img src={authorAvatar} className="w-7 h-7 rounded-full object-cover border border-white/10 flex-shrink-0" alt={authorName} />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex-shrink-0 flex items-center justify-center">
                            <span className="text-[#06B6D4] text-[9px] font-black">{authorName[0]?.toUpperCase()}</span>
                          </div>
                        )}
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">{authorName}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[9px] font-bold text-white/20">{new Date((blog as any).published_at || blog.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>

                      <h3 className="text-base font-black text-white uppercase tracking-tight line-clamp-2 leading-tight mb-3 group-hover:text-[#06B6D4] transition-colors duration-300">
                        {blog.title || "Untitled"}
                      </h3>

                      <p className="text-xs font-medium text-white/30 line-clamp-3 mb-4 flex-1 leading-relaxed">
                        {excerpt}
                      </p>

                      {/* Tags */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {tags.slice(0, 2).map((t: string) => t && (
                            <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-wider text-white/25">
                              <Hash className="w-2 h-2" />{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                        <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                          <Clock className="w-3 h-3" /> {readingTime} min read
                        </div>
                        <div className="flex items-center gap-1.5 text-[#06B6D4]/40 group-hover:text-[#06B6D4] transition-colors text-[10px] font-black uppercase tracking-wider">
                          Read <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
