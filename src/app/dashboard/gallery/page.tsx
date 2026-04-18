"use client";

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  memo,
  DragEvent,
} from "react";
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
  Upload,
  Trash2,
  FolderOpen,
  X,
  LayoutGrid,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  Film,
  Search,
  Heart,
  Feather,
  AlertTriangle,
  Star,
  Plus,
  BookOpen,
  Eye,
  Camera,
  Sparkles,
  Globe,
  Lock,
  Layers,
  FolderPlus,
  Clock,
  Tag,
  CheckSquare,
  Move,
  Pencil,
  ArrowRight,
} from "lucide-react";
import type { GalleryImage } from "@/lib/types";

// ─── Types ───
type GalleryMode = "quick" | "projects" | "stories";
type ViewMode = "masonry" | "grid";
type QuickFilter = "all" | "favorites" | "this-month" | "untagged" | "stories";

const STORY_TEMPLATES = [
  { id: "cinematic",   label: "Cinematic",      desc: "Dark, moody, film-grade" },
  { id: "polaroid",    label: "Polaroid",        desc: "Retro, warm, nostalgic"  },
  { id: "documentary", label: "Documentary",     desc: "Raw, editorial"          },
  { id: "poetic",      label: "Poetic",          desc: "Soft, lyrical, dreamy"   },
  { id: "travel",      label: "Travel Journal",  desc: "Adventurous, worldly"    },
];

const PROJECT_COLORS = [
  "#2563EB","#7C3AED","#DB2777","#DC2626",
  "#D97706","#059669","#0891B2","#374151",
];

interface ProjectMeta {
  name: string;
  color: string;
  description: string;
  count: number;
  cover: string | null;
  latest: string;
}

interface UploadProgress {
  name: string;
  progress: number;
  done: boolean;
  error?: boolean;
}

