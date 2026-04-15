"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  Heart,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderPlus,
  Share2,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LinkWithTags } from "@/lib/types";
import { toast } from "sonner";

interface LinkCardProps {
  link: LinkWithTags;
  onEdit?: (link: LinkWithTags) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onMoveToCollection?: (link: LinkWithTags) => void;
  viewMode?: "grid" | "list";
}

export function LinkCard({
  link,
  onEdit,
  onDelete,
  onToggleFavorite,
  onMoveToCollection,
  viewMode = "grid",
}: LinkCardProps) {
  const { t } = useTranslation();
  const hostname = (() => {
    try {
      return new URL(link.url).hostname.replace("www.", "");
    } catch {
      return link.url;
    }
  })();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      toast.success(t("Link copied to clipboard!", "Link copied to clipboard!"));
    } catch {
      toast.error(t("Failed to copy link", "Failed to copy link"));
    }
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        className="group flex items-center gap-5 p-4 rounded-2xl bg-[#14151B] border border-white/5 hover:border-[#A3FF3D]/20 transition-all duration-300"
      >
        {/* Favicon */}
        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100 transition-transform duration-500 group-hover:scale-105">
          {link.favicon ? (
            <Image src={link.favicon} alt="" width={24} height={24} className="rounded" unoptimized />
          ) : (
            <Link2 className="w-5 h-5 text-slate-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-100 text-base truncate group-hover:text-[#A3FF3D] transition-colors decoration-2 underline-offset-4">{link.title || link.url}</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 transition-colors italic">{hostname}</p>
        </div>

        {/* Tags */}
        <div className="hidden md:flex gap-1.5 flex-shrink-0">
          {link.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border-none">
              {tag.name}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pr-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
            onClick={(e) => { e.preventDefault(); onToggleFavorite?.(link.id, !!link.is_favorite); }}
          >
            <Heart className={`w-4.5 h-4.5 transition-all ${link.is_favorite ? "fill-red-500 text-red-500 scale-105" : "text-slate-300"}`} />
          </Button>
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-slate-100 hover:text-black rounded-lg transition-all">
              <ExternalLink className="w-4.5 h-4.5 text-slate-400" />
            </Button>
          </a>
          <ActionsMenu
            link={link}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveToCollection={onMoveToCollection}
            onShare={handleShare}
          />
        </div>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="group relative rounded-[1.5rem] bg-card border-[1.5px] border-elegant hover:border-primary/20 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
    >
      {/* Preview Image */}
      <div className="relative h-44 bg-[#1F2129] overflow-hidden">
        {link.image_url ? (
          <Image
            src={link.image_url}
            alt={link.title || ""}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            unoptimized
          />
        ) : (
           <div className="absolute inset-0 flex items-center justify-center opacity-10">
             <Link2 className="w-24 h-24 text-slate-400" />
           </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Hover Favicon Badge */}
        <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/90 border border-slate-100 flex items-center justify-center backdrop-blur-md transition-all duration-300 group-hover:scale-110 shadow-sm">
           {link.favicon ? (
             <Image src={link.favicon} alt="" width={22} height={22} className="rounded" unoptimized />
           ) : (
             <Link2 className="w-4.5 h-4.5 text-slate-400" />
           )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-100 text-base leading-tight line-clamp-2 transition-all tracking-tight group-hover:text-[#A3FF3D]">
              {link.title || link.url}
            </h3>
            <p className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-[0.2em] italic">{hostname}</p>
          </div>
        </div>

        {/* Description */}
        {link.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
            {link.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {link.tags && link.tags.length > 0 ? (
            <>
              {link.tags.slice(0, 2).map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-[#1F2129] text-slate-400 border border-white/5">
                  {tag.name}
                </Badge>
              ))}
              {link.tags.length > 2 && (
                <Badge variant="secondary" className="text-[9px] font-black bg-slate-50/50 text-slate-400">
                  +{link.tags.length - 2}
                </Badge>
              )}
            </>
          ) : (
             <div className="h-5 w-1" /> // Spacer
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-[#1F2129] text-slate-500 hover:text-red-500 rounded-lg transition-all"
              onClick={(e) => { e.preventDefault(); onToggleFavorite?.(link.id, !!link.is_favorite); }}
            >
              <Heart
                className={`w-4.5 h-4.5 transition-all duration-300 ${
                  link.is_favorite ? "fill-red-500 text-red-500 scale-105" : "text-slate-500"
                }`}
              />
            </Button>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-[#1F2129] hover:text-[#5E7BFF] rounded-lg transition-all">
                <ExternalLink className="w-4.5 h-4.5 text-slate-500" />
              </Button>
            </a>
          </div>
          <ActionsMenu
            link={link}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveToCollection={onMoveToCollection}
            onShare={handleShare}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Actions dropdown menu
function ActionsMenu({
  link,
  onEdit,
  onDelete,
  onMoveToCollection,
  onShare,
}: {
  link: LinkWithTags;
  onEdit?: (link: LinkWithTags) => void;
  onDelete?: (id: string) => void;
  onMoveToCollection?: (link: LinkWithTags) => void;
  onShare: () => void;
}) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center hover:bg-[#1F2129] rounded-lg transition-all cursor-pointer">
        <MoreHorizontal className="w-4 h-4 text-slate-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-[#1F2129] border border-white/5 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <DropdownMenuItem onClick={() => onEdit?.(link)} className="cursor-pointer rounded-lg font-bold text-sm h-10 px-3 text-slate-100 focus:bg-[#A3FF3D]/10">
          <Pencil className="w-4 h-4 mr-3 text-[#A3FF3D]" />
          {t("Edit", "Edit")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMoveToCollection?.(link)} className="cursor-pointer rounded-lg font-bold text-sm h-10 px-3">
          <FolderPlus className="w-4 h-4 mr-3 text-primary opacity-70" />
          {t("Add to Collection", "Add to Collection")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShare} className="cursor-pointer rounded-lg font-bold text-sm h-10 px-3">
          <Share2 className="w-4 h-4 mr-3 text-primary opacity-70" />
          {t("Copy Link", "Copy Link")}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem
          onClick={() => onDelete?.(link.id)}
          className="cursor-pointer rounded-lg font-black text-sm h-10 px-3 text-red-500 focus:text-red-400 focus:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-3" />
          {t("Delete", "Delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
