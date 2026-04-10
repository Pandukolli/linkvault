"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePublicBlog } from "@/hooks/use-blogs";
import { TiptapEditor } from "@/components/tiptap-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Link2, ArrowLeft, Send, Share2, Heart, List as ListIcon, Edit3, Lock, ShieldCheck } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PublicBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: blog, isLoading, error } = usePublicBlog(slug);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const [headings, setHeadings] = useState<{ id: string, text: string, level: number }[]>([]);
  const [activeId, setActiveId] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 50) + 12);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    { id: 1, author: "Elena Vance", text: "Truly illuminating perspective on digital archives.", date: "2 days ago" },
    { id: 2, author: "Mark Scout", text: "The architectural depth here is profound.", date: "1 day ago" }
  ]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editPasswordInput, setEditPasswordInput] = useState("");

  useEffect(() => {
    if (!blog) return;
    
    // Slight delay to ensure content is fully rendered before scanning DOM
    const timer = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll('.prose h1, .prose h2, .prose h3'));
      const parsed = elements.map(el => {
        // give it an ID if it doesn't have one
        if (!el.id) el.id = el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'section';
        return {
          id: el.id,
          text: el.textContent || "",
          level: Number(el.tagName.replace('H', ''))
        };
      });
      setHeadings(parsed);
    }, 500);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    const elements = document.querySelectorAll('.prose h1, .prose h2, .prose h3');
    elements.forEach((el) => observer.observe(el));

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [blog]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 space-y-8">
        <Skeleton className="h-12 w-3/4 rounded-2xl" />
        <Skeleton className="h-4 w-1/4 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-[2rem]" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Publication Not Found</h1>
        <p className="text-slate-400 mt-4 font-bold">This document may have been archived or removed.</p>
        <Link href="/" className="mt-8 px-6 py-3 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  const meta = blog.content?.meta || {};

  return (
    <>
    <div className="min-h-screen bg-[#fafafa] selection:bg-primary/20">
      {/* Dynamic Reading Progress */}
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-primary origin-left z-50 shadow-md shadow-primary/20" style={{ scaleX }} />

      {/* Clean Premium Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#fafafa]/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm shadow-primary/20">
              <Link2 className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <span className="text-sm font-black tracking-tighter text-black uppercase">LinkVault</span>
          </Link>
          <div className="flex gap-2">
            <button 
              onClick={() => { setEditPasswordInput(""); setShowEditDialog(true); }}
              className="h-9 px-4 flex items-center justify-center gap-2 rounded-xl bg-black/5 hover:bg-black hover:text-white transition-all duration-300 text-[10px] font-black uppercase tracking-widest text-slate-500"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-black">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-32 px-6">
        <article className="max-w-3xl mx-auto relative">

          {/* Metadata */}
          <div className="mb-12">
            {meta.tags && meta.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {meta.tags.map((t: string) => t && (
                  <span key={t} className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            )}
            
            <h1 className="text-5xl md:text-6xl lg:text-[5rem] font-black text-black tracking-tighter leading-[0.95] uppercase mb-8">
              {blog.title}
            </h1>

            <div className="flex items-center justify-between border-y border-slate-200 py-6 mb-16">
              <div className="flex items-center gap-4">
                {meta.authorAvatar ? (
                  <img src={meta.authorAvatar} className="w-14 h-14 rounded-full border border-slate-200 object-cover shadow-sm" alt="Author" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-200 border border-slate-300" />
                )}
                <div>
                  <div className="text-xs font-black text-black uppercase tracking-widest">
                    {meta.authorName || "LinkVault Author"}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {meta.category || "Architectural Documentation"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-black uppercase tracking-widest">
                  {new Date(blog.published_at || blog.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {meta.readingTime || "3"} min read
                </div>
              </div>
            </div>
          </div>

          {/* Cover */}
          {meta.coverImage && (
            <div className="w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl shadow-black/5 relative group">
              <img src={meta.coverImage} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" alt="Cover" />
              <div className="absolute inset-0 border border-black/5 rounded-[2.5rem] pointer-events-none" />
            </div>
          )}

          {/* Layout Grid for TOC + Content */}
          <div className="flex gap-16 relative">
            {/* Content (Render-only mode) */}
            <div className="prose prose-lg md:prose-xl prose-slate max-w-[800px] flex-1 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:font-medium prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-3xl prose-img:shadow-xl">
              <TiptapEditor content={blog.content} editable={false} />
            </div>

            {/* Floating Table of Contents */}
            <div className="hidden xl:block w-64 flex-shrink-0">
              <div className="sticky top-32">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-6">
                  <ListIcon className="w-3 h-3" /> Outline
                </h4>
                <div className="flex flex-col gap-3">
                  {headings.map((h: any, i: number) => (
                    <a 
                      key={i} 
                      href={`#${h.id}`}
                      className={`text-xs font-bold transition-colors block truncate ${
                        activeId === h.id ? 'text-primary' : 'text-slate-400 hover:text-black'
                      } ${h.level === 3 ? 'ml-4' : h.level === 2 ? 'ml-2' : ''}`}
                    >
                      {h.text}
                    </a>
                  ))}
                  {headings.length === 0 && <span className="text-xs text-slate-300 font-medium italic">No headings identified</span>}
                </div>
              </div>
            </div>
          </div>

          {/* About Author Section */}
          {(meta.authorName || meta.authorBio) && (
            <div className="mt-24 p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-primary/5 flex flex-col md:flex-row gap-8 items-start">
              {meta.authorAvatar && (
                <img src={meta.authorAvatar} className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-slate-50" alt="Author" />
              )}
              <div className="flex-1">
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">About the Creator</div>
                <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-4">{meta.authorName || "LinkVault Author"}</h3>
                {meta.authorBio && (
                   <p className="text-sm font-medium text-slate-500 leading-relaxed italic border-l-2 border-primary/20 pl-4">{meta.authorBio}</p>
                )}
              </div>
            </div>
          )}

          <div className="mt-24 pt-12 border-t border-slate-200">
             <div className="flex flex-col items-center justify-center mb-16">
               <button 
                onClick={() => {
                  setIsLiked(!isLiked);
                  setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
                }}
                className={`w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center gap-1 transition-all duration-500 shadow-xl group ${
                  isLiked ? 'bg-primary text-white shadow-primary/30' : 'bg-white text-slate-300 hover:text-primary hover:border-primary/20 border border-slate-100 hover:shadow-primary/5'
                }`}
               >
                 <Heart className={`w-8 h-8 ${isLiked ? 'fill-current' : 'group-hover:scale-110 transition-transform'}`} />
                 <span className={`text-[10px] font-black uppercase tracking-widest ${isLiked ? 'text-white' : 'text-slate-400'}`}>{likesCount}</span>
               </button>
               <h3 className="text-2xl font-black uppercase tracking-tight mt-6 mb-2">Engage with this publication</h3>
               <p className="text-sm font-medium text-slate-500 mb-8 max-w-md text-center">Appreciate the research? Leave a like and join the discourse below.</p>
             </div>

             {/* Comments Section */}
             <div className="max-w-2xl mx-auto">
               <div className="flex items-center justify-between mb-10">
                 <h4 className="text-sm font-black uppercase tracking-[0.2em] text-black">Discourse ({comments.length})</h4>
                 <div className="h-px flex-1 bg-slate-100 mx-6" />
               </div>

               <div className="space-y-8 mb-12">
                 {comments.map((c) => (
                   <div key={c.id} className="group">
                     <div className="flex items-center gap-4 mb-3">
                       <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden" />
                       <div>
                         <span className="text-xs font-black text-black uppercase tracking-widest">{c.author}</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3">{c.date}</span>
                       </div>
                     </div>
                     <p className="text-sm font-medium text-slate-600 leading-relaxed pl-12">{c.text}</p>
                   </div>
                 ))}
               </div>

               <div className="relative p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner">
                 <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your perspective..."
                  className="w-full h-24 bg-transparent border-none outline-none text-sm font-medium placeholder:text-slate-300 resize-none font-jost"
                 />
                 <div className="flex items-center justify-between mt-4">
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                     Be respectful and rigorous.
                   </div>
                   <button 
                    onClick={() => {
                      if (!commentText.trim()) return;
                      setComments([...comments, { id: Date.now(), author: "Visiting Scholar", text: commentText, date: "Just now" }]);
                      setCommentText("");
                    }}
                    className="h-10 px-8 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-50"
                    disabled={!commentText.trim()}
                   >
                     Submit Perspective
                   </button>
                 </div>
               </div>
             </div>
          </div>
        </article>
      </main>
    </div>

    {/* Edit Password Dialog */}
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent className="sm:max-w-md rounded-[2rem] border-slate-100 shadow-2xl">
        <DialogHeader className="text-center items-center pb-2">
          <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mb-4 mx-auto">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Author Verification</DialogTitle>
          <DialogDescription className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
            Enter the edit password set during publishing to access the editor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Lock className="w-3 h-3" /> Edit Password
            </Label>
            <Input
              type="password"
              placeholder="Enter your edit password..."
              value={editPasswordInput}
              onChange={(e) => setEditPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && editPasswordInput) {
                  const storedPassword = blog?.content?.meta?.editPassword;
                  if (editPasswordInput === storedPassword) {
                    toast.success("Access granted! Redirecting to editor...");
                    setShowEditDialog(false);
                    router.push(`/dashboard/blogs/${blog?.id}`);
                  } else {
                    toast.error("Incorrect password. Access denied.");
                  }
                }
              }}
              className="h-12 rounded-xl bg-slate-50 border-slate-100 text-sm font-bold placeholder:font-normal focus-visible:ring-primary/30"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:flex-row pt-2">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs"
            onClick={() => setShowEditDialog(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-12 rounded-xl bg-black text-white font-black uppercase tracking-widest text-xs shadow-lg hover:bg-primary gap-2 transition-colors"
            onClick={() => {
              const storedPassword = blog?.content?.meta?.editPassword;
              if (editPasswordInput === storedPassword) {
                toast.success("Access granted! Redirecting to editor...");
                setShowEditDialog(false);
                router.push(`/dashboard/blogs/${blog?.id}`);
              } else {
                toast.error("Incorrect password. Access denied.");
              }
            }}
            disabled={!editPasswordInput}
          >
            <Lock className="w-4 h-4" /> Verify & Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
