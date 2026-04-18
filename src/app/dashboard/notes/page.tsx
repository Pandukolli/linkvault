"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotes } from "@/hooks/use-notes";
import { NotesEditor, PAGE_COLORS, EDITOR_FONTS } from "@/components/notes-editor";
import { WeatherWidget } from "@/components/weather-widget";
import { MoodTrendGraph } from "@/components/mood-trend-graph";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  BookOpen, Search, Calendar, Clock, Trash2, ChevronLeft, ChevronRight,
  Maximize2, FileText, X, Sparkles, BookMarked, Grid3X3,
  Feather, Download, Printer, Tag, History, Check, Save
} from "lucide-react";
import {
  MemoryThread, InkEmotionOverlay, LegacyLetterBadge,
  SealedOverlay, PoetryModeToggle,
} from "@/components/notes-features";
import type { EnhancedContentExt } from "@/components/notes-features";

/* ─────── Helpers ─────── */
function formatDate(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function formatDateTime(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
function formatRelative(d: string) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "Unknown";
  const diff = Math.floor((Date.now() - dt.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(d);
}
function dateKey(d: string | Date | undefined) {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
function getRecentDays(count = 60): Date[] {
  const days: Date[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

/* ─────── TiTap JSON -> Markdown/HTML ─────── */
function tipTapToMarkdown(json: any): string {
  if (!json || !json.content) return "";
  let md = "";
  for (const node of json.content) {
    if (node.type === "paragraph") {
      md += (node.content?.map((c: any) => c.text).join("") || "") + "\n\n";
    } else if (node.type === "heading") {
      md += "#".repeat(node.attrs?.level || 1) + " " + (node.content?.map((c: any) => c.text).join("") || "") + "\n\n";
    }
  }
  return md.trim();
}
function extractPreview(json: any): string {
  const text = tipTapToMarkdown(json).replace(/\n/g, " ").trim();
  return text.substring(0, 140) || "Empty note — Start writing...";
}

/* ─────── Constants ─────── */
const DEFAULT_COVERS = [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200",
  "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=1200",
  "https://images.unsplash.com/photo-1519750783826-e2420f4d687f?w=1200",
];
const POPULAR_EMOJIS = ["📝", "💡", "✈️", "🚀", "🏡", "💼", "📅", "🍎", "🎨", "🎵", "📷", "⭐", "🔥", "🌍", "🔗", "💻"];

interface EnhancedContent {
  type: "doc";
  content: any[];
  _tags?: string[];
  _pageColor?: string;
  _fontFamily?: string;
  _coverImage?: string;
  _icon?: string;
  _isHandwriting?: boolean;
  _mood?: string;
  _history?: any[];
  // New feature fields (stored in same JSONB column)
  _linkedNoteIds?: string[];
  _isLegacyLetter?: boolean;
  _unlockDate?: string;
  _isPoetryMode?: boolean;
  _typingLanguage?: string;
}

export default function NotesPage() {
  const { notes, isLoading, createNote, updateNote, deleteNote } = useNotes();

  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [stats, setStats] = useState({ words: 0, chars: 0 });

  const [localTitle, setLocalTitle] = useState("");
  const [pageColor, setPageColor] = useState(PAGE_COLORS[0].value);
  const [fontFamily, setFontFamily] = useState(EDITOR_FONTS[0].value);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [noteIcon, setNoteIcon] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [isHandwriting, setIsHandwriting] = useState(false);
  const [mood, setMood] = useState<string | null>(null);

  // ── New Feature State ──
  const [linkedNoteIds, setLinkedNoteIds] = useState<string[]>([]);
  const [isLegacyLetter, setIsLegacyLetter] = useState(false);
  const [unlockDate, setUnlockDate] = useState<string | null>(null);
  const [isPoetryMode, setIsPoetryMode] = useState(false);
  const [typingLanguage, setTypingLanguage] = useState("en");
  const [peekSealed, setPeekSealed] = useState(false);

  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const activeNote = notes.find(n => n.id === selectedNote);
  const autoSaveTimer = useRef<any>(null);
  const titleDebounce = useRef<any>(null);
  const pendingContent = useRef<any>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      const contentStr = tipTapToMarkdown(n.content).toLowerCase();
      return (n.title || "").toLowerCase().includes(q) || contentStr.includes(q);
    });
  }, [notes, searchQuery]);

  const noteDateSet = useMemo(() => new Set(notes.map(n => dateKey(n.created_at))), [notes]);
  const calendarDays = useMemo(() => getRecentDays(60), []);

  const dayNotes = useMemo(() => {
    if (!activeNote) return [];
    const date = dateKey(activeNote.created_at);
    return notes.filter(n => dateKey(n.created_at) === date).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [notes, activeNote]);

  const currentPageIndex = dayNotes.findIndex(n => n.id === selectedNote);

  useEffect(() => {
    if (activeNote) {
      setLocalTitle(activeNote.title || "");
      const ext = activeNote.content as EnhancedContent;
      setPageColor(ext?._pageColor || PAGE_COLORS[0].value);
      setFontFamily(ext?._fontFamily || EDITOR_FONTS[0].value);
      setCoverImage(ext?._coverImage || null);
      setNoteIcon(ext?._icon || null);
      setTags(ext?._tags || []);
      setIsHandwriting(ext?._isHandwriting || false);
      setMood(ext?._mood || null);
      // New features
      setLinkedNoteIds(ext?._linkedNoteIds || []);
      setIsLegacyLetter(ext?._isLegacyLetter || false);
      setUnlockDate(ext?._unlockDate || null);
      setIsPoetryMode(ext?._isPoetryMode || false);
      setTypingLanguage(ext?._typingLanguage || "en");
      setPeekSealed(false);
      setScrollProgress(0);
    }
  }, [activeNote?.id]);

  const forceSaveNow = useCallback(async (contentOverride?: any, extra?: Partial<EnhancedContent>) => {
    if (!selectedNote || !activeNote) return;
    setIsSaving(true);
    const base = contentOverride || pendingContent.current || activeNote.content;
    const final: EnhancedContent = {
      ...base,
      _tags: extra?._tags ?? tags,
      _pageColor: extra?._pageColor ?? pageColor,
      _fontFamily: extra?._fontFamily ?? fontFamily,
      _coverImage: extra?._coverImage !== undefined ? extra._coverImage : coverImage || undefined,
      _icon: extra?._icon !== undefined ? extra._icon : noteIcon || undefined,
      _isHandwriting: extra?._isHandwriting !== undefined ? extra._isHandwriting : isHandwriting,
      _mood: extra?._mood !== undefined ? extra._mood : mood || undefined,
      // Persist new feature fields
      _linkedNoteIds: extra?._linkedNoteIds !== undefined ? extra._linkedNoteIds : linkedNoteIds,
      _isLegacyLetter: extra?._isLegacyLetter !== undefined ? extra._isLegacyLetter : isLegacyLetter,
      _unlockDate: extra?._unlockDate !== undefined ? extra._unlockDate : unlockDate || undefined,
      _isPoetryMode: extra?._isPoetryMode !== undefined ? extra._isPoetryMode : isPoetryMode,
      _typingLanguage: extra?._typingLanguage !== undefined ? extra._typingLanguage : typingLanguage,
    };
    updateNote.mutate({ id: selectedNote, content: final }, {
      onSuccess: () => { setIsSaving(false); pendingContent.current = null; },
      onError: () => setIsSaving(false)
    });
  }, [selectedNote, activeNote, tags, pageColor, fontFamily, coverImage, noteIcon, isHandwriting, mood,
      linkedNoteIds, isLegacyLetter, unlockDate, isPoetryMode, typingLanguage, updateNote]);

  const handleContentUpdate = (content: any, s: any) => {
    pendingContent.current = content;
    setStats(s);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => forceSaveNow(content), 2000);
  };

  const handleTitleUpdate = (t: string) => {
    setLocalTitle(t);
    if (titleDebounce.current) clearTimeout(titleDebounce.current);
    titleDebounce.current = setTimeout(() => updateNote.mutate({ id: selectedNote!, title: t }), 800);
  };

  const setCover = (url: string | null) => { setCoverImage(url); forceSaveNow(undefined, { _coverImage: url || undefined }); setShowCoverPicker(false); };
  const setIcon = (icon: string | null) => { setNoteIcon(icon); forceSaveNow(undefined, { _icon: icon || undefined }); setShowIconPicker(false); };

  const addTag = (e: any) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      const nt = [...tags, newTagInput.trim().toLowerCase()];
      setTags(nt); forceSaveNow(undefined, { _tags: nt }); setNewTagInput("");
    }
  };
  const removeTag = (t: string) => { const nt = tags.filter(tag => tag !== t); setTags(nt); forceSaveNow(undefined, { _tags: nt }); };

  const handleNewNote = (baseTitle?: string) => {
    const title = baseTitle || "Untitled";
    const sameDayCount = notes.filter(n => dateKey(n.created_at) === dateKey(new Date()) && n.title?.startsWith(title)).length;
    const finalTitle = sameDayCount > 0 ? `${title} - Page ${sameDayCount + 1}` : title;

    createNote.mutate({
      title: finalTitle,
      is_daily: !!baseTitle,
      content: { type: "doc", content: [{ type: "paragraph" }] }
    }, { onSuccess: d => {
        setSelectedNote(d.id);
        if (window.innerWidth < 768) setSidebarCollapsed(true);
    }});
  };

  const handleDailyNote = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    const ex = notes.find(n => n.is_daily && n.title === today);
    if (ex) {
      setSelectedNote(ex.id);
      if (window.innerWidth < 768) setSidebarCollapsed(true);
    } else {
      handleNewNote(today);
    }
  };

  const handleDownloadPDF = () => {
    if (!activeNote) return;
    toast.promise(async () => {
      // Small delay to ensure state is flushed
      await new Promise(r => setTimeout(r, 500));
      window.print();
    }, {
      loading: "Preparing document for export...",
      success: "Exporting to PDF",
      error: "Failed to export PDF"
    });
  };
  const handleCalendarDateClick = (d: Date) => {
    const k = dateKey(d);
    const n = notes.find(note => dateKey(note.created_at) === k);
    if (n) setSelectedNote(n.id); else toast.info("No notes on this date");
  };

  return (
    <div className={`nb-page ${isFullscreen ? "nb-fullscreen" : ""}`}>
      <div className="nb-cal-strip no-print">
        <div className="nb-cal-label"><Calendar className="w-4 h-4 text=white" /><span> Timeline</span></div>
        <div className="nb-cal-scroll" ref={calendarRef}>
          {calendarDays.map(day => {
            const k = dateKey(day);
            const isToday = k === dateKey(new Date());
            return (
              <button key={k} className={`nb-cal-day ${isToday ? "today" : ""} ${noteDateSet.has(k) ? "has-note" : ""}`}
                onClick={() => handleCalendarDateClick(day)} data-today={isToday ? "" : undefined}>
                <span className="nb-cal-wd">{day.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}</span>
                <span className="nb-cal-dn">{day.getDate()}</span>
                {noteDateSet.has(k) && <span className="nb-cal-dot" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="nb-layout">
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.aside initial={{ width: 0 }} animate={{ width: 340 }} exit={{ width: 0 }} className="nb-sidebar no-print">
              <div className="nb-sb-header">
                <div className="nb-sb-brand"><BookMarked className="w-4 h-4" /><span> Journal Library</span></div>
                <button onClick={() => setSidebarCollapsed(true)}><ChevronLeft className="w-4 h-4" /></button>
              </div>
              <div className="nb-sb-actions">
                <button className="nb-btn-daily" onClick={handleDailyNote}><Feather className="w-4 h-4" /><span> Today's Log</span></button>
                <button className="nb-btn-blank" onClick={() => handleNewNote()}><FileText className="w-4 h-4" /><span> Blank Page</span></button>
              </div>
              <div className="nb-search-wrap">
                <Search className="nb-search-ico" />
                <input type="text" className="nb-search-input" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="px-4"><MoodTrendGraph notes={notes} /></div>
              <div className="nb-list">
                {filteredNotes.map(note => {
                  const nt = note.content as EnhancedContent;
                  return (
                    <div key={note.id} className={`nb-list-item group ${selectedNote === note.id ? "active" : ""}`} onClick={() => {
                      setSelectedNote(note.id);
                      if (window.innerWidth < 768) setSidebarCollapsed(true);
                    }}>
                      {selectedNote === note.id && <div className="nb-item-bar" />}
                      <div className="nb-item-title-row">
                        {nt?._icon && <span className="nb-item-icon-sm">{nt._icon}</span>}
                        <span className="nb-item-title">{note.title || "Untitled"}</span>
                        <Trash2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-destructive" onClick={e => { e.stopPropagation(); deleteNote.mutate(note.id); }} />
                      </div>
                      <p className="nb-item-preview">{extractPreview(note.content)}</p>
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {sidebarCollapsed && (
          <button className="nb-sb-expand no-print" onClick={() => setSidebarCollapsed(false)}>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <main className="nb-editor-area" style={{ "--nb-paper-color": pageColor } as any}>
          {activeNote ? (
            <div className="nb-active">
              <div className="nb-reading-progress" style={{ width: `${scrollProgress}%` }} />
              <div className="nb-topbar no-print">
                <div className="nb-topbar-left"><span className="text-[10px] uppercase opacity-50 font-bold tracking-widest">{isSaving ? "Syncing..." : "Vault Secure"}</span></div>
                <div className="nb-topbar-right">
                  {/* New feature toggles */}
                  <PoetryModeToggle
                    enabled={isPoetryMode}
                    onToggle={v => { setIsPoetryMode(v); forceSaveNow(undefined, { _isPoetryMode: v }); }}
                  />
                  <LegacyLetterBadge
                    isLetter={isLegacyLetter}
                    unlockDate={unlockDate}
                    onToggle={v => { setIsLegacyLetter(v); forceSaveNow(undefined, { _isLegacyLetter: v }); }}
                    onSetDate={d => { setUnlockDate(d); forceSaveNow(undefined, { _unlockDate: d }); }}
                    noteCreatedAt={activeNote.created_at}
                  />
                  <MemoryThread
                    activeNoteId={activeNote.id}
                    allNotes={notes}
                    linkedIds={linkedNoteIds}
                    onLink={ids => { setLinkedNoteIds(ids); forceSaveNow(undefined, { _linkedNoteIds: ids }); }}
                  />
                  <button className="nb-top-btn" onClick={handleDownloadPDF} title="Download PDF"><Download className="w-4 h-4" /></button>
                  <button className="nb-top-btn" onClick={() => setShowCoverPicker(true)}><Grid3X3 className="w-4 h-4" /></button>
                  <button className="nb-top-btn" onClick={() => setIsFullscreen(!isFullscreen)}><Maximize2 className="w-4 h-4" /></button>
                  <button className="nb-top-btn nb-top-del hover:text-destructive" onClick={() => deleteNote.mutate(activeNote.id)}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="nb-paper no-scrollbar" onScroll={e => setScrollProgress((e.currentTarget.scrollTop / (e.currentTarget.scrollHeight - e.currentTarget.offsetHeight)) * 100)}>
                {coverImage ? (
                  <div className="nb-cover-wrap">
                    <img src={coverImage} className="nb-cover-img" />
                    <div className="nb-cover-overlay">
                      <div className="nb-cover-controls">
                        <button className="nb-cover-btn" onClick={() => setShowCoverPicker(true)}>Change</button>
                        <button className="nb-cover-btn" onClick={() => setCover(null)}>Remove</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-20 group/cv">
                    <button className="opacity-0 group-hover/cv:opacity-100 ml-12 mt-8 text-[11px] font-bold flex items-center gap-2 text-muted-foreground hover:text-primary transition-all" onClick={() => setShowCoverPicker(true)}><Sparkles className="w-3.5 h-3.5" /> Add Cover</button>
                  </div>
                )}
                <div className="nb-icon-box" onClick={() => setShowIconPicker(true)}>{noteIcon || <Feather className="w-8 h-8 opacity-20" />}</div>
                <div className="nb-tags-bar no-print flex flex-col md:flex-row justify-between w-full gap-4 md:gap-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {tags.map(t => <span key={t} className="nb-tag">#{t} <X className="w-2 h-2 cursor-pointer opacity-50 hover:opacity-100" onClick={() => removeTag(t)} /></span>)}
                    <input type="text" className="nb-tag-input text-muted-foreground min-w-[80px]" placeholder="Add tag..." value={newTagInput} onChange={e => setNewTagInput(e.target.value)} onKeyDown={addTag} />
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-hide shrink-0 md:pb-0">
                    <WeatherWidget />
                    <div className="flex bg-muted rounded-full px-2 py-1 gap-1 border border-border">
                      {[{ m: "happy", e: "😊" }, { m: "good", e: "🙂" }, { m: "neutral", e: "😐" }, { m: "sad", e: "😔" }, { m: "awful", e: "😢" }].map(item => (
                        <button key={item.m} onClick={() => { setMood(item.m); forceSaveNow(undefined, { _mood: item.m }); }} className={`w-6 h-6 flex items-center justify-center rounded-full text-sm hover:scale-110 transition-all ${mood === item.m ? 'bg-surface shadow-sm scale-110' : 'opacity-40 hover:opacity-100'}`}>
                          {item.e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="nb-title-zone" style={{ fontFamily }}>
                  <input type="text" className={`nb-title-input ${isPoetryMode ? "nb-poetry-title" : ""}`} value={localTitle} onChange={e => handleTitleUpdate(e.target.value)} placeholder="Artifact Title..." />
                </div>

                {/* Ink & Emotion tint overlay */}
                <InkEmotionOverlay mood={mood} />

                {/* Legacy Letter sealed overlay */}
                {isLegacyLetter && unlockDate && new Date(unlockDate) > new Date() && !peekSealed ? (
                  <SealedOverlay unlockDate={unlockDate} onPreview={() => setPeekSealed(true)} />
                ) : (
                  <NotesEditor
                    key={activeNote.id}
                    content={activeNote.content as any}
                    onUpdate={handleContentUpdate}
                    pageColor={pageColor}
                    onPageColorChange={c => { setPageColor(c); forceSaveNow(undefined, { _pageColor: c }); }}
                    fontFamily={isPoetryMode ? "'Merriweather', serif" : fontFamily}
                    onFontChange={f => { setFontFamily(f); forceSaveNow(undefined, { _fontFamily: f }); }}
                    isHandwriting={isHandwriting}
                    onHandwritingToggle={b => { setIsHandwriting(b); forceSaveNow(undefined, { _isHandwriting: b }); }}
                    typingLanguage={typingLanguage}
                    onLanguageChange={l => { setTypingLanguage(l); forceSaveNow(undefined, { _typingLanguage: l }); }}
                  />
                )}
              </div>
              <div className="nb-book-footer no-print border-t border-border">
                <div className="nb-footer-left text-muted-foreground font-bold text-[10px] uppercase tracking-widest"><span>{stats.words} words</span><span className="mx-2">·</span><span>{stats.chars} chars</span></div>
                <div className="nb-footer-right flex items-center gap-4">
                  <div className="flex bg-muted rounded p-0.5 border border-border">
                    <button className="hover:text-primary transition-colors" onClick={() => currentPageIndex > 0 && setSelectedNote(dayNotes[currentPageIndex - 1].id)}><ChevronLeft className="w-4 h-4" /></button>
                    <button className="hover:text-primary transition-colors" onClick={() => {
                      if (currentPageIndex < dayNotes.length - 1) {
                        setSelectedNote(dayNotes[currentPageIndex + 1].id);
                      } else {
                        const dateTitle = activeNote.is_daily ? activeNote.title?.split(" - Page ")[0] : undefined;
                        handleNewNote(dateTitle);
                      }
                    }}><ChevronRight className="w-4 h-4" /></button>
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-muted-foreground">PAGE {currentPageIndex + 1}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-transparent no-print animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-muted rounded-3xl flex items-center justify-center mb-8 border border-border shadow-inner">
                  <BookOpen className="w-10 h-10 text-muted-foreground opacity-40" />
                </div>
                <h2 className="text-4xl text-foreground font-black tracking-tighter mb-4 select-none cursor-default uppercase">
                  Library
                </h2>
                <p className="text-muted-foreground text-sm font-serif max-w-sm mx-auto mb-10 select-none cursor-default leading-relaxed">
                  The vault doors are open, but no record is active. Select a document from your library or initialize a new blank page.
                </p>
                <button
                  className="h-12 px-10 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-[0.2em] hover:-translate-y-1 hover:bg-primary/90 transition-all duration-300 shadow-xl shadow-primary/20 active:scale-95"
                  onClick={() => handleNewNote()}
                >
                  Initialize Record
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {showCoverPicker && (
          <motion.div className="nb-modal-overlay no-print" style={{ zIndex: 100 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCoverPicker(false)}>
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-xl shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between mb-4"><h3 className="font-bold">Covers</h3><X className="w-4 h-4 cursor-pointer" onClick={() => setShowCoverPicker(false)} /></div>
              <div className="grid grid-cols-3 gap-3">{DEFAULT_COVERS.map(url => <button key={url} className="h-24 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary" onClick={() => setCover(url)}><img src={url} className="w-full h-full object-cover" /></button>)}</div>
            </div>
          </motion.div>
        )}
        {showIconPicker && (
          <motion.div className="nb-modal-overlay no-print" style={{ zIndex: 100 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowIconPicker(false)}>
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between mb-4"><h3 className="font-bold">Icons</h3><button className="text-xs" onClick={() => setIcon(null)}>Remove</button></div>
              <div className="grid grid-cols-4 gap-4">{POPULAR_EMOJIS.map(emoji => <button key={emoji} className="text-2xl p-2 hover:bg-black/5 rounded-lg" onClick={() => setIcon(emoji)}>{emoji}</button>)}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
