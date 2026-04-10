"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLinks } from "@/hooks/use-links";
import { useCollections } from "@/hooks/use-collections";
import { suggestTags, isAIEnabled } from "@/lib/ai/gemini";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Link2,
  Loader2,
  Sparkles,
  X,
  Globe,
  Save,
} from "lucide-react";
import type { LinkWithTags } from "@/lib/types";
import { toast } from "sonner";

interface SaveLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingLink?: LinkWithTags | null;
}

export function SaveLinkDialog({
  open,
  onOpenChange,
  editingLink,
}: SaveLinkDialogProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState(editingLink?.url || "");
  const [title, setTitle] = useState(editingLink?.title || "");
  const [description, setDescription] = useState(editingLink?.description || "");
  const [notes, setNotes] = useState(editingLink?.notes || "");
  const [tags, setTags] = useState<string[]>(editingLink?.tags?.map((t) => t.name) || []);
  const [tagInput, setTagInput] = useState("");
  const [collectionId, setCollectionId] = useState<string>("");
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const { saveLink, updateLink } = useLinks();
  const { collections } = useCollections();

  const isEditing = !!editingLink;

  // Auto-fetch URL metadata
  const fetchMetadata = async () => {
    if (!url) return;
    setFetchingMeta(true);
    try {
      const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const meta = await res.json();
        if (meta.title && !title) setTitle(meta.title);
        if (meta.description && !description) setDescription(meta.description);
      }
    } catch (err) {
      console.debug("Metadata fetch failed", err);
    }
    setFetchingMeta(false);
  };

  // AI auto-tag
  const handleAITag = async () => {
    if (!isAIEnabled()) {
      toast.info("AI tagging is not configured. Add GEMINI_API_KEY to enable.");
      return;
    }
    setAiLoading(true);
    try {
      const suggestedTags = await suggestTags(url, title, description);
      if (suggestedTags.length > 0) {
        const newTags = [...new Set([...tags, ...suggestedTags])];
        setTags(newTags);
        toast.success(`Added ${suggestedTags.length} AI-suggested tags!`);
      } else {
        toast.info("No tags suggested. Try adding more link details.");
      }
    } catch {
      toast.error("AI tagging failed");
    }
    setAiLoading(false);
  };

  const addTag = () => {
    const tag = tagInput.toLowerCase().trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error("URL is required");
      return;
    }

    if (isEditing && editingLink) {
      updateLink.mutate({
        id: editingLink.id,
        url,
        title: title || null,
        description: description || null,
        notes: notes || null,
      });
    } else {
      saveLink.mutate({
        url,
        title: title || undefined,
        description: description || undefined,
        notes: notes || undefined,
        tags: tags.length > 0 ? tags : undefined,
        collection_id: collectionId || undefined,
      });
    }

    // Reset form
    setUrl("");
    setTitle("");
    setDescription("");
    setNotes("");
    setTags([]);
    setTagInput("");
    setCollectionId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white border-elegant shadow-2xl rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
            <Link2 className="w-5 h-5 text-primary" />
            {isEditing ? t("Edit Link", "Edit Link") : t("Save New Link", "Save New Link")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("URL", "URL")}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={fetchMetadata}
                  className="pl-11 h-11 bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white rounded-xl text-sm font-bold transition-all"
                  required
                />
              </div>
              {fetchingMeta && <Loader2 className="w-4 h-4 animate-spin text-primary self-center" />}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("Title", "Title")}</Label>
            <Input
              id="title"
              placeholder={t("Page title", "Page title")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white rounded-xl text-sm font-bold transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("Description", "Description")}</Label>
            <Textarea
              id="description"
              placeholder={t("Brief description...", "Brief description...")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-20 bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white rounded-xl text-sm font-bold transition-all resize-none p-4 shadow-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("Tags", "Tags")}</Label>
              {isAIEnabled() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAITag}
                  disabled={aiLoading || !url}
                  className="h-7 text-[10px] font-black text-primary hover:text-primary/80 uppercase tracking-widest"
                >
                  {aiLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1.5" />
                  )}
                  {t("AI Suggest", "AI Suggest")}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={t("Add a tag...", "Add a tag...")}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="h-11 bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white rounded-xl text-sm font-bold transition-all"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addTag} className="rounded-xl h-11 px-4 font-bold">
                {t("Add", "Add")}
              </Button>
            </div>
            <AnimatePresence>
              {tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-1.5 pt-2"
                >
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] font-bold bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 rounded-full px-3 py-1 border-none uppercase tracking-widest"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="w-3 h-3 ml-1.5" />
                    </Badge>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Collection */}
          {!isEditing && collections.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("Collection", "Collection")}</Label>
              <Select value={collectionId} onValueChange={(val) => setCollectionId(val as string)}>
                <SelectTrigger className="h-11 bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white rounded-xl text-sm font-bold transition-all">
                  <SelectValue placeholder={t("Select a collection", "Select a collection")} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-elegant shadow-xl">
                  {collections.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="font-bold cursor-pointer rounded-lg">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={saveLink.isPending || updateLink.isPending}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all mt-4"
          >
            {(saveLink.isPending || updateLink.isPending) ? (
              <Loader2 className="w-5 h-5 animate-spin mr-3" />
            ) : isEditing ? (
               <Save className="w-5 h-5 mr-3" />
            ) : (
               <Link2 className="w-5 h-5 mr-3" />
            )}
            {isEditing ? t("Save Changes", "Save Changes") : t("Save Link", "Save Link")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
