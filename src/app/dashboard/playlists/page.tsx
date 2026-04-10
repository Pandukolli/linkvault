"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlaylists } from "@/hooks/use-playlists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ListMusic,
  Plus,
  Trash2,
  Clock,
  ChevronLeft,
  Edit2,
  Check,
} from "lucide-react";

export default function PlaylistsPage() {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingName, setEditingName] = useState(false);

  const { playlists, isLoading, createPlaylist, updatePlaylist, deletePlaylist } =
    usePlaylists();

  const activePlaylist = playlists.find((p) => p.id === selectedPlaylist);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createPlaylist.mutate(
      { name: newName.trim(), description: newDesc.trim() || undefined },
      {
        onSuccess: (data) => {
          setNewName("");
          setNewDesc("");
          setShowCreate(false);
          setSelectedPlaylist(data.id);
        },
      }
    );
  };

  const items = (activePlaylist?.items as Array<{ type: string; title: string; id: string }>) || [];

  if (selectedPlaylist && activePlaylist) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-24">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12 pb-8 border-b border-slate-50">
          <Button
            variant="ghost"
            className="h-10 px-4 gap-2 rounded-xl text-slate-400 hover:text-black hover:bg-slate-50 transition-all font-black uppercase text-[10px] tracking-widest self-start md:self-auto"
            onClick={() => {
              setSelectedPlaylist(null);
              setEditingName(false);
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
            Return to Protocols
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-xl text-slate-300 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
            onClick={() => {
              if (confirm("Permanently erase archival curation?")) {
                deletePlaylist.mutate(activePlaylist.id);
                setSelectedPlaylist(null);
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Playlist Header */}
        <div className="mb-16">
          {editingName ? (
            <div className="flex items-center gap-4">
              <Input
                value={activePlaylist.name}
                onChange={(e) =>
                  updatePlaylist.mutate({ id: activePlaylist.id, name: e.target.value })
                }
                className="text-4xl font-black h-auto py-2 rounded-2xl border-primary/20 bg-primary/5 uppercase tracking-tight"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                onClick={() => setEditingName(false)}
              >
                <Check className="w-6 h-6 stroke-[3]" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4 group">
              <h1 className="text-5xl font-black text-black tracking-tight uppercase">
                {activePlaylist.name}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl text-slate-200 hover:bg-slate-50 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                onClick={() => setEditingName(true)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          )}
          {activePlaylist.description && (
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4 opacity-60">
              {activePlaylist.description}
            </p>
          )}
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="text-center py-32 rounded-[3.5rem] bg-white border border-slate-100 shadow-2xl shadow-primary/5">
            <div className="w-24 h-24 mx-auto bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100 shadow-inner group transition-all duration-500 hover:scale-110">
              <ListMusic className="w-10 h-10 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-3xl font-black text-black mb-3 tracking-tighter uppercase">Playlist empty</h3>
            <p className="text-sm text-slate-400 font-bold max-w-sm mx-auto uppercase tracking-[0.2em] leading-relaxed">
              Add archival links, notes, or media assets to populate this curation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id || index}
                className="group bg-white border border-slate-100 rounded-[2rem] p-6 cursor-pointer flex items-center gap-6 shadow-2xl shadow-primary/[0.02] hover:shadow-primary/[0.08] hover:-translate-y-1 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-slate-300 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-black text-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 opacity-50">
                    {item.type} protocol asset
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tight uppercase flex items-center gap-5">
            <div className="w-12 h-12 rounded-[1.5rem] bg-primary/5 flex items-center justify-center">
              <ListMusic className="w-7 h-7 text-primary" />
            </div>
            Playlists
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 opacity-40">
            Curated sequence of verified digital assets
          </p>
        </div>
        <Button
          className="h-12 px-8 gap-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 uppercase tracking-tighter"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          Establish Curation
        </Button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-white border border-slate-100 rounded-[3rem] p-10 space-y-8 mb-10 shadow-2xl shadow-primary/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.03] blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Curation Label</Label>
                <Input
                  placeholder="Enter playlist nomenclature..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-14 text-sm rounded-2xl border-slate-50 font-bold focus:border-primary/20 transition-all shadow-none"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Strategic Description</Label>
                <Input
                  placeholder="Optional context brief..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="h-14 text-sm rounded-2xl border-slate-50 font-bold focus:border-primary/20 transition-all shadow-none"
                />
              </div>
            </div>
            <div className="flex gap-4 relative z-10">
              <Button
                variant="ghost"
                className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black hover:bg-slate-50 transition-all"
                onClick={() => {
                  setShowCreate(false);
                  setNewName("");
                  setNewDesc("");
                }}
              >
                Abort
              </Button>
              <Button
                className="h-14 px-10 gap-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1 uppercase tracking-tighter"
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                <Check className="w-5 h-5 stroke-[3]" />
                Execute Formation
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlist Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-[2.5rem] bg-slate-50" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-32 rounded-[3.5rem] bg-white border border-slate-100 shadow-2xl shadow-primary/5">
          <div className="w-24 h-24 mx-auto bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100 shadow-inner group transition-all duration-500 hover:scale-110">
            <ListMusic className="w-10 h-10 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-3xl font-black text-black mb-3 tracking-tighter uppercase">No Curations established</h3>
          <p className="text-sm text-slate-400 font-bold max-w-sm mx-auto mb-10 uppercase tracking-[0.2em] leading-relaxed">
            Initialize your first strategic playlist to organize digital assets.
          </p>
          <Button
            className="h-14 px-10 gap-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1 uppercase tracking-tighter"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-6 h-6 stroke-[3]" />
            Establish First Curation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => {
            const pItems = (playlist.items as Array<Record<string, unknown>>) || [];
            return (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="group bg-white border border-slate-100 rounded-[3rem] p-10 cursor-pointer shadow-2xl shadow-primary/[0.02] hover:shadow-primary/[0.08] transition-all duration-500 relative overflow-hidden"
                onClick={() => setSelectedPlaylist(playlist.id)}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/[0.02] blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ListMusic className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1.5 rounded-xl tabular-nums uppercase tracking-widest">
                    {pItems.length} Assets
                  </span>
                </div>
                <h3 className="text-xl font-black text-black uppercase tracking-tight mb-3 relative z-10 group-hover:text-primary transition-colors">
                  {playlist.name}
                </h3>
                {playlist.description && (
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] line-clamp-2 mb-6 relative z-10 opacity-70">
                    {playlist.description}
                  </p>
                )}
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2 relative z-10">
                  <Clock className="w-3.5 h-3.5" />
                  Established {new Date(playlist.created_at).toLocaleDateString()}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
