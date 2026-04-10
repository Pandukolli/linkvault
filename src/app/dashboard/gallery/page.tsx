"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useImages } from "@/hooks/use-images";
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
      // In quick upload, maybe only show general or all non-story? Let's show all for now, but grouped by date later
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
    // Switch to upload mode if not already and no project selected
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
    <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-12 pb-24 h-full relative">
      {/* Hero Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12 animate-fade-in-up">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter uppercase flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-primary/60 text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <Camera className="w-8 h-8" />
            </div>
            Visual Hub
          </h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] mt-4 opacity-70">
            {images.length} assets • {projects.length} projects • {images.filter(i=>i.is_story).length} stories
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative group hidden md:block">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search visuals..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-14 rounded-2xl bg-white border border-slate-100 font-bold text-sm focus:border-primary/30 focus:outline-none transition-all w-64 shadow-sm"
            />
          </div>

          <Button
            className="h-14 px-8 gap-3 bg-black hover:bg-primary text-white rounded-2xl font-black transition-all duration-300 shadow-2xl shadow-black/10 hover:shadow-primary/30 hover:-translate-y-1 uppercase tracking-tighter"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-5 h-5 stroke-[3]" />
            Upload
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

      {/* Main Controls row */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 pb-6 border-b border-slate-100 animate-fade-in-up" style={{ animationDuration: '0.8s' }}>
        {/* Mode Tabs */}
        <div className="flex gap-2 p-1.5 bg-slate-50/80 backdrop-blur-xl rounded-[1.5rem] border border-slate-100/50">
          {[
            { id: "upload", label: "Quick Upload", icon: Layers },
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
              className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black rounded-xl transition-all duration-300 uppercase tracking-widest ${
                mode === m.id
                  ? "bg-white text-black shadow-xl shadow-black/5"
                  : "text-slate-400 hover:text-black hover:bg-white/40"
              }`}
            >
              <m.icon className="w-4 h-4" />
              {m.label}
            </button>
          ))}
        </div>

        {/* Action / View controls */}
        <div className="flex items-center gap-4">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
              <span className="text-xs font-black text-primary uppercase tracking-widest">{selectedIds.size} Selected</span>
              <Button variant="ghost" size="sm" className="h-10 text-red-500 hover:bg-red-50" onClick={handleBulkDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
              <Button variant="ghost" size="sm" className="h-10 text-slate-500 hover:bg-slate-100" onClick={() => setSelectedIds(new Set())}>
                Cancel
              </Button>
            </div>
          )}

          <div className="flex gap-1 p-1 bg-slate-50 rounded-xl hidden sm:flex">
            {[ 
              { id: "masonry", icon: LayoutGrid },
              { id: "grid", icon: Grid3X3 },
              { id: "list", icon: List }
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id as ViewMode)}
                className={`p-2.5 rounded-lg transition-colors ${viewMode === v.id ? "bg-white text-black shadow-sm" : "text-slate-400 hover:text-black"}`}
              >
                <v.icon className="w-4 h-4" />
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
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-[2rem] bg-slate-50" />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* PROJECTS SUB-VIEW (When showing project folders) */}
            {mode === "projects" && !selectedProject && (
              <motion.div key="projects-list" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {projects.map(proj => (
                  <div 
                    key={proj.name}
                    className="group card-elevated p-4 cursor-pointer flex flex-col gap-4 bg-white"
                    onClick={() => setSelectedProject(proj.name)}
                  >
                    <div className="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden relative">
                      {proj.cover ? (
                        <img src={proj.cover} alt={proj.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><FolderOpen className="w-8 h-8" /></div>
                      )}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div className="px-2 pb-2">
                      <h3 className="font-black text-lg uppercase tracking-tight">{proj.name}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">{proj.count} Assets</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* STORIES VIEW */}
            {mode === "stories" && (
              <motion.div key="stories" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                {images.filter(i=>!i.is_story).length > 0 && (
                  <div className="mb-10 text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Want to create a story?</p>
                    <Button variant="outline" className="rounded-full shadow-sm font-black" onClick={() => setMode("upload")}>
                      Select images from Uploads to make a story
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredImages.map((img, i) => (
                    <motion.div 
                      key={img.id} 
                      className="polaroid-card group cursor-pointer"
                      whileHover={{ scale: 1.02, rotate: i%2===0 ? 1 : -1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      onClick={() => setEditingStoryImage(img)}
                    >
                      <div className="aspect-square bg-slate-100 overflow-hidden mb-6 relative">
                        <img src={img.url} className="w-full h-full object-cover" />
                        <div className="film-grain" /> {/* Cinematic effect */}
                      </div>
                      <div className="px-2">
                        <h4 className="font-bold font-serif text-2xl leading-tight mb-2 opacity-90">{img.title || "Untitled Tale"}</h4>
                        <p className="text-sm text-slate-500 font-medium italic line-clamp-3">{img.story || "Write a captivating story about this captured moment..."}</p>
                      </div>
                    </motion.div>
                  ))}
                  {filteredImages.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <Film className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <h3 className="text-2xl font-black uppercase tracking-tighter">No Stories Yet</h3>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* QUICK UPLOAD / PROJECT ASSETS VIEW */}
            {(mode === "upload" || (mode === "projects" && selectedProject)) && (
              <motion.div key="images-grid" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                {mode === "projects" && selectedProject && (
                  <div className="flex items-center gap-4 mb-8">
                    <Button variant="outline" size="icon" className="rounded-full" onClick={() => setSelectedProject(null)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-2xl font-black uppercase tracking-tight">{selectedProject}</h2>
                  </div>
                )}

                {filteredImages.length === 0 ? (
                  <div className="text-center py-32 rounded-[3.5rem] bg-white border border-slate-100 shadow-2xl shadow-primary/5 cursor-pointer group transition-all duration-700 hover:border-primary/20" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 mx-auto bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100 shadow-inner group-hover:scale-110 transition-all duration-500">
                      <Upload className="w-10 h-10 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-3xl font-black text-black mb-3 tracking-tighter uppercase">Drop Visuals Here</h3>
                    <p className="text-sm text-slate-400 font-bold max-w-sm mx-auto mb-10 uppercase tracking-[0.2em] leading-relaxed">
                      Transform your raw assets into a beautifully organized gallery.
                    </p>
                  </div>
                ) : (
                  <div className={viewMode === "masonry" ? "gallery-masonry" : viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4" : "flex flex-col gap-4"}>
                    {filteredImages.map((img, index) => (
                      <div
                        key={img.id}
                        className={`group relative overflow-hidden bg-slate-50 border border-slate-100 cursor-pointer hover:shadow-xl hover:shadow-primary/10 transition-all duration-300
                          ${viewMode === "masonry" ? "gallery-masonry-item" : viewMode === "grid" ? "aspect-square rounded-[1.5rem]" : "flex h-32 rounded-[1.5rem] p-3 items-center gap-6"}
                          ${selectedIds.has(img.id) ? "ring-4 ring-primary ring-offset-2" : ""}
                        `}
                        onClick={(e) => {
                          if (e.ctrlKey || e.metaKey || selectedIds.size > 0) {
                            toggleSelect(img.id);
                          } else {
                            setLightboxIndex(index);
                          }
                        }}
                      >
                        <div className={`${viewMode === "list" ? "w-40 h-full rounded-xl overflow-hidden shrink-0" : "w-full h-full"}`}>
                          <img src={img.url} className={`w-full h-full object-cover img-zoom-hover ${viewMode === "masonry" ? "h-auto" : ""}`} loading="lazy" />
                        </div>
                        
                        {/* Hover Overlay for Grid/Masonry */}
                        {viewMode !== "list" && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <span className="text-white font-bold text-sm tracking-wide truncate">{img.caption || img.title || "Untitled"}</span>
                            <span className="text-white/60 text-[10px] uppercase tracking-widest mt-1">{new Date(img.created_at).toLocaleDateString()}</span>
                          </div>
                        )}

                        {/* List view details */}
                        {viewMode === "list" && (
                          <div className="flex-1 flex flex-col justify-center">
                            <span className="font-bold text-lg">{img.caption || img.title || "Untitled Image"}</span>
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">{img.folder} • {new Date(img.created_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {/* Type Icons */}
                        {img.is_story && (
                          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                            <Film className="w-4 h-4" />
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
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center"
          >
            <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50" onClick={() => setLightboxIndex(null)}>
              <X className="w-6 h-6" />
            </button>
            
            {/* Nav arrows */}
            <button className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/5 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50 disabled:opacity-20" disabled={lightboxIndex === 0} onClick={() => setLightboxIndex(prev => prev! - 1)}>
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/5 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50 disabled:opacity-20" disabled={lightboxIndex === filteredImages.length - 1} onClick={() => setLightboxIndex(prev => prev! + 1)}>
              <ChevronRight className="w-8 h-8" />
            </button>

            <div className="w-full h-full max-w-7xl max-h-[85vh] p-4 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-center relative">
              {/* Image */}
              <motion.div 
                key={`lb-img-${lightboxIndex}`}
                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.4 }}
                className="flex-1 w-full h-full flex items-center justify-center relative"
              >
                <img src={filteredImages[lightboxIndex].url} className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-lg" />
              </motion.div>
              
              {/* Info sidebar */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="w-full md:w-80 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 text-white shrink-0 flex flex-col hidden md:flex"
              >
                <h3 className="font-black text-xl mb-6 tracking-tight">Details</h3>
                <div className="space-y-4 flex-1">
                  <div>
                    <Label className="text-[10px] text-white/50 uppercase tracking-widest">Caption</Label>
                    <Input 
                      key={`caption-${filteredImages[lightboxIndex].id}`}
                      className="bg-transparent border-white/20 text-white mt-1 h-12 focus:border-primary focus:ring-0" 
                      defaultValue={filteredImages[lightboxIndex].caption || ""}
                      onBlur={e => updateImage.mutate({ id: filteredImages[lightboxIndex].id, caption: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-white/50 uppercase tracking-widest">Folder Mapping</Label>
                    <Input 
                      key={`folder-${filteredImages[lightboxIndex].id}`}
                      className="bg-transparent border-white/20 text-white mt-1 h-12 focus:border-primary focus:ring-0" 
                      defaultValue={filteredImages[lightboxIndex].folder || ""}
                      onBlur={e => updateImage.mutate({ id: filteredImages[lightboxIndex].id, folder: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-white/50 uppercase tracking-widest">Type</Label>
                    <div className="flex gap-2 mt-2">
                       <Button 
                         variant={filteredImages[lightboxIndex].is_story ? "default" : "outline"} 
                         className={`flex-1 h-10 text-xs ${!filteredImages[lightboxIndex].is_story ? "bg-transparent text-white border-white/20" : ""}`}
                         onClick={() => updateImage.mutate({ id: filteredImages[lightboxIndex].id, is_story: !filteredImages[lightboxIndex].is_story })}
                       >
                         {filteredImages[lightboxIndex].is_story ? "Is Story" : "Make Story"}
                       </Button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/10 text-[10px] text-white/40 uppercase tracking-widest space-y-2">
                  <p>Added: {new Date(filteredImages[lightboxIndex].created_at).toLocaleDateString()}</p>
                  <p>ID: {filteredImages[lightboxIndex].id.slice(0,8)}</p>
                </div>
                
                <Button variant="destructive" className="w-full mt-6 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white" onClick={() => setDeleteIds([filteredImages[lightboxIndex].id])}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Media
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STORY EDITOR DIALOG */}
      <Dialog open={!!editingStoryImage} onOpenChange={o => !o && setEditingStoryImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-[#fbfbfb] border-none rounded-[2rem]">
          {editingStoryImage && (
            <div className="flex flex-col md:flex-row h-[70vh]">
              <div className="w-full md:w-1/2 h-full bg-slate-100 flex items-center justify-center p-8 relative">
                 <img src={editingStoryImage.url} className="max-w-full max-h-full object-contain drop-shadow-xl" />
                 <div className="film-grain" />
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col bg-white">
                 <div className="flex items-center gap-3 mb-8 text-primary">
                    <Feather className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Story Studio</span>
                 </div>
                 
                 <input 
                   key={`title-${editingStoryImage.id}`}
                   type="text" 
                   className="text-3xl font-black mb-4 focus:outline-none bg-transparent" 
                   placeholder="A Beautiful Memory..." 
                   defaultValue={editingStoryImage.title || ""}
                   onBlur={e => updateImage.mutate({ id: editingStoryImage.id, title: e.target.value })}
                 />
                 
                 <textarea 
                   key={`story-${editingStoryImage.id}`}
                   className="flex-1 resize-none focus:outline-none bg-transparent text-slate-600 font-serif text-lg leading-relaxed pt-2"
                   placeholder="Every picture tells a story. Write yours here..."
                   defaultValue={editingStoryImage.story || ""}
                   onBlur={e => updateImage.mutate({ id: editingStoryImage.id, story: e.target.value })}
                 />
                 
                 <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
                   <Button variant="ghost" className="text-slate-400" onClick={() => setEditingStoryImage(null)}>Close</Button>
                   <Button 
                     className="bg-black hover:bg-primary text-white rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] h-12 px-6 shadow-xl"
                     onClick={async () => {
                       const slug = editingStoryImage.slug || editingStoryImage.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || "story";
                       
                       const isPublishing = !editingStoryImage.published_at;
                       
                       // Set published state
                       await updateImage.mutateAsync({ 
                         id: editingStoryImage.id, 
                         published_at: isPublishing ? new Date().toISOString() : null,
                         slug
                       });
                       
                       if (isPublishing) {
                         const storyUrl = `${window.location.origin}/gallery/story/${editingStoryImage.id}`;
                         navigator.clipboard.writeText(storyUrl);
                         toast.success("Story Published!", { description: "Public link copied to clipboard." });
                       } else {
                         toast.success("Story Unpublished.");
                       }
                       
                       // Close dialog
                       setEditingStoryImage(null);
                     }}
                   >
                     {editingStoryImage.published_at ? (
                       <>Unpublish Story</>
                     ) : (
                       <><Share2 className="w-4 h-4" /> Publish Story</>
                     )}
                   </Button>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <Dialog open={!!deleteIds} onOpenChange={o => !o && setDeleteIds(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-slate-100 shadow-2xl">
          <DialogHeader className="text-center items-center pb-2">
            <div className="w-16 h-16 rounded-[1.5rem] bg-red-50 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              Delete Meda
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
              Are you sure you want to permanently delete {deleteIds?.length === 1 ? "this item" : `these ${deleteIds?.length} items`}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:flex-row pt-4">
            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setDeleteIds(null)}>Cancel</Button>
            <Button className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white" onClick={confirmDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
