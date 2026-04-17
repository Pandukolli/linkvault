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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  return (
    <div className="min-h-full bg-[#F8FAFC] pb-32">

      {/* Header */}
      <div className="max-w-[1400px] mx-auto pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-[#E5E7EB] pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#2563EB]/5 border border-[#2563EB]/10 flex items-center justify-center">
                <Pen className="w-4 h-4 text-[#2563EB]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Editorial Studio</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-[#111827] tracking-tighter leading-none uppercase">
              Publications
            </h1>

            {/* Stats Row */}
            <div className="flex items-center gap-8 pt-2">
              {[
                { label: "Total", value: blogs.length },
                { label: "Draft", value: blogs.filter(b => b.status === "draft").length },
                { label: "Published", value: blogs.filter(b => b.status === "published").length },
              ].map((s) => (
                <div key={s.label} className="text-left">
                  <div className="text-2xl font-black text-[#111827]">{s.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">{s.label}</div>
                </div>
              ))}
              <div className="h-10 w-px bg-[#E5E7EB]" />
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-[#2563EB]" /> Private Access
              </div>
            </div>
          </div>

          <Button
            onClick={handleCreateBlog}
            disabled={createBlog.isPending}
            className="h-14 px-10 bg-[#F97316] text-white rounded-md font-bold text-sm shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-5 h-5" />
            {createBlog.isPending ? "Initializing..." : "New Publication"}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-6 mb-12">
          <div className="flex flex-wrap gap-1.5 p-1 bg-[#F1F5F9] border border-[#E5E7EB] rounded-md w-max">
            {(["all", "draft", "published"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 text-xs font-bold rounded-md transition-all uppercase tracking-wider ${
                  filter === f
                    ? "bg-white text-[#2563EB] shadow-sm border border-[#E5E7EB]"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {f} <span className="opacity-40 text-[10px] ml-1">[{blogs.filter(b => f === "all" || b.status === f).length}]</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md border transition-all ${
                  categoryFilter === cat
                    ? "bg-[#2563EB] border-[#2563EB] text-white"
                    : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-md bg-white border border-[#E5E7EB] animate-pulse" />
            ))
          ) : filteredBlogs.length === 0 ? (
            <div className="col-span-full py-48 flex flex-col items-center justify-center text-center rounded-md bg-white border border-[#E5E7EB]">
              <div className="w-20 h-20 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-[#9CA3AF]" />
              </div>
              <h3 className="text-2xl font-bold text-[#111827] mb-2 tracking-tight">No publications found</h3>
              <p className="text-sm text-[#6B7280] font-serif max-w-xs mb-8">
                Your editorial archive is empty. Start your first draft today.
              </p>
              <Button onClick={handleCreateBlog} className="bg-[#2563EB] text-white">
                Initialize Writing
              </Button>
            </div>
          ) : (
            filteredBlogs.map((blog, i) => {
              const meta = blog.content?.meta || {};
              const coverImage = meta.coverImage || null;
              const category: string = meta.category || "Uncategorized";
              const readingTime = meta.readingTime || "1";

              return (
                <div
                  key={blog.id}
                  className="group flex flex-col bg-white border border-[#E5E7EB] rounded-md overflow-hidden cursor-pointer hover:border-[#2563EB] hover:shadow-xl transition-all"
                  onClick={() => router.push(`/dashboard/blogs/${blog.id}`)}
                >
                  <div className="h-44 w-full bg-[#F8FAFC] relative overflow-hidden">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <FileEdit className="w-10 h-10 text-[#6B7280]" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md border backdrop-blur-md ${
                        blog.status === "published"
                          ? "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]"
                          : "bg-white/80 border-[#E5E7EB] text-[#6B7280]"
                      }`}>
                        {blog.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB] mb-2">
                      {category}
                    </span>

                    <h3 className="text-xl font-bold text-[#111827] tracking-tight leading-tight mb-4 group-hover:text-[#2563EB] transition-colors">
                      {blog.title || "Untitled"}
                    </h3>

                    <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4 mt-auto">
                      <div className="flex items-center gap-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(blog.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {readingTime} min
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 rounded-md flex items-center justify-center text-[#9CA3AF] hover:text-[#EF4444] hover:bg-red-50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({ id: blog.id, title: blog.title || "Untitled" });
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-8 h-8 rounded-md flex items-center justify-center text-[#9CA3AF] group-hover:text-[#2563EB] group-hover:bg-[#F1F5F9] transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md bg-white border border-[#E5E7EB] rounded-md shadow-2xl">
          <DialogHeader className="text-center items-center pb-2">
            <div className="w-16 h-16 rounded-md bg-red-50 border border-red-100 flex items-center justify-center mb-6">
              <AlertTriangle className="w-7 h-7 text-[#EF4444]" />
            </div>
            <DialogTitle className="text-xl font-bold text-[#111827] tracking-tight decoration-red-500">Delete Publication</DialogTitle>
            <DialogDescription className="text-sm text-[#6B7280] font-serif max-w-xs mx-auto mt-2">
              Are you sure you want to delete <span className="font-bold text-[#111827]">"{deleteTarget?.title}"</span>? This action is permanent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-6 border-t border-[#E5E7EB] mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#EF4444] text-white hover:bg-[#DC2626]"
              onClick={handleDeleteConfirm}
              disabled={deleteBlog.isPending}
            >
              {deleteBlog.isPending? "Deleting..." : "Delete Forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
