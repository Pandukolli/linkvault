"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FolderOpen, Globe, Lock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Collection } from "@/lib/types";

interface CollectionCardProps {
  collection: Collection & { link_count?: number };
  onEdit?: (collection: Collection) => void;
  onDelete?: (id: string) => void;
}

export function CollectionCard({ collection, onEdit, onDelete }: CollectionCardProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative h-full"
    >
      <Link href={`/dashboard/collections/${collection.id}`}>
        <div className="rounded-[2rem] bg-card border-[1.5px] border-elegant hover:border-primary/30 p-7 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 h-full flex flex-col group">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-500 group-hover:scale-110">
              <FolderOpen className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div onClick={(e) => e.preventDefault()}>
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-100 p-1.5 shadow-2xl">
                  <DropdownMenuItem onClick={() => onEdit?.(collection)} className="cursor-pointer rounded-lg font-bold text-sm h-10 px-3">
                    <Pencil className="w-4 h-4 mr-3 text-black opacity-70" />
                    {t("Edit", "Edit")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(collection.id)}
                    className="cursor-pointer rounded-lg font-black text-sm h-10 px-3 text-red-500 focus:text-red-400 focus:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    {t("Delete", "Delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <h3 className="font-black text-xl text-black mb-2 tracking-tight transition-colors group-hover:text-primary">{collection.name}</h3>
          {collection.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-6 font-bold leading-relaxed tracking-tight">
              {collection.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-auto pt-5 border-t border-slate-50">
            <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border-none">
              {collection.link_count || 0} {t("links", "links")}
            </Badge>
            <Badge
              variant="secondary"
              className={`text-[10px] font-black uppercase tracking-widest border-none ${
                collection.is_public
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {collection.is_public ? (
                <><Globe className="w-3 h-3 mr-1.5" /> {t("Public", "Public")}</>
              ) : (
                <><Lock className="w-3 h-3 mr-1.5" /> {t("Private", "Private")}</>
              )}
            </Badge>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
