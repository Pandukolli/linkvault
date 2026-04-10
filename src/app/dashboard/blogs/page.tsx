"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBlogs } from "@/hooks/use-blogs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PenLine,
  Plus,
  Clock,
  Globe,
  FileEdit,
  Eye,
  Trash2,
  Calendar,
  MoreVertical,
  AlertTriangle
} from "lucide-react";

export default function BlogsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");
  const { blogs, isLoading, createBlog, deleteBlog } = useBlogs();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const filteredBlogs = blogs.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  const handleCreateBlog = () => {
    createBlog.mutate(
      { title: "Untitled Protocol" },
      {
        onSuccess: (data) => {
          router.push(`/dashboard/blogs/${data.id}`);
        },
      }
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
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-24 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-fade-in-up" style={{ animationDuration: "0.6s" }}>
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter uppercase flex items-center gap-5">
            <div className="w-14 h-14 rounded-[1.5rem] bg-primary/5 flex items-center justify-center">
              <PenLine className="w-8 h-8 text-primary" />
            </div>
            Publications
          </h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] mt-4 opacity-70">
            Advanced Editorial &amp; Broadcasting Center
          </p>
        </div>
        <Button
          className="h-14 px-10 gap-3 bg-black hover:bg-primary text-white rounded-2xl font-black transition-all duration-300 shadow-2xl shadow-black/10 hover:shadow-primary/30 hover:-translate-y-1 uppercase tracking-tighter"
          onClick={handleCreateBlog}
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          New Publication
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-10 p-2 bg-slate-50/80 backdrop-blur-xl rounded-[1.5rem] w-fit border border-slate-100 animate-fade-in-up" style={{ animationDuration: "0.8s" }}>
        {(["all", "draft", "published"] as const).map((f) => (
          <button
            key={f}
            className={`px-6 py-3 text-[10px] font-black rounded-xl transition-all duration-300 uppercase tracking-widest ${
              filter === f
                ? "bg-white text-black shadow-xl shadow-black/5"
                : "text-slate-400 hover:text-black hover:bg-white/40"
            }`}
            onClick={() => setFilter(f)}
          >
            {f} <span className="opacity-40 ml-2">[{blogs.filter((b) => f === "all" || b.status === f).length}]</span>
          </button>
        ))}
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDuration: "1s" }}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-[2rem] bg-slate-50" />
          ))
        ) : filteredBlogs.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center rounded-[3rem] bg-transparent border border-slate-100/50">
            <h3 className="text-3xl font-black text-slate-300 mb-3 tracking-tighter uppercase">No Records Found</h3>
            <p className="text-sm text-slate-400 font-bold max-w-sm mx-auto mb-10 uppercase tracking-[0.2em] leading-relaxed">
              Initiate your first archival string.
            </p>
          </div>
        ) : (
          filteredBlogs.map((blog) => {
            const meta = blog.content?.meta || {};
            const coverImage = meta.coverImage || null;
            const excerpt = meta.excerpt || blog.seo_description || "No excerpt available. Open to view contents.";
            const readingTime = meta.readingTime || "1 min";

            return (
              <div
                key={blog.id}
                className="group relative overflow-hidden bg-white border border-slate-100 rounded-[2rem] flex flex-col cursor-pointer shadow-2xl shadow-primary/[0.02] hover:shadow-primary/[0.08] hover:-translate-y-2 hover:border-primary/20 transition-all duration-500 min-h-[340px]"
                onClick={() => {
                  if (blog.status === "published") {
                    router.push(`/blogs/${blog.slug}`);
                  } else {
                    router.push(`/dashboard/blogs/${blog.id}`);
                  }
                }}
              >
                {/* Image Area */}
                <div className="h-40 w-full bg-slate-50 relative overflow-hidden flex-shrink-0">
                  {coverImage ? (
                    <img src={coverImage} alt={blog.title || "Cover"} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
                      <FileEdit className="w-8 h-8 text-slate-200" />
                    </div>
                  )}
                  {/* Status Tag */}
                  <div className="absolute top-4 left-4 z-10">
                    <Badge 
                      variant="secondary" 
                      className={`text-[9px] font-black uppercase tracking-widest border-none px-3 py-1 backdrop-blur-md shadow-lg ${
                        blog.status === "published"
                          ? "bg-emerald-500/90 text-white"
                          : "bg-black/80 text-white"
                      }`}
                    >
                      {blog.status}
                    </Badge>
                  </div>
                  {/* Overlay shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-1 relative z-10 bg-white">
                  <div className="flex items-center gap-3 mb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(blog.updated_at).toLocaleDateString()}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200"/>
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {readingTime} read</span>
                  </div>
                  
                  <h3 className="text-xl font-black text-black uppercase tracking-tight line-clamp-2 leading-tight mb-3 group-hover:text-primary transition-colors duration-300">
                    {blog.title || "Untyped Content"}
                  </h3>
                  
                  <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-6 flex-1">
                    {excerpt}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                    {blog.slug ? (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400 truncate max-w-[200px]">
                        <Globe className="w-3 h-3" />
                        /{blog.slug}
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-300">Draft</span>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setDeleteTarget({ id: blog.id, title: blog.title || "Untitled" });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 z-20" />
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-slate-100 shadow-2xl">
          <DialogHeader className="text-center items-center pb-2">
            <div className="w-16 h-16 rounded-[1.5rem] bg-red-50 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              Erase Publication
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-black">&quot;{deleteTarget?.title}&quot;</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:flex-row pt-4">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-red-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-red-500/20 hover:bg-red-600 gap-2"
              onClick={handleDeleteConfirm}
              disabled={deleteBlog.isPending}
            >
              <Trash2 className="w-4 h-4" />
              {deleteBlog.isPending ? "Deleting..." : "Delete Forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
