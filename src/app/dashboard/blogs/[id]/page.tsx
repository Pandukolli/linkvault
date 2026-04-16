"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBlogs } from "@/hooks/use-blogs";
import { TiptapEditor } from "@/components/tiptap-editor";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, ChevronLeft, Settings2, Globe, FileEdit, Trash2,
  ChevronRight, X as XIcon, Lock, Save, CheckCircle2, UploadCloud,
  Tag, Clock, Hash, BookMarked, CalendarClock, LayoutTemplate,
  Eye, EyeOff, List, RotateCcw, User as UserIcon, Image as ImageIcon,
  Globe2, FileText
} from "lucide-react";
import { MediaPicker } from "@/components/media-picker";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CATEGORIES = [
  "Personal Essay", "Technical Deep Dive", "Tutorial / How-to",
  "Story / Narrative", "Review", "Newsletter", "Journal"
];

interface VersionSnapshot {
  timestamp: number;
  label: string;
  content: any;
  wordCount: number;
}

function wordCount(content: any): number {
  if (!content) return 0;
  const getText = (node: any): string => {
    if (!node) return "";
    if (node.type === "text") return node.text || "";
    if (node.content) return node.content.map(getText).join(" ");
    return "";
  };
  const text = getText(content);
  return text.split(/\s+/).filter(Boolean).length;
}

function extractHeadings(content: any): { level: number; text: string }[] {
  if (!content) return [];
  const headings: { level: number; text: string }[] = [];
  const walk = (node: any) => {
    if (!node) return;
    if (node.type === "heading" && node.attrs?.level) {
      const text = (node.content || []).map((n: any) => n.text || "").join("");
      if (text) headings.push({ level: node.attrs.level, text });
    }
    (node.content || []).forEach(walk);
  };
  (content.content || []).forEach(walk);
  return headings;
}