// ─── Simple debounce hook ───
function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Tab fade transition (lighter than framer's internal layout) ───
const TAB_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

// ─── Main Component ───
export default function GalleryPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── UI State ──
  const [mode, setMode] = useState<GalleryMode>("quick");
  const [viewMode, setViewMode] = useState<ViewMode>("masonry");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250); // only filter after 250ms pause
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // ── Selection ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxEditMode, setLightboxEditMode] = useState(false);
  // Fully controlled inputs — synced via effect keyed to lightboxIndex only
  const [lightboxCaption, setLightboxCaption] = useState("");
  const [lightboxFolder, setLightboxFolder] = useState("general");

  // ── Project State ──
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "", color: PROJECT_COLORS[0] });
  const [pendingUploadFolder, setPendingUploadFolder] = useState<string>("general");

  // ── Story ──
  const [editingStory, setEditingStory] = useState<GalleryImage | null>(null);
  const [storyDraft, setStoryDraft] = useState({ title: "", story: "" });
  const [storyTemplate, setStoryTemplate] = useState("cinematic");

  // ── Dialogs ──
  const [movingIds, setMovingIds] = useState<string[] | null>(null);
  const [moveTarget, setMoveTarget] = useState("");
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);

  // ── Upload Progress ──
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);

  const { images, isLoading, uploadImage, updateImage, deleteImage } = useImages();

  // ─── Derived — memoized with debounced search ───
  const projects = useMemo((): ProjectMeta[] => {
    const map: Record<string, ProjectMeta> = {};
    for (const img of images) {
      const folder = img.folder || "general";
      if (!map[folder]) {
        map[folder] = { name: folder, color: PROJECT_COLORS[0], description: "", count: 0, cover: null, latest: img.created_at };
      }
      map[folder].count++;
      if (!map[folder].cover) map[folder].cover = img.url || null;
    }
    return Object.values(map);
  }, [images]);

  const projectNames = useMemo(() => projects.map((p) => p.name), [projects]);

  const filteredImages = useMemo(() => {
    let result = images; // avoid copy unless needed

    if (mode === "projects" && selectedProject) {
      result = result.filter((img) => (img.folder || "general") === selectedProject);
    } else if (mode === "stories") {
      result = result.filter((img) => img.is_story);
    } else if (mode === "quick") {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      if (quickFilter === "stories")     result = result.filter((img) => img.is_story);
      else if (quickFilter === "this-month") result = result.filter((img) => new Date(img.created_at) >= monthStart);
      else if (quickFilter === "untagged")   result = result.filter((img) => !img.caption && !img.title);
      else if (quickFilter === "favorites")  result = result.filter((img) => img.is_story);
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((img) =>
        img.title?.toLowerCase().includes(q) ||
        img.caption?.toLowerCase().includes(q) ||
        img.folder?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [images, mode, selectedProject, quickFilter, debouncedSearch]);

  const storiesCount = useMemo(() => images.filter((i) => i.is_story).length, [images]);

  // ─── Sync lightbox fields only when lightboxIndex changes (not filteredImages) ───
  useEffect(() => {
    if (lightboxIndex !== null) {
      const img = filteredImages[lightboxIndex];
      if (img) {
        setLightboxCaption(img.caption || "");
        setLightboxFolder(img.folder || "general");
      }
    }
    // intentionally only depend on lightboxIndex, not filteredImages array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex]);

  // ─── Upload Handler ───
  const handleFileUpload = useCallback(
    async (files: FileList | null, targetFolder?: string) => {
      if (!files || files.length === 0) return;
      const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!validFiles.length) { toast.error("Please select image files only."); return; }
      const folder = targetFolder ?? pendingUploadFolder;
      setUploadQueue(validFiles.map((f) => ({ name: f.name, progress: 0, done: false })));
      for (let i = 0; i < validFiles.length; i++) {
        for (let p = 10; p <= 80; p += 20) {
          await new Promise((r) => setTimeout(r, 60));
          setUploadQueue((q) => q.map((item, idx) => idx === i ? { ...item, progress: p } : item));
        }
        try {
          await uploadImage.mutateAsync({ file: validFiles[i], folder });
          setUploadQueue((q) => q.map((item, idx) => idx === i ? { ...item, progress: 100, done: true } : item));
        } catch {
          setUploadQueue((q) => q.map((item, idx) => idx === i ? { ...item, progress: 0, done: true, error: true } : item));
        }
      }
      setTimeout(() => setUploadQueue([]), 1500);
    },
    [uploadImage, pendingUploadFolder]
  );

  // Sync folder on project change
  useEffect(() => {
    setPendingUploadFolder(mode === "projects" && selectedProject ? selectedProject : "general");
  }, [mode, selectedProject]);

  // ─── Create Project ───
  const handleCreateProject = useCallback(() => {
    if (!newProject.name.trim()) { toast.error("Project name is required."); return; }
    const name = newProject.name.trim();
    setSelectedProject(name);
    setPendingUploadFolder(name);
    setMode("projects");
    setShowCreateProject(false);
    setNewProject({ name: "", description: "", color: PROJECT_COLORS[0] });
    toast.success(`Project "${name}" created!`);
  }, [newProject.name]);

  // ─── Drag & Drop ───
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>, targetFolder?: string) => {
    e.preventDefault();
    setIsDraggingOver(false);
    handleFileUpload(e.dataTransfer.files, targetFolder);
  }, [handleFileUpload]);

  // ─── Selection callbacks (stable refs) ───
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const selectAll  = useCallback(() => setSelectedIds(new Set(filteredImages.map((i) => i.id))), [filteredImages]);
  const clearSelect = useCallback(() => setSelectedIds(new Set()), []);

  // ─── Delete ───
  const confirmDelete = useCallback(async () => {
    if (!deleteIds) return;
    let count = 0;
    for (const id of deleteIds) {
      try { await deleteImage.mutateAsync(id); count++; } catch { /**/ }
    }
    toast.success(`Deleted ${count} image${count !== 1 ? "s" : ""}`);
    setDeleteIds(null);
    setSelectedIds(new Set());
    setLightboxIndex(null);
  }, [deleteIds, deleteImage]);

  // ─── Move ───
  const confirmMove = useCallback(async () => {
    if (!movingIds || !moveTarget) return;
    for (const id of movingIds) await updateImage.mutateAsync({ id, folder: moveTarget });
    toast.success(`Moved ${movingIds.length} image${movingIds.length !== 1 ? "s" : ""} to "${moveTarget}"`);
    setMovingIds(null);
    setMoveTarget("");
    setSelectedIds(new Set());
  }, [movingIds, moveTarget, updateImage]);

  // ─── Story Editor ───
  const openStoryEditor = useCallback((img: GalleryImage) => {
    setEditingStory(img);
    setStoryDraft({ title: img.title || "", story: img.story || "" });
    setStoryTemplate(img.story_style || "cinematic");
  }, []);

  const saveStory = useCallback(async (publish: boolean) => {
    if (!editingStory) return;
    const slug = editingStory.slug ||
      storyDraft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
      `story-${Date.now()}`;
    await updateImage.mutateAsync({
      id: editingStory.id,
      title: storyDraft.title,
      story: storyDraft.story,
      story_style: storyTemplate,
      is_story: true,
      ...(publish ? { published_at: editingStory.published_at ? null : new Date().toISOString(), slug } : {}),
    });
    toast.success(publish ? (editingStory.published_at ? "Story unpublished" : "Story published!") : "Story saved");
    setEditingStory(null);
  }, [editingStory, storyDraft, storyTemplate, updateImage]);

  // ─── Keyboard nav for lightbox ───
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      else if (e.key === "ArrowLeft")  setLightboxIndex((p) => (p !== null && p > 0 ? p - 1 : p));
      else if (e.key === "ArrowRight") setLightboxIndex((p) => (p !== null && p < filteredImages.length - 1 ? p + 1 : p));
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
    // filteredImages.length is stable enough; not putting full array in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex, filteredImages.length]);

  // ─── Stable callbacks for sub-components ───
  const onDelete       = useCallback((img: GalleryImage) => setDeleteIds([img.id]), []);
  const onOpenLightbox = useCallback((i: number) => { setLightboxIndex(i); setLightboxEditMode(false); }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* ─── STICKY HEADER ─── */}
      <div className="bg-surface border-b border-border sticky top-0 z-30 transition-premium">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-4 py-4 border-b border-secondary">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center shadow-lg shadow-primary/20">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black text-foreground tracking-tight leading-none uppercase">Gallery</h1>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                  {images.length} items · {projects.length} sectors · {storiesCount} narratives
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group hidden md:block">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search vault..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 h-9 w-44 rounded-xl bg-secondary border border-transparent text-sm font-bold text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-surface focus:outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setShowCreateProject(true)}
                className="h-9 px-4 rounded-xl border border-border text-muted-foreground font-bold text-xs flex items-center gap-2 hover:border-primary hover:text-primary transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Sector</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-9 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 hover:bg-primary/90 transition-premium shadow-lg shadow-primary/20 active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload
              </button>
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)} />
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex">
            {[
              { id: "quick",    label: "All Records", icon: Layers },
              { id: "projects", label: "Sectors",     icon: FolderOpen },
              { id: "stories",  label: "Narratives",  icon: Film },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setMode(tab.id as GalleryMode); setSelectedProject(null); setSelectedIds(new Set()); }}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-premium",
                  mode === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.id === "stories" && storiesCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[9px] font-black">
                    {storiesCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── UPLOAD PROGRESS TOAST ─── */}
      <AnimatePresence>
        {uploadQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 z-[300] w-68 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl shadow-black/8 p-4 space-y-2.5"
          >
            <div className="flex justify-between mb-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Uploading</p>
              <p className="text-[10px] font-bold text-[#2563EB] uppercase">→ {pendingUploadFolder}</p>
            </div>
            {uploadQueue.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-semibold text-[#111827] truncate max-w-[170px]">{item.name}</p>
                  <span className={cn("text-[10px] font-bold", item.error ? "text-red-400" : item.done ? "text-emerald-500" : "text-[#9CA3AF]")}>
                    {item.error ? "✗" : item.done ? "✓" : `${item.progress}%`}
                  </span>
                </div>
                <div className="h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563EB] rounded-full transition-all duration-300" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 pt-6 pb-32">

        {/* Bulk actions bar */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="mb-5 flex items-center gap-3 p-3 px-5 bg-foreground rounded-2xl shadow-xl shadow-foreground/10"
            >
              <CheckSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-background">{selectedIds.size} SELECTED</span>
              <button className="text-[10px] font-black uppercase text-muted-foreground hover:text-background ml-2 transition-colors tracking-widest" onClick={selectAll}>
                ALL ({filteredImages.length})
              </button>
              <div className="flex-1" />
              <button onClick={() => setMovingIds(Array.from(selectedIds))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background/10 text-background text-xs font-bold hover:bg-background/20 transition-colors">
                <Move className="w-3.5 h-3.5" /> Move
              </button>
              <button onClick={() => setDeleteIds(Array.from(selectedIds))}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-destructive/20 text-destructive-foreground text-xs font-bold hover:bg-destructive/30 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Erase
              </button>
              <button onClick={clearSelect} className="w-8 h-8 rounded-xl bg-background/5 text-background/40 hover:text-background flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <AnimatePresence>
            {/* ─── QUICK GALLERY TAB ─── */}
            {mode === "quick" && (
              <motion.div key="quick" variants={TAB_VARIANTS} initial="hidden" animate="visible" exit="exit">
                {/* Filters + view toggle */}
                <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
                  <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-xl flex-wrap">
                    {([
                      { id: "all",        label: "Vault",      icon: Layers },
                      { id: "this-month", label: "Monthly",    icon: Clock  },
                      { id: "untagged",   label: "Untagged",   icon: Tag    },
                      { id: "stories",    label: "Narratives", icon: Film   },
                    ] as { id: QuickFilter; label: string; icon: any }[]).map((f) => (
                      <button key={f.id} onClick={() => setQuickFilter(f.id)}
                        className={cn("flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-premium",
                          quickFilter === f.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
                        <f.icon className="w-3 h-3" />{f.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1 p-1 bg-surface border border-border rounded-xl">
                    {([{ id: "masonry", icon: LayoutGrid }, { id: "grid", icon: Grid3X3 }] as { id: ViewMode; icon: any }[]).map((v) => (
                      <button key={v.id} onClick={() => setViewMode(v.id)}
                        className={cn("p-1.5 rounded-lg transition-premium", viewMode === v.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
                        <v.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  onDrop={(e) => handleDrop(e, pendingUploadFolder)}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                  onDragLeave={() => setIsDraggingOver(false)}
                >
                  {isDraggingOver && (
                    <div className="fixed inset-0 z-[150] bg-[#2563EB]/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                      <div className="bg-white border-2 border-dashed border-[#2563EB] rounded-3xl p-16 text-center shadow-2xl">
                        <Upload className="w-12 h-12 text-[#2563EB] mx-auto mb-4 animate-bounce" />
                        <p className="text-2xl font-black text-[#0F172A]">Drop to upload</p>
                        <p className="text-sm text-[#6B7280] mt-2">→ {pendingUploadFolder}</p>
                      </div>
                    </div>
                  )}
                  {filteredImages.length === 0
                    ? <EmptyState filter={quickFilter} onUpload={() => fileInputRef.current?.click()} />
                    : <ImageGrid
                        images={filteredImages}
                        viewMode={viewMode}
                        selectedIds={selectedIds}
                        onToggleSelect={toggleSelect}
                        onOpenLightbox={onOpenLightbox}
                        onAddToStory={openStoryEditor}
                        onDelete={onDelete}
                      />
                  }
                </div>
              </motion.div>
            )}

            {/* ─── PROJECTS TAB ─── */}
            {mode === "projects" && (
              <motion.div key="projects" variants={TAB_VARIANTS} initial="hidden" animate="visible" exit="exit">
                {!selectedProject ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {/* New Project card */}
                    <button
                      onClick={() => setShowCreateProject(true)}
                      className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#2563EB] hover:bg-blue-50/30 transition-colors min-h-[220px] group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] group-hover:bg-[#2563EB]/10 flex items-center justify-center transition-colors">
                        <FolderPlus className="w-6 h-6 text-[#9CA3AF] group-hover:text-[#2563EB] transition-colors" />
                      </div>
                      <p className="text-sm font-bold text-[#9CA3AF] group-hover:text-[#2563EB] transition-colors">New Project</p>
                    </button>

                    {projects.length === 0 && (
                      <div className="col-span-3 py-24 text-center rounded-2xl border-2 border-dashed border-[#E5E7EB]">
                        <FolderOpen className="w-14 h-14 text-[#E5E7EB] mx-auto mb-4" />
                        <h3 className="text-xl font-black text-[#9CA3AF]">No Projects Yet</h3>
                        <p className="text-sm text-[#D1D5DB] mt-2">Create your first project to organise photos</p>
                      </div>
                    )}

                    {projects.map((proj) => (
                      <ProjectCard
                        key={proj.name}
                        proj={proj}
                        onClick={() => { setSelectedProject(proj.name); setPendingUploadFolder(proj.name); }}
                      />
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <button onClick={() => { setSelectedProject(null); setPendingUploadFolder("general"); }}
                        className="flex items-center gap-2 text-xs font-bold text-[#6B7280] hover:text-[#111827] transition-colors">
                        <ChevronLeft className="w-4 h-4" />Projects
                      </button>
                      <span className="text-[#E5E7EB]">/</span>
                      <h2 className="text-xl font-black text-[#0F172A] capitalize tracking-tight">{selectedProject}</h2>
                      <span className="text-xs text-[#9CA3AF] font-bold ml-1">{filteredImages.length} photos</span>
                      <div className="flex-1" />
                      <button onClick={() => fileInputRef.current?.click()}
                        className="h-9 px-4 rounded-xl bg-[#2563EB] text-white font-bold text-xs flex items-center gap-2 hover:bg-[#1D4ED8] transition-colors">
                        <Plus className="w-3.5 h-3.5" />Add Photos
                      </button>
                    </div>
                    <div onDrop={(e) => handleDrop(e, selectedProject)} onDragOver={(e) => e.preventDefault()}>
                      {filteredImages.length === 0 ? (
                        <div className="py-28 text-center rounded-3xl border-2 border-dashed border-[#E5E7EB] cursor-pointer hover:border-[#2563EB] transition-colors"
                          onClick={() => fileInputRef.current?.click()}>
                          <Upload className="w-10 h-10 text-[#E5E7EB] mx-auto mb-4" />
                          <p className="text-base font-bold text-[#9CA3AF]">Drop images here or click to upload</p>
                        </div>
                      ) : (
                        <ImageGrid
                          images={filteredImages} viewMode="masonry"
                          selectedIds={selectedIds} onToggleSelect={toggleSelect}
                          onOpenLightbox={onOpenLightbox} onAddToStory={openStoryEditor} onDelete={onDelete}
                        />
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── STORIES TAB ─── */}
            {mode === "stories" && (
              <motion.div key="stories" variants={TAB_VARIANTS} initial="hidden" animate="visible" exit="exit">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-[#6B7280] font-medium">{filteredImages.length} stories</p>
                  <button onClick={() => { setMode("quick"); toast.info("Hover an image and click 'Story'"); }}
                    className="h-9 px-4 rounded-xl bg-[#F97316] text-white font-bold text-xs flex items-center gap-2 hover:bg-[#EA580C] transition-colors shadow-md shadow-orange-500/20">
                    <Sparkles className="w-3.5 h-3.5" />Create Story
                  </button>
                </div>
                {filteredImages.length === 0 ? (
                  <div className="py-32 text-center rounded-3xl border-2 border-dashed border-[#E5E7EB]">
                    <Film className="w-14 h-14 text-[#E5E7EB] mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-[#9CA3AF]">No Stories Yet</h3>
                    <p className="text-sm text-[#D1D5DB] mt-2 max-w-xs mx-auto">Transform photos into cinematic narratives</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredImages.map((img, i) => (
                      <StoryCard key={img.id} img={img} index={i}
                        onEdit={openStoryEditor} onDelete={onDelete} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* ─── LIGHTBOX ─── */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) setLightboxIndex(null); }}
          >
            {/* Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button onClick={() => setLightboxEditMode((v) => !v)}
                className={cn("h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors",
                  lightboxEditMode ? "bg-[#2563EB] text-white" : "bg-white/10 text-white border border-white/10 hover:bg-white/20")}>
                <Pencil className="w-3.5 h-3.5 inline mr-1.5" />{lightboxEditMode ? "Done" : "Edit"}
              </button>
              <button onClick={() => setDeleteIds([filteredImages[lightboxIndex].id])}
                className="h-9 w-9 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors border border-red-500/20">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => setLightboxIndex(null)}
                className="h-9 w-9 rounded-xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav arrows */}
            <button disabled={lightboxIndex === 0} onClick={() => setLightboxIndex((p) => p! - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-20 z-10">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button disabled={lightboxIndex === filteredImages.length - 1} onClick={() => setLightboxIndex((p) => p! + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-20 z-10">
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Image + Edit panel */}
            <div className="w-full h-full max-w-7xl mx-auto px-16 py-16 flex flex-col md:flex-row gap-6 items-center justify-center">
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex items-center justify-center max-h-[80vh]"
              >
                <img src={filteredImages[lightboxIndex].url} alt=""
                  className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl" />
              </motion.div>

              <AnimatePresence>
                {lightboxEditMode && (
                  <motion.div
                    initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 14 }}
                    transition={{ duration: 0.15 }}
                    className="w-72 bg-[#111827] border border-white/10 rounded-2xl p-6 shrink-0 space-y-5"
                  >
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Image Details</h3>
                    <div>
                      <Label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Caption</Label>
                      <Input
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-10 text-sm"
                        value={lightboxCaption}
                        onChange={(e) => setLightboxCaption(e.target.value)}
                        onBlur={() => updateImage.mutate({ id: filteredImages[lightboxIndex].id, caption: lightboxCaption })}
                        placeholder="Add a caption..."
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Project</Label>
                      <select
                        className="mt-1.5 w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl h-10 px-3 focus:outline-none focus:border-[#2563EB] capitalize"
                        value={lightboxFolder}
                        onChange={(e) => {
                          setLightboxFolder(e.target.value);
                          updateImage.mutate({ id: filteredImages[lightboxIndex].id, folder: e.target.value });
                        }}
                      >
                        <option value="general" className="bg-[#111827]">general</option>
                        {projectNames.filter((n) => n !== "general").map((name) => (
                          <option key={name} value={name} className="bg-[#111827] capitalize">{name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 pt-1">
                      <button onClick={() => { openStoryEditor(filteredImages[lightboxIndex]); setLightboxIndex(null); }}
                        className="w-full h-10 rounded-xl bg-[#F97316] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#EA580C] transition-colors flex items-center justify-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" />Create Story
                      </button>
                      <button onClick={() => { setDeleteIds([filteredImages[lightboxIndex].id]); setLightboxIndex(null); }}
                        className="w-full h-10 rounded-xl bg-red-500/10 text-red-400 font-bold text-xs uppercase tracking-wider hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
                        <Trash2 className="w-3.5 h-3.5" />Delete
                      </button>
                    </div>
                    <div className="pt-4 border-t border-white/5 text-[10px] text-white/20 font-bold">
                      <p>Uploaded {new Date(filteredImages[lightboxIndex].created_at).toLocaleDateString()}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dot nav */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {filteredImages.length <= 20 && filteredImages.map((_, i) => (
                <button key={i} onClick={() => setLightboxIndex(i)}
                  className={cn("rounded-full transition-all", i === lightboxIndex ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60")} />
              ))}
              {filteredImages.length > 20 && (
                <span className="text-xs text-white/30 font-bold">{lightboxIndex + 1} / {filteredImages.length}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CREATE PROJECT DIALOG ─── */}
      <Dialog open={showCreateProject} onOpenChange={(o) => { if (!o) setShowCreateProject(false); }}>
        <DialogContent className="sm:max-w-lg rounded-3xl border-[#E5E7EB] p-0 overflow-hidden">
          <div className="p-8">
            <DialogHeader className="mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center">
                  <FolderPlus className="w-5 h-5 text-white" />
                </div>
                <DialogTitle className="text-xl font-black tracking-tight">Create Project</DialogTitle>
              </div>
              <DialogDescription className="text-sm text-[#6B7280]">
                Organize your photos into a creative project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-2 block">Project Name *</Label>
                <Input
                  autoFocus
                  placeholder="e.g. Summer 2025, Brand Shoot..."
                  value={newProject.name}
                  onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
                  className="h-12 rounded-xl"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-2 block">Description</Label>
                <Input
                  placeholder="What's this project about?"
                  value={newProject.description}
                  onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3 block">Theme Color</Label>
                <div className="flex gap-2">
                  {PROJECT_COLORS.map((color) => (
                    <button key={color} onClick={() => setNewProject((p) => ({ ...p, color }))}
                      className={cn("w-8 h-8 rounded-xl transition-transform", newProject.color === color ? "scale-110 ring-2 ring-offset-2 ring-[#111827]" : "hover:scale-105")}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="px-8 py-5 bg-[#F8FAFC] border-t border-[#F1F5F9] flex gap-3">
            <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => setShowCreateProject(false)}>Cancel</Button>
            <Button className="flex-1 h-11 rounded-xl font-bold" style={{ backgroundColor: newProject.color }} onClick={handleCreateProject}>
              Create Project <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── STORY EDITOR ─── */}
      <AnimatePresence>
        {editingStory && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.97, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 16 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-5xl bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-7 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Feather className="w-4 h-4 text-[#F97316]" />
                  <span className="text-xs font-black uppercase tracking-widest text-white/50">Story Editor</span>
                </div>
                <div className="flex items-center gap-2">
                  <select value={storyTemplate} onChange={(e) => setStoryTemplate(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl px-3 h-9 focus:outline-none">
                    {STORY_TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#0F172A]">{t.label}</option>
                    ))}
                  </select>
                  <button onClick={() => setEditingStory(null)}
                    className="w-9 h-9 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col md:flex-row" style={{ minHeight: 440, maxHeight: "70vh" }}>
                <div className="w-full md:w-2/5 bg-black flex items-center justify-center p-6 relative overflow-hidden">
                  <img src={editingStory.url} alt="" className={cn(
                    "max-w-full max-h-[340px] object-contain",
                    storyTemplate === "cinematic" && "brightness-90 contrast-110 rounded-lg",
                    storyTemplate === "polaroid" && "p-3 pb-10 bg-white shadow-2xl",
                    storyTemplate === "poetic" && "rounded-full saturate-50",
                    storyTemplate === "documentary" && "brightness-85 saturate-80",
                    storyTemplate === "travel" && "rounded-2xl"
                  )} />
                  {(storyTemplate === "cinematic" || storyTemplate === "documentary") && (
                    <>
                      <div className="absolute top-0 inset-x-0 h-8 bg-black pointer-events-none" />
                      <div className="absolute bottom-0 inset-x-0 h-8 bg-black pointer-events-none" />
                    </>
                  )}
                </div>
                <div className="flex-1 p-7 flex flex-col overflow-y-auto">
                  <input type="text" placeholder="Story title..."
                    value={storyDraft.title}
                    onChange={(e) => setStoryDraft((d) => ({ ...d, title: e.target.value }))}
                    className="text-2xl font-black text-white bg-transparent focus:outline-none placeholder:text-white/20 tracking-tight mb-4" />
                  <div className="w-10 h-0.5 bg-[#F97316] mb-5" />
                  <textarea placeholder="Tell the story behind this moment..."
                    value={storyDraft.story}
                    onChange={(e) => setStoryDraft((d) => ({ ...d, story: e.target.value }))}
                    className="flex-1 bg-transparent text-white/60 font-serif text-base leading-[1.9] resize-none focus:outline-none placeholder:text-white/20 min-h-[140px]" />
                  <div className="pt-5 border-t border-white/10 flex gap-3 mt-auto">
                    <button onClick={() => saveStory(false)}
                      className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 hover:text-white transition-colors">
                      Save Draft
                    </button>
                    <button onClick={() => saveStory(true)}
                      className="flex-1 h-11 rounded-xl bg-[#F97316] text-white font-bold text-sm hover:bg-[#EA580C] transition-colors flex items-center justify-center gap-2">
                      {editingStory.published_at ? <><Lock className="w-4 h-4" />Unpublish</> : <><Globe className="w-4 h-4" />Publish</>}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MOVE DIALOG ─── */}
      <Dialog open={!!movingIds} onOpenChange={(o) => !o && setMovingIds(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Move to Project</DialogTitle>
            <DialogDescription>Move {movingIds?.length} image{movingIds?.length !== 1 ? "s" : ""} to another project</DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-2 block">Select Project</Label>
            <select className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium focus:outline-none focus:border-[#2563EB] capitalize"
              value={moveTarget} onChange={(e) => setMoveTarget(e.target.value)}>
              <option value="">-- Select --</option>
              <option value="general">general</option>
              {projectNames.filter((n) => n !== "general").map((name) => (
                <option key={name} value={name} className="capitalize">{name}</option>
              ))}
            </select>
          </div>
          <DialogFooter className="mt-4 flex gap-3">
            <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => setMovingIds(null)}>Cancel</Button>
            <Button className="flex-1 h-11 rounded-xl" onClick={confirmMove} disabled={!moveTarget}>Move</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE CONFIRM ─── */}
      <Dialog open={!!deleteIds} onOpenChange={(o) => !o && setDeleteIds(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="text-center items-center pb-2">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-black tracking-tight">
              Delete {deleteIds?.length === 1 ? "Image" : `${deleteIds?.length} Images`}?
            </DialogTitle>
            <DialogDescription className="text-sm text-[#6B7280] max-w-xs mx-auto">
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => setDeleteIds(null)}>Cancel</Button>
            <Button className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Pure memoized sub-components ───

const EmptyState = memo(function EmptyState({ filter, onUpload }: { filter: QuickFilter; onUpload: () => void }) {
  const msgs: Record<QuickFilter, { title: string; desc: string; icon: any }> = {
    all:          { title: "Vault Empty",       desc: "No artifacts indexed. Begin by uploading records to your vault.", icon: Camera },
    "this-month": { title: "Sector Clear",      desc: "No artifacts detected for this temporal cycle.", icon: Clock  },
    untagged:     { title: "Metadata Complete", desc: "All artifact headers have been verified and tagged.", icon: Tag    },
    stories:      { title: "Narrative Void",    desc: "Transform frozen memories into cinematic narratives.", icon: Film   },
    favorites:    { title: "Zero Favorites",    desc: "Mark your most critical memories as narratives to see them here.", icon: Heart  },
  };
  const m = msgs[filter];
  return (
    <div className="flex flex-col items-center justify-center py-28 rounded-3xl border border-border bg-surface shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-pointer group" onClick={onUpload}>
      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-8 border border-border group-hover:scale-105 transition-transform duration-300 shadow-inner">
        <m.icon className="w-10 h-10 text-muted-foreground opacity-40" />
      </div>
      <h3 className="text-2xl font-black text-foreground tracking-tight mb-2 uppercase">{m.title}</h3>
      <p className="text-sm text-muted-foreground text-center font-serif max-w-sm mx-auto mb-10 leading-relaxed px-6">{m.desc}</p>
      <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
        <span className="flex items-center gap-2"><Star className="w-3.5 h-3.5" />Sectors</span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span className="flex items-center gap-2"><Film className="w-3.5 h-3.5" />Narratives</span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" />Vault Core</span>
      </div>
    </div>
  );
});

function LoadingSkeleton() {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="break-inside-avoid">
          <Skeleton className="w-full rounded-2xl bg-[#F1F5F9]" style={{ height: `${160 + (i % 4) * 55}px` }} />
        </div>
      ))}
    </div>
  );
}

const ProjectCard = memo(function ProjectCard({ proj, onClick }: { proj: ProjectMeta; onClick: () => void }) {
  return (
    <div className="group bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden cursor-pointer hover:border-[#2563EB] hover:shadow-lg transition-all duration-200" onClick={onClick}>
      <div className="aspect-[4/3] bg-[#F8FAFC] overflow-hidden relative">
        {proj.cover ? (
          <img src={proj.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderOpen className="w-10 h-10 text-[#E5E7EB]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
      <div className="p-4">
        <h3 className="font-black text-[#0F172A] text-sm tracking-tight capitalize">{proj.name}</h3>
        <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-bold mt-1">
          {proj.count} {proj.count === 1 ? "photo" : "photos"}
        </p>
      </div>
    </div>
  );
});

interface ImageGridProps {
  images: GalleryImage[];
  viewMode: ViewMode;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onOpenLightbox: (i: number) => void;
  onAddToStory: (img: GalleryImage) => void;
  onDelete: (img: GalleryImage) => void;
}

// Memoized so parent state changes (e.g. tooltip hovering) don't re-render the whole grid
const ImageGrid = memo(function ImageGrid({
  images, viewMode, selectedIds, onToggleSelect, onOpenLightbox, onAddToStory, onDelete,
}: ImageGridProps) {
  return (
    <div className={cn(
      viewMode === "masonry"
        ? "columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5"
        : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
    )}>
      {images.map((img, index) => (
        <ImageCard
          key={img.id}
          img={img}
          index={index}
          viewMode={viewMode}
          isSelected={selectedIds.has(img.id)}
          hasSelection={selectedIds.size > 0}
          onToggleSelect={onToggleSelect}
          onOpenLightbox={onOpenLightbox}
          onAddToStory={onAddToStory}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});

interface ImageCardProps {
  img: GalleryImage;
  index: number;
  viewMode: ViewMode;
  isSelected: boolean;
  hasSelection: boolean;
  onToggleSelect: (id: string) => void;
  onOpenLightbox: (i: number) => void;
  onAddToStory: (img: GalleryImage) => void;
  onDelete: (img: GalleryImage) => void;
}

// Each card is individually memoized — only re-renders if its own props change
const ImageCard = memo(function ImageCard({
  img, index, viewMode, isSelected, hasSelection,
  onToggleSelect, onOpenLightbox, onAddToStory, onDelete,
}: ImageCardProps) {
  // Only animate the first 8 items — beyond that, just appear instantly
  const shouldAnimate = index < 8;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-secondary cursor-pointer border border-border transition-premium",
        viewMode === "masonry" ? "break-inside-avoid" : "aspect-square",
        isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:shadow-xl hover:shadow-black/8",
      )}
      style={{
        opacity: shouldAnimate ? undefined : 1,
        willChange: "transform, opacity",
        // Simple entry animation
        animation: shouldAnimate ? `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both ${index * 40}ms` : undefined,
      }}
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey || hasSelection) onToggleSelect(img.id);
        else onOpenLightbox(index);
      }}
    >
      <img
        src={img.url}
        alt={img.caption || ""}
        loading="lazy"
        decoding="async"
        className={cn(
          "w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]",
          viewMode === "masonry" ? "h-auto" : "h-full"
        )}
      />

      {/* Checkbox */}
      <div
        className={cn(
          "absolute top-2.5 left-2.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-150 z-10",
          isSelected
            ? "bg-[#2563EB] border-[#2563EB] opacity-100"
            : "bg-white/80 border-white/60 backdrop-blur-sm opacity-0 group-hover:opacity-100"
        )}
        onClick={(e) => { e.stopPropagation(); onToggleSelect(img.id); }}
      >
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Story badge */}
      {img.is_story && (
        <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-xl bg-white/90 backdrop-blur-sm border border-white/60 flex items-center justify-center z-10">
          <Film className="w-3.5 h-3.5 text-[#F97316]" />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
        <p className="text-white font-bold text-xs truncate mb-2">{img.caption || img.title || "Untitled"}</p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToStory(img); }}
            className="flex-1 h-7 rounded-lg bg-white/20 hover:bg-[#F97316] text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-sm transition-colors flex items-center justify-center gap-1"
          >
            <Feather className="w-2.5 h-2.5" />Story
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(img); }}
            className="h-7 w-7 rounded-lg bg-red-500/30 hover:bg-red-500/70 text-white backdrop-blur-sm transition-colors flex items-center justify-center"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onOpenLightbox(index); }}
            className="h-7 w-7 rounded-lg bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-colors flex items-center justify-center"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
});

const StoryCard = memo(function StoryCard({
  img, index, onEdit, onDelete,
}: { img: GalleryImage; index: number; onEdit: (img: GalleryImage) => void; onDelete: (img: GalleryImage) => void }) {
  return (
    <div
      className="group bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-black/6 transition-shadow duration-200 cursor-pointer"
      style={{ animation: index < 6 ? `fadeInUp 0.3s ease both ${index * 50}ms` : undefined }}
      onClick={() => onEdit(img)}
    >
      <div className="aspect-[16/9] relative overflow-hidden bg-[#0F172A]">
        <img src={img.url} alt="" loading="lazy" decoding="async"
          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute top-3 right-3">
          {img.published_at
            ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[9px] font-black uppercase tracking-wider backdrop-blur-sm"><Globe className="w-2.5 h-2.5" />Public</span>
            : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20"><Lock className="w-2.5 h-2.5" />Draft</span>
          }
        </div>
      </div>
      <div className="p-5">
        <h4 className="font-black text-lg text-[#0F172A] tracking-tight mb-1.5 line-clamp-1">{img.title || "Untitled Story"}</h4>
        <p className="text-sm text-[#6B7280] font-serif italic line-clamp-2 leading-relaxed">{img.story || "No story yet — click to write."}</p>
        <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            {new Date(img.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <div className="flex items-center gap-3">
            {img.published_at && (
              <a href={`/gallery/story/${img.id}`} target="_blank" onClick={(e) => e.stopPropagation()}
                className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] hover:underline flex items-center gap-1">
                <Eye className="w-3 h-3" />View
              </a>
            )}
            <button onClick={(e) => { e.stopPropagation(); onDelete(img); }}
              className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 flex items-center gap-1">
              <Trash2 className="w-3 h-3" />Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
