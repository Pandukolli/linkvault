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
    <div className="max-w-[1500px] mx-auto px-6 md:px-12 py-12 pb-24 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
        <div className="space-y-4">
          <h1 className="text-7xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
            Publications
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
            Advanced Editorial & Broadcasting Center
          </p>
        </div>
        <Button
          className="h-14 px-10 gap-3 bg-white text-black hover:bg-white/90 rounded-2xl font-black transition-all duration-300 shadow-2xl shadow-white/10 hover:-translate-y-1 uppercase tracking-tighter"
          onClick={handleCreateBlog}
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          New Publication
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-12 p-1.5 bg-[#080808] rounded-2xl w-fit border border-white/5 shadow-2xl">
        {(["all", "draft", "published"] as const).map((f) => (
          <button
            key={f}
            className={`px-8 py-3 text-[10px] font-black rounded-xl transition-all duration-700 uppercase tracking-widest ${
              filter === f
                ? "bg-white text-black"
                : "text-white/20 hover:text-white"
            }`}
            onClick={() => setFilter(f)}
          >
            {f} <span className="opacity-30 ml-2">[{blogs.filter((b) => f === "all" || b.status === f).length}]</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-[2.5rem] bg-white/5 animate-pulse" />
          ))
        ) : filteredBlogs.length === 0 ? (
          <div className="col-span-full py-40 flex flex-col items-center justify-center text-center rounded-[3rem] bg-[#050505] border border-white/5">
            <h3 className="text-4xl font-black text-white/50 mb-4 tracking-tighter uppercase">No Records Found</h3>
            <p className="text-[11px] text-white/10 font-black max-w-sm mx-auto mb-10 uppercase tracking-[0.3em] leading-relaxed">
              Initiate your first archival string to populate the grid.
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
                className="group relative overflow-hidden bg-[#050505] border border-white/5 rounded-[2.5rem] flex flex-col cursor-pointer transition-all duration-700 hover:scale-[1.01] hover:border-white/10 min-h-[400px]"
                onClick={() => {
                  if (blog.status === "published") router.push(`/blogs/${blog.slug}`);
                  else router.push(`/dashboard/blogs/${blog.id}`);
                }}
              >
                {/* Image Area */}
                <div className="h-48 w-full bg-white/5 relative overflow-hidden flex-shrink-0">
                  {coverImage ? (
                    <img src={coverImage} alt={blog.title || "Cover"} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileEdit className="w-10 h-10 text-white/10 group-hover:text-white transition-colors" />
                    </div>
                  )}
                  {/* Status Tag */}
                  <div className="absolute top-6 left-6 z-10">
                    <Badge 
                      variant="secondary" 
                      className={`text-[9px] font-black uppercase tracking-widest border-none px-4 py-1.5 backdrop-blur-2xl shadow-2xl ${
                        blog.status === "published"
                          ? "bg-white text-black"
                          : "bg-black/60 text-white border border-white/5"
                      }`}
                    >
                      {blog.status}
                    </Badge>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 mb-6 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                    <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {new Date(blog.updated_at).toLocaleDateString()}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10"/>
                    <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {readingTime} read</span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter line-clamp-2 leading-tight mb-4 group-hover:text-white transition-colors">
                    {blog.title || "Untyped Content"}
                  </h3>
                  
                  <p className="text-sm font-medium text-white/40 line-clamp-2 mb-8 flex-1 leading-relaxed">
                    {excerpt}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-auto">
                    {blog.slug ? (
                      <div className="flex items-center gap-2 text-[10px] font-black font-mono text-white/20 truncate max-w-[200px] uppercase">
                        <Globe className="w-3 h-3" />
                        /{blog.slug}
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Draft Archival</span>
                    )}
                    
                    <button
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white/10 hover:text-white transition-all bg-white/5 hover:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDeleteTarget({ id: blog.id, title: blog.title || "Untitled" });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
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
