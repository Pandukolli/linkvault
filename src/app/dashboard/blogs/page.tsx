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
    <div className="min-h-full bg-background pb-32">

      {/* Header */}
      <div className="max-w-[1400px] mx-auto pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-border pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-primary/5 border border-primary/10 flex items-center justify-center">
                <Pen className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Editorial Studio</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-foreground tracking-tighter leading-none uppercase">
              Publications
            </h1>

            {/* Stats Row */}
            <div className="flex items-center gap-8 pt-2">
              {[
                { label: "Total", value: blogs.length },
                { label: "Drafts", value: blogs.filter(b => b.status === "draft").length },
                { label: "Public", value: blogs.filter(b => b.status === "published").length },
              ].map((s) => (
                <div key={s.label} className="text-left">
                  <div className="text-2xl font-black text-foreground">{s.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</div>
                </div>
              ))}
              <div className="h-10 w-px bg-border" />
              <div className="flex items-center gap-2 text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                <Lock className="w-3.5 h-3.5 text-primary" /> SECURE VAULT
              </div>
            </div>
          </div>

          <Button
            onClick={handleCreateBlog}
            disabled={createBlog.isPending}
            className="h-14 px-10 bg-accent text-accent-foreground rounded-lg font-black text-sm shadow-xl shadow-accent/20 transition-premium"
          >
            <Plus className="w-5 h-5" />
            {createBlog.isPending ? "INITIALIZING..." : "NEW PUBLICATION"}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-6 mb-12">
          <div className="flex flex-wrap gap-1.5 p-1 bg-secondary border border-border rounded-lg w-max shadow-inner">
            {(["all", "draft", "published"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 text-[10px] font-black rounded-md transition-premium uppercase tracking-widest ${
                  filter === f
                    ? "bg-surface text-primary shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                }`}
              >
                {f} <span className="opacity-40 text-[9px] ml-1">[{blogs.filter(b => f === "all" || b.status === f).length}]</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md border transition-premium ${
                  categoryFilter === cat
                    ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/10"
                    : "bg-surface border-border text-muted-foreground hover:border-primary hover:text-primary"
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
              <Skeleton key={i} className="h-80 rounded-xl bg-secondary animate-pulse" />
            ))
          ) : filteredBlogs.length === 0 ? (
            <div className="col-span-full py-48 flex flex-col items-center justify-center text-center rounded-2xl bg-surface border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 rounded-3xl bg-muted border border-border flex items-center justify-center mb-8 shadow-inner">
                <BookOpen className="w-10 h-10 text-muted-foreground opacity-40" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight uppercase">Editorial Void</h3>
              <p className="text-sm text-muted-foreground font-serif max-w-sm mx-auto mb-10 leading-relaxed px-6">
                Your editorial archive is currently empty. This sector of the vault is ready for its first publication.
              </p>
              <Button onClick={handleCreateBlog} className="h-12 px-10 bg-primary text-primary-foreground rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 transition-premium active:scale-95">
                Initialize Writing Cycle
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
                  className="group flex flex-col bg-surface border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-premium animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => router.push(`/dashboard/blogs/${blog.id}`)}
                >
                  <div className="h-44 w-full bg-secondary relative overflow-hidden">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-10">
                        <FileEdit className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border backdrop-blur-md shadow-sm ${
                        blog.status === "published"
                          ? "bg-success/10 border-success/20 text-success"
                          : "bg-surface/80 border-border text-muted-foreground"
                      }`}>
                        {blog.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-7 flex flex-col flex-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
                      {category}
                    </span>

                    <h3 className="text-xl font-black text-foreground tracking-tight leading-tight mb-5 group-hover:text-primary transition-colors">
                      {blog.title || "Untitled Record"}
                    </h3>

                    <div className="flex items-center justify-between border-t border-border pt-5 mt-auto">
                      <div className="flex items-center gap-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground/50" />
                          {new Date(blog.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
                          {readingTime} MIN
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({ id: blog.id, title: blog.title || "Untitled" });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-secondary transition-colors">
                          <ChevronRight className="w-5 h-5" />
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
        <DialogContent className="sm:max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-0 overflow-hidden">
          <div className="p-8">
            <DialogHeader className="text-center items-center pb-2">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-8 shadow-inner">
                <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
              </div>
              <DialogTitle className="text-2xl font-black text-foreground tracking-tight uppercase">Erase Publication</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground font-serif max-w-xs mx-auto mt-4 leading-relaxed">
                Confirming the permanent erasure of <span className="font-black text-foreground">"{deleteTarget?.title}"</span> from the vault archives. This cannot be undone.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="flex gap-3 px-8 py-5 bg-secondary border-t border-border">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl font-bold border-border hover:bg-surface"
              onClick={() => setDeleteTarget(null)}
            >
              CANCEL
            </Button>
            <Button
              className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold shadow-lg shadow-destructive/10"
              onClick={handleDeleteConfirm}
              disabled={deleteBlog.isPending}
            >
              {deleteBlog.isPending? "ERASING..." : "ERASE FOREVER"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
