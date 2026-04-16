"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBlogs } from "@/hooks/use-blogs";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus, Clock, FileEdit, Trash2, Calendar,
  AlertTriangle, Lock, BookOpen, Pen, Globe,
  Hash, Tag, ChevronRight
} from "lucide-react";

const CATEGORIES = ["All", "Personal Essay", "Technical Deep Dive", "Tutorial / How-to", "Story / Narrative", "Review", "Newsletter", "Journal"];

export default function BlogsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const { blogs, isLoading, createBlog, deleteBlog } = useBlogs();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const filteredBlogs = blogs.filter((b) => {
    const statusMatch = filter === "all" || b.status === filter;
    const cat = b.content?.meta?.category;
    const catMatch = categoryFilter === "All" || cat === categoryFilter;
    return statusMatch && catMatch;
  });

  const handleCreateBlog = () => {
    createBlog.mutate(
      { title: "Untitled" },
      { onSuccess: (data) => router.push(`/dashboard/blogs/${data.id}`) }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteBlog.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: () => setDeleteTarget(null),
    });
  };

  const totalWords = blogs.reduce((acc, b) => {
    const text = b.content?.meta?.wordCount || 0;
    return acc + text;
  }, 0);

  return (
    <div className="min-h-full bg-[#0A0B0F] px-6 md:px-12 py-12 pb-32">

      {/* Header */}
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center">
                <Pen className="w-4 h-4 text-[#06B6D4]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#06B6D4]">Editorial Studio</span>
            </div>
            <h1 className="text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none">
              PUBLICATIONS
              <span className="block text-[#06B6D4] text-2xl font-black tracking-[0.2em] mt-1">
                PRIVATE VAULT
              </span>
            </h1>

            {/* Stats Row */}
            <div className="flex items-center gap-6 pt-2">
              {[
                { label: "Total", value: blogs.length },
                { label: "Draft", value: blogs.filter(b => b.status === "draft").length },
                { label: "Published", value: blogs.filter(b => b.status === "published").length },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">{s.label}</div>
                </div>
              ))}
              <div className="h-8 w-px bg-white/5" />
              <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
                <Lock className="w-3 h-3 text-[#06B6D4]" /> Author-only access
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCreateBlog}
            disabled={createBlog.isPending}
            className="flex items-center gap-3 h-14 px-10 bg-[#06B6D4] text-black rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-2xl shadow-[#06B6D4]/20 disabled:opacity-50"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            {createBlog.isPending ? "Creating..." : "New Blog"}
          </motion.button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex gap-1.5 p-1.5 bg-[#14151B] rounded-2xl border border-white/5">
            {(["all", "draft", "published"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 text-[10px] font-black rounded-xl transition-all duration-500 uppercase tracking-widest ${
                  filter === f
                    ? "bg-[#06B6D4] text-black"
                    : "text-white/30 hover:text-white"
                }`}
              >
                {f} <span className="opacity-40 ml-1">[{blogs.filter(b => f === "all" || b.status === f).length}]</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border transition-all duration-300 ${
                categoryFilter === cat
                  ? "bg-white/10 border-white/20 text-white"
                  : "border-white/5 text-white/20 hover:border-white/10 hover:text-white/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-3xl bg-white/5 animate-pulse" />
            ))
          ) : filteredBlogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full py-48 flex flex-col items-center justify-center text-center rounded-3xl bg-[#0D0E14] border border-white/5"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-[#06B6D4]/5 border border-[#06B6D4]/10 flex items-center justify-center mb-8">
                <BookOpen className="w-8 h-8 text-[#06B6D4]/40" />
              </div>
              <h3 className="text-3xl font-black text-white/20 mb-3 tracking-tighter uppercase">No blogs yet</h3>
              <p className="text-[11px] text-white/10 font-black max-w-xs mb-10 uppercase tracking-[0.3em]">
                Your editorial vault is empty. Create your first blog.
              </p>
              <button
                onClick={handleCreateBlog}
                className="h-12 px-8 bg-[#06B6D4] text-black rounded-xl font-black text-[10px] uppercase tracking-widest"
              >
                Start Writing
              </button>
            </motion.div>
          ) : (
            filteredBlogs.map((blog, i) => {
              const meta = blog.content?.meta || {};
              const coverImage = meta.coverImage || null;
              const excerpt = meta.excerpt || blog.seo_description || "No excerpt — open to read the full content.";
              const readingTime = meta.readingTime || "1";
              const wordCount = meta.wordCount || 0;
              const tags: string[] = meta.tags || [];
              const category: string = meta.category || "";

              return (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group relative bg-[#0D0E14] border border-white/5 rounded-3xl flex flex-col cursor-pointer overflow-hidden transition-all duration-500 hover:border-[#06B6D4]/20 hover:shadow-2xl hover:shadow-[#06B6D4]/5"
                  onClick={() => router.push(`/dashboard/blogs/${blog.id}`)}
                >
                  {/* Cover Image */}
                  <div className="h-44 w-full bg-[#1F2129] relative flex-shrink-0 overflow-hidden">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={blog.title || "Cover"}
                        className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileEdit className="w-8 h-8 text-white/5 group-hover:text-white/10 transition-colors" />
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E14] via-transparent to-transparent" />

                    {/* Status + Privacy */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <div className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border backdrop-blur-xl ${
                        blog.status === "published"
                          ? "bg-[#06B6D4]/20 border-[#06B6D4]/30 text-[#06B6D4]"
                          : "bg-black/40 border-white/10 text-white/40"
                      }`}>
                        {blog.status}
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xl border border-white/5 text-[9px] font-black text-white/30 uppercase tracking-wider">
                        <Lock className="w-2.5 h-2.5" /> Private
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Category */}
                    {category && (
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#06B6D4]/60 mb-3">
                        {category}
                      </span>
                    )}

                    <h3 className="text-lg font-black text-white uppercase tracking-tight line-clamp-2 leading-tight mb-3 group-hover:text-[#06B6D4] transition-colors duration-300">
                      {blog.title || "Untitled Blog"}
                    </h3>

                    <p className="text-xs font-medium text-white/30 line-clamp-2 mb-5 flex-1 leading-relaxed">
                      {excerpt}
                    </p>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {tags.slice(0, 3).map((t: string) => t && (
                          <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-wider text-white/30">
                            <Hash className="w-2 h-2" />{t}
                          </span>
                        ))}
                        {tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-white/5 rounded-full text-[8px] font-black text-white/20">+{tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                      <div className="flex items-center gap-3 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(blog.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {readingTime} min
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white/10 hover:text-red-400 transition-all bg-white/5 hover:bg-red-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({ id: blog.id, title: blog.title || "Untitled" });
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[#06B6D4]/40 group-hover:text-[#06B6D4] transition-all bg-[#06B6D4]/5 group-hover:bg-[#06B6D4]/10">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-[#14151B] border-white/10 shadow-2xl text-white">
          <DialogHeader className="text-center items-center pb-2">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-white">Erase Publication</DialogTitle>
            <DialogDescription className="text-sm text-white/40 font-medium max-w-xs mx-auto">
              Permanently delete{" "}
              <span className="font-bold text-white">"{deleteTarget?.title}"</span>?
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:flex-row pt-4">
            <button
              className="flex-1 h-12 rounded-xl border border-white/10 text-white/60 font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              className="flex-1 h-12 rounded-xl bg-red-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              onClick={handleDeleteConfirm}
              disabled={deleteBlog.isPending}
            >
              <Trash2 className="w-4 h-4" />
              {deleteBlog.isPending ? "Deleting..." : "Delete Forever"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