export default function BlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { blogs, isLoading, updateBlog, deleteBlog } = useBlogs();

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"meta" | "seo" | "toc" | "history">("meta");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Meta state (local before save)
  const [localMeta, setLocalMeta] = useState<any>({});

  // Live stats
  const [liveWordCount, setLiveWordCount] = useState(0);
  const [headings, setHeadings] = useState<{ level: number; text: string }[]>([]);

  // Version history (in-memory, last 5)
  const versionHistoryRef = useRef<VersionSnapshot[]>([]);

  // Tag input
  const [tagInput, setTagInput] = useState("");

  // Schedule
  const [scheduleDate, setScheduleDate] = useState("");

  const activeBlog = blogs.find((b) => b.id === id);

  useEffect(() => {
    if (!activeBlog && !isLoading) {
      router.push("/dashboard/blogs");
    } else if (activeBlog && Object.keys(localMeta).length === 0) {
      setLocalMeta(activeBlog.content?.meta || {});
      const wc = wordCount(activeBlog.content);
      setLiveWordCount(wc);
      setHeadings(extractHeadings(activeBlog.content));
    }
  }, [activeBlog, isLoading, router]);

  if (!activeBlog) return null;

  const meta = activeBlog.content?.meta || {};
  const tags: string[] = localMeta.tags || meta.tags || [];
  const readingTime = Math.max(1, Math.ceil(liveWordCount / 200));

  const handleLocalChange = (key: string, value: any) => {
    setLocalMeta((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleContentUpdate = (content: any) => {
    // Debounced by TipTap editor (800ms). We just save here.
    setIsSaving(true);
    const wc = wordCount(content);
    setLiveWordCount(wc);
    setHeadings(extractHeadings(content));

    const updatedMeta = { ...meta, ...localMeta, wordCount: wc, readingTime: `${Math.max(1, Math.ceil(wc / 200))}` };
    const finalContent = { ...content, meta: updatedMeta };

    // Push version snapshot
    versionHistoryRef.current = [
      { timestamp: Date.now(), label: new Date().toLocaleTimeString(), content: finalContent, wordCount: wc },
      ...versionHistoryRef.current.slice(0, 4),
    ];

    updateBlog.mutate({ id: activeBlog.id, content: finalContent }, {
      onSettled: () => setTimeout(() => setIsSaving(false), 600),
    });
  };

  const saveSettings = () => {
    setIsSaving(true);
    const currentContent = activeBlog.content || { type: "doc", content: [] };
    const updatedMeta = {
      ...meta,
      ...localMeta,
      wordCount: liveWordCount,
      readingTime: `${readingTime}`,
      scheduledAt: scheduleDate || meta.scheduledAt,
    };
    const updatedContent = { ...currentContent, meta: updatedMeta };
    updateBlog.mutate({ id: activeBlog.id, content: updatedContent, seo_title: localMeta.seoTitle || meta.seoTitle, seo_description: localMeta.excerpt || meta.excerpt }, {
      onSuccess: () => { toast.success("Settings saved"); setIsSaving(false); },
    });
  };

  const handlePublish = () => {
    saveSettings();
    updateBlog.mutate({ id: activeBlog.id, status: activeBlog.status === "draft" ? "published" : "draft" });
  };

  const restoreVersion = (snapshot: VersionSnapshot) => {
    updateBlog.mutate({ id: activeBlog.id, content: snapshot.content }, {
      onSuccess: () => toast.success("Version restored"),
    });
  };

  const saveAsTemplate = () => {
    const templates = JSON.parse(localStorage.getItem("vaultOS:blog_templates") || "[]");
    templates.push({
      id: Date.now(),
      title: activeBlog.title,
      content: activeBlog.content,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem("vaultOS:blog_templates", JSON.stringify(templates.slice(-10)));
    toast.success("Saved as template!");
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      handleLocalChange("tags", [...tags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    handleLocalChange("tags", tags.filter((t: string) => t !== tag));
  };

  const slug = activeBlog.slug || "";
  const seoTitle = localMeta.seoTitle || meta.seoTitle || activeBlog.title || "";
  const seoDesc = localMeta.excerpt || meta.excerpt || activeBlog.seo_description || "";

  return (
    <div className="h-screen bg-[#0A0B0F] flex flex-col overflow-hidden">

      {/* Top Navbar */}
      <div className="h-16 flex-shrink-0 bg-[#0A0B0F]/80 backdrop-blur-3xl border-b border-white/5 px-6 flex items-center justify-between z-50">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/blogs")}
            className="flex items-center gap-2 px-3 h-9 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all border border-white/5 text-[10px] font-black uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" />
            Library
          </button>
          <div className="h-5 w-px bg-white/5" />

          {/* Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
            activeBlog.status === "published"
              ? "bg-[#06B6D4]/10 border-[#06B6D4]/20 text-[#06B6D4]"
              : "bg-white/5 border-white/5 text-white/30"
          }`}>
            {activeBlog.status === "published" ? <Globe className="w-3 h-3" /> : <FileEdit className="w-3 h-3" />}
            {activeBlog.status}
          </div>

          {/* Privacy indicator */}
          <div className="flex items-center gap-1.5 text-[9px] font-black text-white/20 uppercase tracking-widest">
            <Lock className="w-3 h-3 text-[#06B6D4]/50" />
            Private
          </div>

          {/* Save indicator */}
          <div className="flex items-center gap-2 text-white/20 ml-2 text-[9px] font-black uppercase tracking-[0.3em]">
            {isSaving
              ? <><Save className="w-3 h-3 animate-pulse text-[#06B6D4]" /> Saving...</>
              : <><CheckCircle2 className="w-3 h-3 text-white/20" /> Saved</>
            }
          </div>
        </div>

        {/* Center — live word count */}
        <div className="hidden md:flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-white/20">
          <span className="flex items-center gap-2">
            <FileText className="w-3 h-3" />
            {liveWordCount.toLocaleString()} words
          </span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {readingTime} min read
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            title={showPreview ? "Hide Preview" : "Show Live Preview"}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              showPreview
                ? "bg-[#06B6D4]/10 border-[#06B6D4]/20 text-[#06B6D4]"
                : "border-white/5 text-white/30 hover:text-white hover:bg-white/5"
            }`}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden lg:inline">{showPreview ? "Hide" : "Preview"}</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${showPreview ? "rotate-180" : ""}`} />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              showSettings
                ? "bg-white/10 border-white/20 text-white"
                : "border-white/5 text-white/30 hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden lg:inline">Config</span>
          </button>

          <div className="h-5 w-px bg-white/10" />

          {/* Publish toggle */}
          <button
            onClick={handlePublish}
            className={`h-9 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
              activeBlog.status === "draft"
                ? "bg-[#06B6D4] text-black shadow-[#06B6D4]/20 hover:bg-[#06B6D4]/90"
                : "bg-white/10 text-white border border-white/10 hover:bg-white/5"
            }`}
          >
            {activeBlog.status === "draft" ? (
              <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Publish</span>
            ) : (
              <span className="flex items-center gap-2"><FileEdit className="w-3.5 h-3.5" /> Unpublish</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Editor Pane */}
        <motion.div
          className="flex flex-col overflow-hidden bg-[#0A0B0F]"
          animate={{ width: showPreview ? "50%" : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
            <div className="max-w-3xl mx-auto px-8 md:px-16 py-16">
              {/* Title Input */}
              <input
                type="text"
                value={activeBlog.title || ""}
                onChange={(e) => updateBlog.mutate({ id: activeBlog.id, title: e.target.value })}
                className="w-full text-5xl md:text-6xl font-black tracking-tighter bg-transparent border-none outline-none mb-10 placeholder:text-white/5 text-white leading-tight"
                placeholder="Post Title..."
              />
              <TiptapEditor
                content={activeBlog.content}
                onUpdate={handleContentUpdate}
                placeholder="Start writing your story..."
                autofocus
                debounceMs={800}
              />
            </div>
          </div>

          {/* Status Bar */}
          <div className="h-9 border-t border-white/5 bg-[#0A0B0F] flex items-center px-6 justify-between text-[9px] font-black uppercase tracking-[0.3em] text-white/15">
            <div className="flex gap-6">
              <span>{liveWordCount.toLocaleString()} words</span>
              <span>{readingTime} min read</span>
              {headings.length > 0 && <span>{headings.length} headings</span>}
            </div>
            <div>
              <span className="text-white/30">{activeBlog.title?.length || 0}</span> / 80 chars
            </div>
          </div>
        </motion.div>

        {/* Live Preview Pane */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col border-l border-white/5 bg-[#fafafa] relative overflow-hidden"
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-black/5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 border border-black/5">
                Live Preview
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar py-16 px-10">
                <div className="max-w-xl mx-auto">
                  {meta.coverImage && (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden mb-10 shadow-xl">
                      <img src={meta.coverImage} className="w-full h-full object-cover" alt="Cover" />
                    </div>
                  )}
                  <h1 className="text-4xl font-black tracking-tight text-black mb-6 leading-tight">
                    {activeBlog.title || "Untitled"}
                  </h1>
                  <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>{new Date().toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{readingTime} min read</span>
                    <span>·</span>
                    <span>{liveWordCount} words</span>
                  </div>
                  <div className="prose prose-sm prose-slate max-w-none">
                    <TiptapEditor content={activeBlog.content} editable={false} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Sidebar */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ x: 420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="absolute top-0 right-0 bottom-0 w-[400px] bg-[#0D0E14] border-l border-white/5 shadow-2xl z-50 flex flex-col"
            >
              {/* Sidebar header */}
              <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0">
                <h3 className="font-black text-[11px] text-white uppercase tracking-[0.3em]">Blog Config</h3>
                <button onClick={() => setShowSettings(false)} className="text-white/20 hover:text-white transition-colors">
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Bar */}
              <div className="flex border-b border-white/5 flex-shrink-0">
                {([
                  { key: "meta", label: "Meta", icon: FileEdit },
                  { key: "seo", label: "SEO", icon: Globe2 },
                  { key: "toc", label: "TOC", icon: List },
                  { key: "history", label: "History", icon: RotateCcw },
                ] as const).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSettingsTab(key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${
                      settingsTab === key
                        ? "text-[#06B6D4] border-b-2 border-[#06B6D4]"
                        : "text-white/20 hover:text-white/60"
                    }`}
                  >
                    <Icon className="w-3 h-3" /> {label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">

                {/* META TAB */}
                {settingsTab === "meta" && (
                  <>
                    {/* Cover Image */}
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                        <ImageIcon className="w-3 h-3" /> Cover Image
                      </Label>
                      {(localMeta.coverImage || meta.coverImage) ? (
                        <div className="relative group rounded-2xl overflow-hidden">
                          <img src={localMeta.coverImage || meta.coverImage} className="w-full h-32 object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center gap-2 justify-center transition-opacity">
                            <MediaPicker onSelect={(url) => handleLocalChange("coverImage", url)} title="Change Cover" trigger={<button className="px-3 py-1.5 bg-white text-black rounded-lg text-[10px] font-black">Change</button>} />
                            <button onClick={() => handleLocalChange("coverImage", "")} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-black">Remove</button>
                          </div>
                        </div>
                      ) : (
                        <MediaPicker
                          onSelect={(url) => handleLocalChange("coverImage", url)}
                          title="Select Cover Image"
                          trigger={
                            <button className="w-full h-28 rounded-2xl border-2 border-dashed border-white/10 bg-white/3 flex flex-col items-center justify-center gap-2 hover:border-[#06B6D4]/40 transition-colors">
                              <ImageIcon className="w-6 h-6 text-white/10" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Pick from Gallery</span>
                            </button>
                          }
                        />
                      )}
                    </div>

                    {/* Category */}
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Category</Label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleLocalChange("category", cat)}
                            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${
                              (localMeta.category || meta.category) === cat
                                ? "bg-[#06B6D4]/20 border-[#06B6D4]/40 text-[#06B6D4]"
                                : "border-white/5 text-white/20 hover:border-white/10"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                        <Tag className="w-3 h-3" /> Tags
                      </Label>
                      <div className="flex gap-2">
                        <input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                          placeholder="Add tag, press Enter..."
                          className="flex-1 h-9 px-3 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder:text-white/10 outline-none focus:border-[#06B6D4]/30"
                        />
                        <button onClick={addTag} className="h-9 px-3 bg-[#06B6D4]/10 text-[#06B6D4] rounded-xl text-[10px] font-black border border-[#06B6D4]/20">Add</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((t: string) => t && (
                          <span key={t} className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-black text-white/40 uppercase tracking-wider">
                            <Hash className="w-2.5 h-2.5" /> {t}
                            <button onClick={() => removeTag(t)} className="text-white/20 hover:text-red-400 ml-1">×</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Author */}
                    <div className="space-y-3 p-4 rounded-2xl bg-white/3 border border-white/5">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                        <UserIcon className="w-3 h-3" /> Author
                      </Label>
                      <div className="flex items-center gap-3">
                        {(localMeta.authorAvatar || meta.authorAvatar) ? (
                          <img src={localMeta.authorAvatar || meta.authorAvatar} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        ) : (
                          <MediaPicker
                            onSelect={(url) => handleLocalChange("authorAvatar", url)}
                            title="Select Avatar"
                            trigger={
                              <button className="w-10 h-10 rounded-full bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center hover:border-[#06B6D4]/30">
                                <UploadCloud className="w-4 h-4 text-white/20" />
                              </button>
                            }
                          />
                        )}
                        <input
                          value={localMeta.authorName || meta.authorName || ""}
                          onChange={(e) => handleLocalChange("authorName", e.target.value)}
                          placeholder="Author name..."
                          className="flex-1 h-9 px-3 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder:text-white/10 outline-none focus:border-[#06B6D4]/30"
                        />
                      </div>
                      <textarea
                        value={localMeta.authorBio || meta.authorBio || ""}
                        onChange={(e) => handleLocalChange("authorBio", e.target.value)}
                        placeholder="Short bio..."
                        className="w-full h-16 px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder:text-white/10 outline-none focus:border-[#06B6D4]/30 resize-none"
                      />
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Excerpt</Label>
                      <textarea
                        value={localMeta.excerpt || meta.excerpt || activeBlog.seo_description || ""}
                        onChange={(e) => handleLocalChange("excerpt", e.target.value)}
                        placeholder="Brief description for cards and social sharing..."
                        className="w-full h-20 px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder:text-white/10 outline-none focus:border-[#06B6D4]/30 resize-none"
                      />
                    </div>

                    {/* Schedule Publish */}
                    <div className="space-y-3 p-4 rounded-2xl bg-white/3 border border-white/5">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                        <CalendarClock className="w-3 h-3" /> Schedule Publish
                      </Label>
                      <input
                        type="datetime-local"
                        value={scheduleDate || meta.scheduledAt || ""}
                        onChange={(e) => { setScheduleDate(e.target.value); handleLocalChange("scheduledAt", e.target.value); }}
                        className="w-full h-9 px-3 bg-white/5 border border-white/5 rounded-xl text-xs text-white/60 outline-none focus:border-[#06B6D4]/30"
                      />
                      {(scheduleDate || meta.scheduledAt) && (
                        <p className="text-[9px] text-[#06B6D4]/60 font-bold uppercase tracking-wider">
                          Scheduled for {new Date(scheduleDate || meta.scheduledAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Save Template Button */}
                    <button
                      onClick={saveAsTemplate}
                      className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white/60 hover:border-white/10 transition-all"
                    >
                      <LayoutTemplate className="w-3.5 h-3.5" /> Save as Template
                    </button>

                    {/* Save Settings */}
                    <button
                      onClick={saveSettings}
                      className="w-full h-12 rounded-xl bg-[#06B6D4] text-black font-black text-[11px] uppercase tracking-widest hover:bg-[#06B6D4]/90 transition-all"
                    >
                      Save Settings
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setShowDeleteDialog(true)}
                      className="w-full h-10 rounded-xl bg-red-500/10 text-red-400 font-black text-[10px] uppercase tracking-widest border border-red-500/10 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Blog
                    </button>
                  </>
                )}

                {/* SEO TAB */}
                {settingsTab === "seo" && (
                  <>
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">SEO Title</Label>
                      <input
                        value={localMeta.seoTitle || meta.seoTitle || activeBlog.title || ""}
                        onChange={(e) => handleLocalChange("seoTitle", e.target.value)}
                        maxLength={70}
                        placeholder="SEO title (max 70 chars)..."
                        className="w-full h-9 px-3 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder:text-white/10 outline-none focus:border-[#06B6D4]/30"
                      />
                      <div className="text-right text-[9px] text-white/20 font-bold">
                        {(localMeta.seoTitle || meta.seoTitle || activeBlog.title || "").length} / 70
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Meta Description</Label>
                      <textarea
                        value={localMeta.excerpt || meta.excerpt || ""}
                        onChange={(e) => handleLocalChange("excerpt", e.target.value)}
                        maxLength={160}
                        placeholder="Brief description for Google (max 160)..."
                        className="w-full h-20 px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder:text-white/10 outline-none focus:border-[#06B6D4]/30 resize-none"
                      />
                      <div className="text-right text-[9px] text-white/20 font-bold">
                        {(localMeta.excerpt || meta.excerpt || "").length} / 160
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Slug / URL</Label>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 h-9">
                        <Globe className="w-3 h-3 text-white/20 flex-shrink-0" />
                        <span className="text-[10px] text-white/20">/blogs/</span>
                        <input
                          value={activeBlog.slug || ""}
                          onChange={(e) => updateBlog.mutate({ id: activeBlog.id, slug: e.target.value })}
                          className="flex-1 bg-transparent text-xs text-white outline-none font-mono"
                          placeholder="your-url-slug"
                        />
                      </div>
                    </div>

                    {/* Google Preview Card */}
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Google Preview</Label>
                      <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-1">
                        <div className="text-[10px] text-green-700 font-medium">vaultOS.app/blogs/{slug || "your-slug"}</div>
                        <div className="text-base font-semibold text-[#1a0dab] leading-snug line-clamp-1">
                          {seoTitle || "Your Blog Title"}
                        </div>
                        <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {seoDesc || "Your meta description will appear here in search results. Write something engaging."}
                        </div>
                      </div>
                    </div>

                    {/* OG Preview */}
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Open Graph Preview</Label>
                      <div className="rounded-2xl overflow-hidden border border-slate-200">
                        {(localMeta.coverImage || meta.coverImage) && (
                          <img src={localMeta.coverImage || meta.coverImage} className="w-full h-32 object-cover" />
                        )}
                        <div className="p-3 bg-slate-50">
                          <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">vaultOS.app</div>
                          <div className="text-sm font-bold text-slate-800 line-clamp-1">{seoTitle || "Your Title"}</div>
                          <div className="text-xs text-slate-500 line-clamp-2">{seoDesc || "Your description"}</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={saveSettings}
                      className="w-full h-12 rounded-xl bg-[#06B6D4] text-black font-black text-[11px] uppercase tracking-widest hover:bg-[#06B6D4]/90 transition-all"
                    >
                      Save SEO Settings
                    </button>
                  </>
                )}

                {/* TOC TAB */}
                {settingsTab === "toc" && (
                  <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                      <List className="w-3 h-3" /> Table of Contents
                    </Label>
                    {headings.length === 0 ? (
                      <div className="py-12 text-center">
                        <BookMarked className="w-8 h-8 text-white/10 mx-auto mb-4" />
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                          No headings found. Add H1, H2, H3 to generate TOC.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {headings.map((h, i) => (
                          <div
                            key={i}
                            className={`flex items-start gap-2 text-[11px] font-bold text-white/50 hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-xl hover:bg-white/5 ${
                              h.level === 2 ? "ml-4" : h.level === 3 ? "ml-8" : ""
                            }`}
                          >
                            <span className="text-[8px] font-black text-white/20 uppercase mt-0.5">H{h.level}</span>
                            <span className="line-clamp-1">{h.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* HISTORY TAB */}
                {settingsTab === "history" && (
                  <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                      <RotateCcw className="w-3 h-3" /> Version History (last 5)
                    </Label>
                    {versionHistoryRef.current.length === 0 ? (
                      <div className="py-12 text-center">
                        <RotateCcw className="w-8 h-8 text-white/10 mx-auto mb-4" />
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                          No snapshots yet. Versions are saved automatically as you write.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {versionHistoryRef.current.map((v, i) => (
                          <div key={v.timestamp} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all">
                            <div>
                              <div className="text-[10px] font-black text-white/60">{v.label}</div>
                              <div className="text-[9px] text-white/20 mt-0.5">{v.wordCount} words</div>
                            </div>
                            <button
                              onClick={() => restoreVersion(v)}
                              className="px-3 py-1.5 bg-[#06B6D4]/10 text-[#06B6D4] rounded-lg text-[9px] font-black uppercase tracking-wider border border-[#06B6D4]/20 hover:bg-[#06B6D4]/20 transition-all"
                            >
                              Restore
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-[#14151B] border-white/10 text-white">
          <DialogHeader className="text-center items-center pb-2">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-white">Delete Blog</DialogTitle>
            <DialogDescription className="text-sm text-white/40 font-medium max-w-xs mx-auto">
              Permanently delete <span className="font-bold text-white">"{activeBlog.title}"</span>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:flex-row pt-4">
            <button
              className="flex-1 h-12 rounded-xl border border-white/10 text-white/60 font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </button>
            <button
              className="flex-1 h-12 rounded-xl bg-red-500 text-white font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              onClick={() => deleteBlog.mutate(activeBlog.id, {
                onSuccess: () => { setShowDeleteDialog(false); router.push("/dashboard/blogs"); }
              })}
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
