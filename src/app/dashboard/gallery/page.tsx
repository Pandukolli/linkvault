"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useImages } from "@/hooks/use-images";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Image as ImageIcon,
  Plus,
  Upload,
  Trash2,
  FolderOpen,
  X,
  MessageSquare,
  LayoutGrid,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MoreVertical,
  AlertTriangle,
  Feather,
  Film,
  Camera,
  Layers,
  Search,
  Share2
} from "lucide-react";
import type { UserImage } from "@/lib/types";

// Mode options
type GalleryMode = "upload" | "projects" | "stories";
type ViewMode = "masonry" | "grid" | "list";

export default function GalleryPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<GalleryMode>("upload");
  const [viewMode, setViewMode] = useState<ViewMode>("masonry");
  const [searchQuery, setSearchQuery] = useState("");

  // Selection & Lightbox
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Project state
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Story Edit State
  const [editingStoryImage, setEditingStoryImage] = useState<UserImage | null>(null);

  // Delete DB Dialog
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);

  const { images, isLoading, uploadImage, updateImage, deleteImage } = useImages();

  // Derived state
  const filteredImages = useMemo(() => {
    let result = images;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(img =>
        (img.title && img.title.toLowerCase().includes(q)) ||
        (img.caption && img.caption.toLowerCase().includes(q)) ||
        (img.story && img.story.toLowerCase().includes(q)) ||
        (img.folder && img.folder.toLowerCase().includes(q))
      );
    }

    // Mode filter
    if (mode === "projects" && selectedProject) {
      result = result.filter(img => img.folder === selectedProject);
    } else if (mode === "stories") {
      result = result.filter(img => img.is_story);
    } else if (mode === "upload") {
      result = result.filter(img => !img.is_story);
    }

    return result;
  }, [images, searchQuery, mode, selectedProject]);

  const projects = useMemo(() => {
    const counts: Record<string, { count: number, cover: string | null }> = {};
    images.forEach(img => {
      const folder = img.folder || "Unorganized";
      if (!counts[folder]) counts[folder] = { count: 0, cover: img.url };
      counts[folder].count++;
      if (!counts[folder].cover) counts[folder].cover = img.url;
    });
    return Object.entries(counts).map(([name, data]) => ({ name, ...data }));
  }, [images]);

  // Upload handler
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      await uploadImage.mutateAsync({
        file,
        folder: mode === "projects" && selectedProject ? selectedProject : "general",
      });
    }
    if (mode !== "upload" && !selectedProject) setMode("upload");
  }, [uploadImage, mode, selectedProject]);

  // Bulk actions
  const handleBulkDelete = () => setDeleteIds(Array.from(selectedIds));
  const confirmDelete = async () => {
    if (!deleteIds) return;
    for (const id of deleteIds) {
      await deleteImage.mutateAsync(id);
    }
    setDeleteIds(null);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === "Escape") setLightboxIndex(null);
        if (e.key === "ArrowLeft") setLightboxIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev);
        if (e.key === "ArrowRight") setLightboxIndex(prev => prev !== null && prev < filteredImages.length - 1 ? prev + 1 : prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredImages.length]);

  return (
    <div className="max-w-[1600px] mx-auto pb-24 h-full relative">
      {/* Hero Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-16 pt-4 border-b border-[#E5E7EB] pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-md bg-[#2563EB]/5 border border-[#2563EB]/10 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-[#2563EB]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Visual Archive</span>
          </div>
          <h1 className="text-6xl font-black text-[#111827] tracking-tighter uppercase leading-none">
            Gallery
          </h1>
          <p className="text-[#6B7280] text-[10px] font-bold uppercase tracking-[0.2em]">
            <span className="text-[#2563EB]">{images.length} assets</span> • {projects.length} PROJECTS • {images.filter(i => i.is_story).length} STORIES
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative group hidden md:block">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#2563EB] transition-colors" />
            <input
              type="text"
              placeholder="Query visuals..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 rounded-md bg-white border border-[#E5E7EB] font-bold text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none transition-all w-64"
            />
          </div>

          <Button
            className="h-12 px-8 gap-3 bg-[#F97316] text-white hover:bg-[#EA580C] rounded-md font-bold shadow-lg shadow-orange-500/20"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            Upload Media
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        {/* Mode Tabs */}
        <div className="flex gap-1.5 p-1 bg-[#F1F5F9] rounded-md border border-[#E5E7EB]">
          {[
            { id: "upload", label: "Uploads", icon: Layers },
            { id: "projects", label: "Projects", icon: FolderOpen },
            { id: "stories", label: "Stories", icon: Film }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id as GalleryMode);
                setSelectedProject(null);
                setSelectedIds(new Set());
              }}
              className={`flex items-center gap-3 px-6 py-2 text-xs font-bold rounded-md transition-all uppercase tracking-wider ${mode === m.id
                ? "bg-white text-[#2563EB] shadow-sm border border-[#E5E7EB]"
                : "text-[#6B7280] hover:text-[#111827]"
                }`}
            >
              <m.icon className="w-4 h-4" />
              {m.label}
            </button>
          ))}
        </div>

        {/* Action / View controls */}
        <div className="flex items-center gap-6">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-4 pr-6 border-r border-[#E5E7EB]">
              <span className="text-[10px] font-bold text-[#111827] uppercase tracking-wider">{selectedIds.size} Selected</span>
              <button className="text-[10px] font-bold uppercase tracking-widest text-[#EF4444] hover:underline" onClick={handleBulkDelete}>
                Delete
              </button>
              <button className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] hover:text-[#111827]" onClick={() => setSelectedIds(new Set())}>
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-1 p-1 bg-[#F1F5F9] rounded-md hidden sm:flex border border-[#E5E7EB]">
            {[
              { id: "masonry", icon: LayoutGrid },
              { id: "grid", icon: Grid3X3 },
              { id: "list", icon: List }
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id as ViewMode)}
                className={`p-2 rounded-md transition-all ${viewMode === v.id ? "bg-white text-[#2563EB] shadow-sm" : "text-[#6B7280] hover:text-[#111827]"}`}
              >
                <v.icon className="w-4.5 h-4.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div
        className="min-h-[50vh]"
        onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
        onDragOver={e => e.preventDefault()}
      >
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-md bg-[#F1F5F9]" />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {mode === "projects" && !selectedProject && (
              <motion.div key="projects-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {projects.map(proj => (
                  <div
                    key={proj.name}
                    className="group bg-white border border-[#E5E7EB] rounded-md p-4 cursor-pointer flex flex-col gap-4 hover:border-[#2563EB] hover:shadow-lg transition-all"
                    onClick={() => setSelectedProject(proj.name)}
                  >
                    <div className="aspect-[4/3] rounded-md bg-[#F8FAFC] overflow-hidden relative border border-[#E5E7EB]">
                      {proj.cover ? (
                        <img src={proj.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#9CA3AF]"><FolderOpen className="w-8 h-8" /></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#111827] tracking-tight">{proj.name}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-bold mt-1">{proj.count} ASSETS</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {mode === "stories" && (
              <motion.div key="stories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredImages.map((img, i) => (
                    <motion.div
                      key={img.id}
                      className="bg-white border border-[#E5E7EB] rounded-md p-6 group cursor-pointer hover:border-[#F97316] transition-all"
                      whileHover={{ y: -4 }}
                      onClick={() => setEditingStoryImage(img)}
                    >
                      <div className="aspect-square bg-[#F8FAFC] rounded-md overflow-hidden mb-6 relative border border-[#E5E7EB]">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="px-2 text-center">
                        <h4 className="font-bold text-xl text-[#111827] tracking-tight mb-2">{img.title || "Untitled Tale"}</h4>
                        <p className="text-sm text-[#6B7280] font-serif italic line-clamp-3 leading-relaxed">{img.story || "No story content yet."}</p>
                      </div>
                    </motion.div>
                  ))}
                  {filteredImages.length === 0 && (
                    <div className="col-span-full py-32 text-center rounded-md border border-dashed border-[#E5E7EB]">
                      <Film className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-[#9CA3AF] tracking-tight">No Stories Yet</h3>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {(mode === "upload" || (mode === "projects" && selectedProject)) && (
              <motion.div key="images-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {mode === "projects" && selectedProject && (
                  <div className="flex items-center gap-4 mb-8">
                    <Button variant="outline" size="icon-sm" className="rounded-md" onClick={() => setSelectedProject(null)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-xl font-bold uppercase tracking-tight text-[#111827]">{selectedProject}</h2>
                  </div>
                )}

                {filteredImages.length === 0 ? (
                  <div className="text-center py-32 rounded-md bg-white border border-dashed border-[#E5E7EB] group transition-all hover:border-[#2563EB]" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-20 h-20 mx-auto bg-[#F8FAFC] rounded-md flex items-center justify-center mb-6 border border-[#E5E7EB]">
                      <Upload className="w-8 h-8 text-[#9CA3AF] group-hover:text-[#2563EB] transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#111827] mb-2 tracking-tight">Initialize Visual Sync</h3>
                    <p className="text-sm text-[#6B7280] font-serif max-w-sm mx-auto mb-8">
                      Select multiple assets to start your professional gallery collection.
                    </p>
                    <Button className="bg-[#2563EB] text-white">Select Images</Button>
                  </div>
                ) : (
                  <div className={viewMode === "masonry" ? "columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6" : viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6" : "flex flex-col gap-4"}>
                    {filteredImages.map((img, index) => (
                      <div
                        key={img.id}
                        className={`group relative overflow-hidden bg-white border border-[#E5E7EB] rounded-md cursor-pointer hover:border-[#2563EB] hover:shadow-lg transition-all duration-300
                          ${viewMode === "grid" ? "aspect-square" : viewMode === "list" ? "flex h-24 p-2 items-center gap-6" : "break-inside-avoid"}
                          ${selectedIds.has(img.id) ? "border-[#2563EB] border-2 shadow-lg shadow-blue-500/20" : ""}
                        `}
                        onClick={(e) => {
                          if (e.ctrlKey || e.metaKey || selectedIds.size > 0) {
                            toggleSelect(img.id);
                          } else {
                            setLightboxIndex(index);
                          }
                        }}
                      >
                        <div className={`${viewMode === "list" ? "w-32 h-full rounded-md overflow-hidden shrink-0 border border-[#E5E7EB]" : "w-full h-full"}`}>
                          <img src={img.url} alt="" className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${viewMode === "masonry" ? "h-auto" : ""}`} loading="lazy" />
                        </div>

                        {viewMode !== "list" && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-white font-bold text-xs truncate block">{img.caption || img.title || hostname(img.url)}</span>
                          </div>
                        )}

                        {viewMode === "list" && (
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-[#111827] text-base block truncate">{img.caption || img.title || "Untitled Image"}</span>
                            <span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider mt-1 block">{img.folder} • {new Date(img.created_at).toLocaleDateString()}</span>
                          </div>
                        )}

                        {img.is_story && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-md bg-white/90 border border-[#E5E7EB] flex items-center justify-center text-[#2563EB]">
                            <Film className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* LIGHTBOX COMPONENT */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex items-center justify-center"
          >
            <button className="absolute top-6 right-6 w-12 h-12 hover:bg-[#F1F5F9] rounded-md flex items-center justify-center text-[#111827] transition-colors z-50" onClick={() => setLightboxIndex(null)}>
              <X className="w-6 h-6" />
            </button>

            <button className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 hover:bg-[#F1F5F9] rounded-md flex items-center justify-center text-[#111827] transition-colors z-50 disabled:opacity-20" disabled={lightboxIndex === 0} onClick={() => setLightboxIndex(prev => prev! - 1)}>
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 hover:bg-[#F1F5F9] rounded-md flex items-center justify-center text-[#111827] transition-colors z-50 disabled:opacity-20" disabled={lightboxIndex === filteredImages.length - 1} onClick={() => setLightboxIndex(prev => prev! + 1)}>
              <ChevronRight className="w-8 h-8" />
            </button>

            <div className="w-full h-full max-w-7xl max-h-[85vh] p-4 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-center relative">
              <div className="flex-1 w-full h-full flex items-center justify-center">
                <img src={filteredImages[lightboxIndex].url} alt="" className="max-w-full max-h-full object-contain shadow-2xl rounded-md border border-[#E5E7EB]" />
              </div>

              <div className="w-full md:w-80 bg-white border border-[#E5E7EB] rounded-md p-6 shadow-xl shrink-0 flex flex-col hidden md:flex">
                <h3 className="font-bold text-lg text-[#111827] mb-6 tracking-tight border-b border-[#E5E7EB] pb-4">Artifact Metadata</h3>
                <div className="space-y-6 flex-1">
                  <div>
                    <Label className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest">Caption</Label>
                    <Input
                      key={`caption-${filteredImages[lightboxIndex].id}`}
                      className="mt-1 h-12 font-semibold"
                      defaultValue={filteredImages[lightboxIndex].caption || ""}
                      onBlur={e => updateImage.mutate({ id: filteredImages[lightboxIndex].id, caption: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest">Group / Project</Label>
                    <Input
                      key={`folder-${filteredImages[lightboxIndex].id}`}
                      className="mt-1 h-12 font-semibold"
                      defaultValue={filteredImages[lightboxIndex].folder || ""}
                      onBlur={e => updateImage.mutate({ id: filteredImages[lightboxIndex].id, folder: e.target.value })}
                    />
                  </div>
                  <div className="pt-4 space-y-3">
                    <Button
                      variant={filteredImages[lightboxIndex].is_story ? "default" : "outline"}
                      className="w-full h-11"
                      onClick={() => updateImage.mutate({ id: filteredImages[lightboxIndex].id, is_story: !filteredImages[lightboxIndex].is_story })}
                    >
                      {filteredImages[lightboxIndex].is_story ? "Featured Story" : "Enable Story Mode"}
                    </Button>
                    <Button variant="ghost" className="w-full h-11 text-[#EF4444] hover:bg-red-50" onClick={() => setDeleteIds([filteredImages[lightboxIndex].id])}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Media
                    </Button>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E5E7EB] text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider space-y-1">
                  <p>Archived: {new Date(filteredImages[lightboxIndex].created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STORY EDITOR */}
      <Dialog open={!!editingStoryImage} onOpenChange={o => !o && setEditingStoryImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border border-[#E5E7EB] rounded-md">
          {editingStoryImage && (
            <div className="flex flex-col md:flex-row min-h-[500px]">
              <div className="w-full md:w-1/2 h-full bg-[#F8FAFC] flex items-center justify-center p-8 relative">
                <img src={editingStoryImage.url} alt="" className="max-w-full max-h-full object-contain shadow-lg" />
              </div>
              <div className="w-full md:w-1/2 p-10 flex flex-col">
                <div className="flex items-center gap-3 mb-8 text-[#2563EB]">
                  <Feather className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Editorial Mode</span>
                </div>

                <input
                  key={`title-${editingStoryImage.id}`}
                  type="text"
                  className="text-3xl font-black mb-6 focus:outline-none bg-transparent text-[#111827] tracking-tight"
                  placeholder="The moment's title..."
                  defaultValue={editingStoryImage.title || ""}
                  onBlur={e => updateImage.mutate({ id: editingStoryImage.id, title: e.target.value })}
                />

                <textarea
                  key={`story-${editingStoryImage.id}`}
                  className="flex-1 resize-none focus:outline-none bg-transparent text-[#6B7280] font-serif text-lg leading-relaxed pt-2"
                  placeholder="Narrative goes here... Use Merriweather font for elegant reflection."
                  defaultValue={editingStoryImage.story || ""}
                  onBlur={e => updateImage.mutate({ id: editingStoryImage.id, story: e.target.value })}
                />

                <div className="mt-10 pt-8 border-t border-[#E5E7EB] flex justify-between items-center gap-4">
                  <Button variant="ghost" className="text-[#9CA3AF]" onClick={() => setEditingStoryImage(null)}>Close</Button>
                  <Button
                    className="flex-1 bg-[#F97316] text-white hover:bg-[#EA580C] rounded-md font-bold h-12"
                    onClick={async () => {
                      const slug = editingStoryImage.slug || editingStoryImage.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || "story";
                      const isPublishing = !editingStoryImage.published_at;
                      await updateImage.mutateAsync({
                        id: editingStoryImage.id,
                        published_at: isPublishing ? new Date().toISOString() : null,
                        slug
                      });
                      if (isPublishing) toast.success("Story Published!");
                      setEditingStoryImage(null);
                    }}
                  >
                    {editingStoryImage.published_at ? "Unpublish Story" : "Publish Global Access"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <Dialog open={!!deleteIds} onOpenChange={o => !o && setDeleteIds(null)}>
        <DialogContent className="sm:max-w-md bg-white border border-[#E5E7EB] rounded-md shadow-2xl">
          <DialogHeader className="text-center items-center pb-2">
            <div className="w-16 h-16 rounded-md bg-red-50 flex items-center justify-center mb-6">
              <AlertTriangle className="w-7 h-7 text-[#EF4444]" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-[#111827]">
              Purge Media Artifact
            </DialogTitle>
            <DialogDescription className="text-sm text-[#6B7280] font-serif max-w-xs mx-auto mt-2">
              Are you sure you want to permanently delete these items? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-6 border-t border-[#E5E7EB] mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteIds(null)}>Cancel</Button>
            <Button className="flex-1 bg-[#EF4444] text-white" onClick={confirmDelete}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "visual artifact";
  }
}

