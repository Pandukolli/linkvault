"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBlogs } from "@/hooks/use-blogs";
import { TiptapEditor } from "@/components/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ChevronLeft,
  Settings2,
  Globe,
  FileEdit,
  Trash2,
  Eye,
  PanelLeftClose,
  PanelRightClose,
  Image as ImageIcon,
  Tag,
  Save,
  CheckCircle2,
  UploadCloud,
  FolderOpen,
  User as UserIcon,
  X as XIcon,
  Lock,
  ShieldCheck
} from "lucide-react";
import { MediaPicker } from "@/components/media-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


export default function BlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { blogs, isLoading, updateBlog, deleteBlog } = useBlogs();
  
  const [splitView, setSplitView] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [publishPassword, setPublishPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const activeBlog = blogs.find((b) => b.id === id);

  // Local meta state for clean editing without spamming the DB
  const [localMeta, setLocalMeta] = useState<any>({});

  useEffect(() => {
    if (!activeBlog && !isLoading) {
      router.push("/dashboard/blogs");
    } else if (activeBlog && Object.keys(localMeta).length === 0) {
      setLocalMeta(activeBlog.content?.meta || {});
    }
  }, [activeBlog, isLoading, router]);

  if (!activeBlog) return null;

  // Extracted Metadata handling
  const meta = activeBlog.content?.meta || {};
  
  const handleLocalChange = (key: string, value: any) => {
    setLocalMeta((prev: any) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    setIsSaving(true);
    const currentContent = activeBlog.content || { type: "doc", content: [] };
    const updatedContent = { ...currentContent, meta: { ...meta, ...localMeta } };
    updateBlog.mutate({ id: activeBlog.id, content: updatedContent }, {
      onSuccess: () => {
        toast.success("Settings saved efficiently.");
        setIsSaving(false);
      }
    });
  };

  const handleContentUpdate = (content: any) => {
    // We want auto-save logic. Tiptap calls this on change.
    setIsSaving(true);
    // Count words manually from text if needed, or get from tiptap stats.
    
    // We merge the meta back in to ensure we don't lose it if content is just raw tiptap
    const finalContent = { ...content, meta: activeBlog.content?.meta || {} };
    updateBlog.mutate({ id: activeBlog.id, content: finalContent }, {
      onSettled: () => setTimeout(() => setIsSaving(false), 800)
    });
  };

  const toggleStatus = () => {
    if (activeBlog.status === "draft") {
      // Show password dialog before publishing
      setPublishPassword("");
      setConfirmPassword("");
      setShowPublishDialog(true);
    } else {
      // Unpublish directly
      updateBlog.mutate({ id: activeBlog.id, status: "draft" });
    }
  };

  const handlePublishWithPassword = () => {
    if (publishPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    if (publishPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    // Store password in content meta and publish
    const currentContent = activeBlog.content || { type: "doc", content: [] };
    const updatedContent = {
      ...currentContent,
      meta: { ...currentContent.meta, editPassword: publishPassword }
    };
    updateBlog.mutate(
      { id: activeBlog.id, content: updatedContent, status: "published" },
      {
        onSuccess: () => {
          toast.success("Published with edit protection!");
          setShowPublishDialog(false);
        }
      }
    );
  };

  return (
    <div className="h-[calc(100vh)] bg-slate-50/50 flex flex-col overflow-hidden relative">
      {/* Top Navbar */}
      <div className="h-16 flex-shrink-0 bg-white border-b border-border px-6 flex items-center justify-between z-40 relative shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-slate-100" onClick={() => router.push("/dashboard/blogs")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
          <Badge variant="outline" className={`px-3 py-1 font-black uppercase tracking-widest text-[9px] rounded-md ${activeBlog.status === "published" ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-slate-200 text-slate-500 bg-slate-50"}`}>
            {activeBlog.status}
          </Badge>
          <div className="flex items-center gap-2 opacity-50 ml-4 font-mono text-[10px] font-bold uppercase tracking-widest">
            {isSaving ? <><Save className="w-3 h-3 animate-pulse" /> Saving...</> : <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Synced</>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 px-4 gap-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-black hidden md:flex" onClick={() => setSplitView(!splitView)}>
            {splitView ? <><PanelRightClose className="w-4 h-4" /> Single View</> : <><PanelLeftClose className="w-4 h-4" /> Split View</>}
          </Button>

          <Button variant="outline" size="sm" className={`h-9 px-4 gap-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${showSettings ? "bg-slate-100 text-black border-slate-300" : "text-slate-500 hover:text-black"}`} onClick={() => setShowSettings(!showSettings)}>
            <Settings2 className="w-4 h-4" /> Settings
          </Button>

          <div className="w-px h-6 bg-border mx-2" />

          <Button className={`h-9 px-6 gap-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all ${activeBlog.status === "draft" ? "bg-primary text-white shadow-primary/20 hover:bg-primary/90" : "bg-black text-white hover:bg-slate-800"}`} onClick={toggleStatus}>
            {activeBlog.status === "draft" ? <><Globe className="w-4 h-4" /> Publish</> : <><FileEdit className="w-4 h-4" /> Unpublish</>}
          </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Pane */}
        <div className={`flex-1 flex flex-col bg-white overflow-hidden transition-all duration-500 ${showSettings ? 'mr-0' : ''}`}>
          <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-10 md:p-16 lg:px-32">
            <input
              type="text"
              value={activeBlog.title || ""}
              onChange={(e) => updateBlog.mutate({ id: activeBlog.id, title: e.target.value })}
              className="w-full text-5xl md:text-6xl font-black tracking-tighter bg-transparent border-none outline-none mb-10 placeholder:text-slate-200 text-black uppercase leading-[0.9]"
              placeholder="Post Title..."
            />
            {/* Split Screen advanced tip tap */}
            <TiptapEditor
              content={activeBlog.content}
              onUpdate={handleContentUpdate}
              placeholder="Write an epic publication..."
              autofocus
            />
          </div>
          {/* Footer Stats inside Editor */}
          <div className="h-8 border-t border-slate-100 bg-slate-50 flex items-center px-6 justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex gap-4">
              <span>{meta.readingTime || "1"} min read</span>
            </div>
            <div>
              <span className="text-black">{activeBlog.title?.length || 0}</span> / 60 Char Title
            </div>
          </div>
        </div>

        {/* Live Reader Preview Pane (Split View) */}
        {splitView && (
          <div className="flex-1 hidden xl:flex flex-col border-l border-border bg-[#fafafa] relative overflow-hidden shadow-inner font-jost">
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#fafafa] to-transparent z-10 pointer-events-none" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-black/5 backdrop-blur-md text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 shadow-sm border border-black/5">
              Live Reader Preview
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar py-20 px-16 relative">
              <div className="max-w-2xl mx-auto">
                {meta.coverImage && (
                  <div className="w-full aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-black/10">
                    <img src={meta.coverImage} className="w-full h-full object-cover" alt="Cover" />
                  </div>
                )}
                <h1 className="text-5xl font-black tracking-tight text-black mb-8 leading-[1.1] font-bodoni">
                  {activeBlog.title || "Untitled"}
                </h1>
                
                <div className="flex items-center gap-4 mb-16 pb-8 border-b border-slate-200">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm flex-shrink-0">
                    {localMeta.authorAvatar || meta.authorAvatar ? (
                      <img src={localMeta.authorAvatar || meta.authorAvatar} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-black uppercase tracking-widest mb-1">
                      {localMeta.authorName || meta.authorName || "Untitled Author"}
                    </div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString()} · {meta.readingTime || "1"} min read</div>
                  </div>
                </div>

                {/* Render current tiptap content in read-only mode, or use a custom ProseMirror renderer */}
                <div className="prose prose-lg max-w-none opacity-60 pointer-events-none font-jost">
                  {/* Realtime reflection of content happens here via Tiptap read-only instance or raw HTML */}
                  <TiptapEditor content={activeBlog.content} editable={false} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Settings Sidebar */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-slate-50/50">
                <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-primary" /> Post Settings
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">


                {/* Category & Series & Slug Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</Label>
                    <select 
                      value={localMeta.category || meta.category || ""}
                      onChange={e => handleLocalChange('category', e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-100 rounded-xl h-10 px-3 outline-none focus:border-primary/50 text-slate-700 font-bold -mb-4"
                    >
                      <option value="">Select Category</option>
                      <option value="Personal Essay">Personal Essay</option>
                      <option value="Technical Deep Dive">Technical Deep Dive</option>
                      <option value="Tutorial / How-to">Tutorial / How-to</option>
                      <option value="Story / Narrative">Story / Narrative</option>
                      <option value="Review">Review</option>
                      <option value="Newsletter">Newsletter</option>
                      <option value="Journal">Journal</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Series Name</Label>
                    <Input 
                      placeholder="e.g. Volume 1" 
                      value={localMeta.series || meta.series || ""}
                      onChange={e => handleLocalChange('series', e.target.value)}
                      className="h-10 text-xs font-bold rounded-xl bg-slate-50 border-slate-100 placeholder:font-normal"
                    />
                  </div>
                  
                  {/* Public Slug */}
                  <div className="col-span-2 space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Public Slug</Label>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <Globe className="w-4 h-4 text-slate-400 ml-2" />
                      <Input 
                        value={activeBlog.slug || ""} 
                        onChange={e => updateBlog.mutate({ id: activeBlog.id, slug: e.target.value })} 
                        className="border-none bg-transparent h-6 text-[10px] font-mono font-bold shadow-none focus-visible:ring-0 px-1" 
                        placeholder="your-url"
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cover Visual</Label>
                  {localMeta.coverImage || meta.coverImage ? (
                    <div className="relative group rounded-xl overflow-hidden shadow-md">
                      <img src={localMeta.coverImage || meta.coverImage} className="w-full h-32 object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center gap-2 justify-center transition-opacity">
                        <MediaPicker 
                          onSelect={(url) => handleLocalChange('coverImage', url)} 
                          title="Change Cover Visual"
                          trigger={<Button variant="secondary" size="sm">Change</Button>} 
                        />
                        <Button variant="destructive" size="sm" onClick={() => handleLocalChange('coverImage', '')}>Remove</Button>
                      </div>
                    </div>
                  ) : (
                    <MediaPicker 
                      onSelect={(url) => handleLocalChange('coverImage', url)} 
                      title="Select Cover Visual"
                      trigger={
                        <button type="button" className="w-full h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                          <ImageIcon className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pick Cover from Catalog</span>
                        </button>
                      } 
                    />
                  )}
                </div>

                {/* Author Setup */}
                <div className="space-y-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-primary" /> Author Profile
                  </h4>
                  <div className="flex items-center gap-4">
                    {localMeta.authorAvatar || meta.authorAvatar ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 cursor-pointer border-2 border-primary/20 relative group" onClick={() => handleLocalChange('authorAvatar', '')}>
                        <img src={localMeta.authorAvatar || meta.authorAvatar} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <XIcon className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <MediaPicker 
                        onSelect={(url) => handleLocalChange('authorAvatar', url)} 
                        title="Select Author Avatar"
                        trigger={
                          <button type="button" className="w-12 h-12 rounded-full flex-shrink-0 bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                             <UploadCloud className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                          </button>
                        } 
                      />
                    )}
                    <div className="flex-1 space-y-2">
                       <MediaPicker 
                        onSelect={(url) => handleLocalChange('authorAvatar', url)} 
                        title="Select Author Avatar"
                        trigger={<Button variant="outline" className="h-7 w-full text-[9px] font-black uppercase tracking-widest rounded-lg">Import Avatar</Button>} 
                       />
                       <Input type="text" placeholder="Author Name" value={localMeta.authorName || meta.authorName || ""} onChange={e => handleLocalChange('authorName', e.target.value)} className="h-8 text-xs font-bold rounded" />
                    </div>
                  </div>
                  <textarea 
                    value={localMeta.authorBio || meta.authorBio || ""}
                    onChange={e => handleLocalChange('authorBio', e.target.value)}
                    className="w-full h-20 p-3 text-xs bg-white border border-slate-200 rounded-xl resize-none outline-none focus:border-primary/50 transition-colors mt-2"
                    placeholder="Short Author Bio / 'Why I write'..."
                  />
                </div>

                {/* Excerpt */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Excerpt / Meta Description</Label>
                  <textarea 
                    value={localMeta.excerpt || meta.excerpt || activeBlog.seo_description || ""}
                    onChange={e => {
                      handleLocalChange('excerpt', e.target.value);
                      updateBlog.mutate({ id: activeBlog.id, seo_description: e.target.value });
                    }}
                    className="w-full h-24 p-3 text-xs bg-slate-50 border border-slate-100 rounded-xl resize-none outline-none focus:border-primary/50 transition-colors"
                    placeholder="Brief description for social sharing and list views..."
                  />
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2"><Tag className="w-3 h-3" /> Tags</Label>
                  <Input 
                    placeholder="Add tags separated by commas..." 
                    className="h-10 text-xs rounded-xl bg-slate-50 border-slate-100"
                    value={localMeta.tags ? localMeta.tags.join(", ") : (meta.tags || []).join(", ")}
                    onChange={e => handleLocalChange('tags', e.target.value.split(",").map((t: string) => t.trim()))}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(localMeta.tags || meta.tags || []).map((t: string) => t && (
                      <Badge key={t} variant="secondary" className="text-[9px] uppercase font-bold tracking-wider">{t}</Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-6 pb-4 border-t border-slate-100">
                  <Button className="w-full h-12 bg-black text-white hover:bg-primary rounded-xl font-black uppercase tracking-widest text-xs transition-colors" onClick={saveSettings}>
                    Save Settings
                  </Button>
                </div>

                <div className="pt-6 pb-24 border-t border-slate-100">
                  <Button variant="ghost" className="w-full h-10 bg-red-50 text-red-500 hover:text-white hover:bg-red-500 rounded-xl relative bottom-0 transition-colors" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Erase Publication
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Publish Password Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-slate-100 shadow-2xl">
          <DialogHeader className="text-center items-center pb-2">
            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Protect Your Publication</DialogTitle>
            <DialogDescription className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
              Set a password to protect editing access. Only you will be able to edit this blog with this password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Lock className="w-3 h-3" /> Edit Password
              </Label>
              <Input
                type="password"
                placeholder="Enter a secure password..."
                value={publishPassword}
                onChange={(e) => setPublishPassword(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 border-slate-100 text-sm font-bold placeholder:font-normal focus-visible:ring-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Lock className="w-3 h-3" /> Confirm Password
              </Label>
              <Input
                type="password"
                placeholder="Re-enter password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePublishWithPassword()}
                className="h-12 rounded-xl bg-slate-50 border-slate-100 text-sm font-bold placeholder:font-normal focus-visible:ring-primary/30"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:flex-row pt-2">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs"
              onClick={() => setShowPublishDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 gap-2"
              onClick={handlePublishWithPassword}
              disabled={!publishPassword || !confirmPassword}
            >
              <Globe className="w-4 h-4" /> Publish Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
              <span className="font-bold text-black">&quot;{activeBlog.title}&quot;</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:flex-row pt-4">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-red-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-red-500/20 hover:bg-red-600 gap-2"
              onClick={() => {
                deleteBlog.mutate(activeBlog.id, {
                  onSuccess: () => {
                    setShowDeleteDialog(false);
                    router.push("/dashboard/blogs");
                  },
                  onError: () => setShowDeleteDialog(false),
                });
              }}
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
