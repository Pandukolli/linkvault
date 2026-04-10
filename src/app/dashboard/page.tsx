"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  FolderOpen,
  Heart,
  StickyNote,
  ArrowRight,
  ArrowUpRight,
  MoreHorizontal,
  Clock,
  Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLinks } from "@/hooks/use-links";
import { useCollections } from "@/hooks/use-collections";
import { useNotes } from "@/hooks/use-notes";
import { SaveLinkDialog } from "@/components/save-link-dialog";
import type { LinkWithTags } from "@/lib/types";

// Helper to colorize tags deterministically
const getTagColor = (tag: string) => {
  const colors = [
    "tag-blue",
    "tag-purple",
    "tag-emerald",
    "tag-amber",
    "tag-rose"
  ];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

function DashboardContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkWithTags | null>(null);

  const { links, isLoading: linksLoading } = useLinks();
  const { collections, isLoading: collectionsLoading } = useCollections();
  const { notes, isLoading: notesLoading } = useNotes();

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setDialogOpen(true);
    }
  }, [searchParams]);

  const recentLinks = links.slice(0, 8);
  const favoriteCount = links.filter((l) => l.is_favorite).length;

  const stats = [
    { label: "Links", value: links.length, icon: Link2, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { label: "Collections", value: collections.length, icon: FolderOpen, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { label: "Notes", value: notes?.length || 0, icon: StickyNote, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { label: "Favorites", value: favoriteCount, icon: Heart, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", extra: "this week" },
  ];

  const StatSkeleton = () => (
    <div className="bg-card border-elegant p-6 rounded-3xl animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-slate-50/50 mb-4" />
      <div className="h-8 w-16 bg-slate-50/50 rounded mb-2" />
      <div className="h-3 w-24 bg-slate-50/50 rounded" />
    </div>
  );

  return (
    <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto">
      
      {/* 4 Elegant Stat Cards with Enhanced Spacing */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {linksLoading ? (
          <>
            <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
          </>
        ) : (
          <AnimatePresence>
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card border-elegant rounded-3xl relative overflow-hidden group p-5 md:p-6 transition-all duration-500 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-slate-50 text-primary border border-slate-100 transition-transform duration-500 group-hover:scale-110 shadow-sm`}>
                  <stat.icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                
                <h3 className="text-3xl md:text-4xl font-black text-black tracking-tighter mb-1 transition-colors group-hover:text-primary">
                  {stat.value}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  {stat.extra && <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">+{stat.extra}</span>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Main Two-Column Layout with Enhanced Spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column (Approx 65%) - Recent Links Feed */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> {t("Recently Saved", "Recently Saved")}
            </h2>
            <Link href="/dashboard/links">
              <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-primary/80 hover:text-primary transition-all">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3 stagger-children">
            {linksLoading ? (
               [...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl w-full" />)
            ) : recentLinks.length > 0 ? (
              recentLinks.map((link) => (
                <div key={link.id} className="bg-card border-elegant hover:border-primary/20 rounded-2xl group relative p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/20">
                  
                  {/* Favicon / Host bubble */}
                  <div className="w-12 h-12 rounded-xl bg-secondary/60 flex items-center justify-center flex-shrink-0 relative overflow-hidden transition-all duration-300">
                     <img
                        src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=64`}
                        alt=""
                        className="w-6 h-6 z-10"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-2">
                     <div className="flex items-center gap-2 mb-1">
                       <h3 className="font-bold text-sky-500 text-sm sm:text-base truncate group-hover:text-sky-600 transition-colors">
                         {link.title || new URL(link.url).hostname}
                       </h3>
                       {link.is_favorite && <Heart className="w-4 h-4 text-rose-500 fill-rose-500 flex-shrink-0" />}
                     </div>
                     <p className="text-xs text-muted-foreground line-clamp-1 mb-2.5 max-w-lg">
                       {link.description || link.url}
                     </p>
                     
                     {/* Dynamic Colored Tags */}
                     {link.tags && link.tags.length > 0 && (
                       <div className="flex items-center gap-1.5 flex-wrap">
                          {link.tags.slice(0, 3).map((tag) => (
                            <span key={tag.id} className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getTagColor(tag.name)}`}>
                              {tag.name}
                            </span>
                          ))}
                          {link.tags.length > 3 && <span className="text-[10px] font-semibold text-muted-foreground px-1">+{link.tags.length - 3}</span>}
                       </div>
                     )}
                  </div>
                  
                  {/* Actions */}
                  <div className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground" onClick={() => {}}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary" size="icon" className="w-8 h-8 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground shadow-sm">
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card border-elegant p-12 text-center flex flex-col items-center justify-center rounded-[2.5rem]">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border-elegant flex items-center justify-center mb-4">
                  <Link2 className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-black uppercase tracking-tight">{t("No links saved yet", "No links saved yet")}</h3>
                <p className="text-sm text-slate-400 font-bold mt-2 mb-8 uppercase tracking-widest opacity-60 max-w-xs mx-auto">
                  {t("Start building your digital library by saving your first link.", "Start building your digital library by saving your first link.")}
                </p>
                <Button onClick={() => setDialogOpen(true)} className="h-14 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1">
                  {t("Save First Link", "Save First Link")}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Approx 35%) - Quick Notes & Collections */}
        <div className="lg:col-span-4 flex flex-col space-y-8">
          
          {/* Quick Notes Snippets */}
          <div>
            <div className="flex items-center justify-between px-1 mb-4">
              <h2 className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-amber-500" /> Recent Notes
              </h2>
            </div>
            
            <div className="space-y-3 stagger-children">
              {notesLoading ? (
                 <Skeleton className="h-32 rounded-2xl w-full" />
              ) : notes && notes.length > 0 ? (
                notes.slice(0, 3).map((note) => (
                  <Link key={note.id} href={`/dashboard/notes?id=${note.id}`}>
                    <div className="bg-card rounded-2xl border border-border/40 p-4 group cursor-pointer hover:border-amber-500/30 hover:bg-secondary/10 transition-all duration-300">
                      <h4 className="font-bold text-sm text-foreground group-hover:text-amber-500 transition-colors mb-1 truncate">
                        {note.title || "Untitled Note"}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {typeof note.content === 'string' ? note.content.substring(0, 100) : "Rich text content..."}
                      </p>
                      <div className="mt-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                        {new Date(note.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="card-elevated p-6 text-center border-dashed border-2">
                   <p className="text-xs text-muted-foreground font-medium">No notes created yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Collections Summary */}
          <div>
            <div className="flex items-center justify-between px-1 mb-4">
              <h2 className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-purple-600" /> Collections
              </h2>
            </div>
            
            <div className="bg-card rounded-2xl border border-border/40 p-1 overflow-hidden transition-all duration-300">
              {collectionsLoading ? (
                <div className="p-4 space-y-3">
                   <Skeleton className="h-8 w-full" />
                   <Skeleton className="h-8 w-full" />
                </div>
              ) : collections.length > 0 ? (
                <div className="flex flex-col">
                  {collections.slice(0, 5).map((col, i) => (
                    <Link key={col.id} href={`/dashboard/collections/${col.id}`}>
                      <div className={`group flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors ${i !== collections.length -1 ? 'border-b border-border/30' : ''}`}>
                        <div className="flex items-center gap-3">
                          <Circle className="w-2.5 h-2.5 text-purple-600 fill-purple-600/20" />
                          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{col.name}</span>
                        </div>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">{col.link_count || 0}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed rounded-2xl">
                   <p className="text-xs text-muted-foreground font-medium">No collections yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      <SaveLinkDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingLink(null);
            window.history.replaceState({}, "", "/dashboard");
          }
        }}
        editingLink={editingLink}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="space-y-8 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-8 w-40 mb-6" />
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
          <div className="lg:col-span-4 space-y-8">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-32 rounded-2xl mb-4" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
