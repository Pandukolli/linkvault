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
import { cn } from "@/lib/utils";
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
        className="group flex items-center gap-4 p-3 rounded-md bg-white border border-[#E5E7EB] hover:border-[#2563EB] transition-all duration-200"
      >
        <div className="w-10 h-10 rounded bg-[#F8FAFC] flex items-center justify-center flex-shrink-0 border border-[#E5E7EB]">
          {link.favicon ? (
            <Image src={link.favicon} alt="" width={20} height={20} className="rounded-sm" unoptimized />
          ) : (
            <Link2 className="w-4 h-4 text-[#9CA3AF]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#111827] text-sm truncate">{link.title || link.url}</h3>
          <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">{hostname}</p>
        </div>

        <div className="hidden md:flex gap-1.5 flex-shrink-0">
          {link.tags?.slice(0, 1).map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-[9px] font-bold bg-[#F1F5F9] text-[#6B7280] border-none">
              {tag.name}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("text-[#9CA3AF] hover:text-[#EF4444]", link.is_favorite && "text-[#EF4444]")}
            onClick={(e) => { e.preventDefault(); onToggleFavorite?.(link.id, !!link.is_favorite); }}
          >
            <Heart className={cn("w-4 h-4", link.is_favorite && "fill-current")} />
          </Button>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white border border-[#E5E7EB] rounded-md overflow-hidden hover:border-[#2563EB] hover:shadow-lg transition-all"
    >
      <div className="relative h-40 bg-[#F1F5F9] border-b border-[#E5E7EB]">
        {link.image_url ? (
          <Image
            src={link.image_url}
            alt={link.title || ""}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Link2 className="w-16 h-16 text-[#6B7280]" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#111827] text-base leading-snug line-clamp-2 hover:text-[#2563EB] transition-colors">
              {link.title || link.url}
            </h3>
            <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest mt-1">{hostname}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t border-[#E5E7EB]">
          <div className="flex flex-1 items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              className={cn("text-[#9CA3AF] hover:text-[#EF4444]", link.is_favorite && "text-[#EF4444]")}
              onClick={(e) => { e.preventDefault(); onToggleFavorite?.(link.id, !!link.is_favorite); }}
            >
              <Heart className={cn("w-3.5 h-3.5", link.is_favorite && "fill-current")} />
            </Button>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon-xs" className="text-[#9CA3AF] hover:text-[#2563EB]">
                <ExternalLink className="w-3.5 h-3.5" />
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
      <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center hover:bg-[#F1F5F9] rounded-md text-[#6B7280] transition-colors">
        <MoreHorizontal className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white border border-[#E5E7EB] rounded-md shadow-xl p-1">
        <DropdownMenuItem onClick={() => onEdit?.(link)} className="rounded-md font-bold text-xs h-9 px-2 text-[#111827] hover:bg-[#F1F5F9] cursor-pointer">
          <Pencil className="w-3.5 h-3.5 mr-2 text-[#2563EB]" />
          {t("Edit")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMoveToCollection?.(link)} className="rounded-md font-bold text-xs h-9 px-2 text-[#111827] hover:bg-[#F1F5F9] cursor-pointer">
          <FolderPlus className="w-3.5 h-3.5 mr-2 opacity-60" />
          {t("Move to Collection")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShare} className="rounded-md font-bold text-xs h-9 px-2 text-[#111827] hover:bg-[#F1F5F9] cursor-pointer">
          <Share2 className="w-3.5 h-3.5 mr-2 opacity-60" />
          {t("Share")}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#E5E7EB]" />
        <DropdownMenuItem
          onClick={() => onDelete?.(link.id)}
          className="rounded-md font-bold text-xs h-9 px-2 text-[#EF4444] hover:bg-red-50 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          {t("Delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

