"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useImages } from "@/hooks/use-images";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@base-ui/react/scroll-area"; // Base UI seen in package.json
import { 
  Image as ImageIcon, 
  Upload, 
  Search, 
  Check, 
  X,
  Plus
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MediaPickerProps {
  onSelect: (url: string) => void;
  trigger?: React.ReactElement;
  title?: string;
}

export function MediaPicker({ onSelect, trigger, title = "Select Media" }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { images, isLoading, uploadImage } = useImages(
    selectedFolder !== "all" ? selectedFolder : undefined
  );

  const folders = ["all", ...new Set(images.map((img) => img.folder || "general"))];

  const filteredImages = images.filter(img => 
    img.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (img.caption && img.caption.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const result = await uploadImage.mutateAsync({
          file,
          folder: selectedFolder !== "all" ? selectedFolder : "general",
        });
        if (result) {
          onSelect(result.url);
          setIsOpen(false);
        }
      }
    },
    [uploadImage, selectedFolder, onSelect]
  );

  const handleSelect = (url: string) => {
    onSelect(url);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={trigger || <Button variant="outline" size="sm" className="gap-2"><ImageIcon className="w-4 h-4" /> Pick from Gallery</Button>}>
        {/* Children are not needed when using render prop in Base UI dialog trigger */}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col p-0 overflow-hidden bg-white rounded-[2rem] border-none shadow-2xl">
        <DialogHeader className="p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-primary" />
              </div>
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Folders */}
          <div className="w-48 border-r border-slate-100 bg-slate-50/50 p-4 space-y-1 overflow-y-auto hidden sm:block">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4 mt-2">Collections</div>
            {folders.map(folder => (
              <button
                key={folder}
                onClick={() => setSelectedFolder(folder)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  selectedFolder === folder 
                    ? "bg-white text-black shadow-sm ring-1 ring-slate-200" 
                    : "text-slate-500 hover:text-black hover:bg-white/50"
                )}
              >
                {folder === "all" ? "Everywhere" : folder}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <div className="p-4 border-b border-slate-50 flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input 
                  placeholder="Search assets..." 
                  className="pl-10 h-10 bg-slate-50/50 border-none rounded-xl text-xs font-medium"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                size="sm" 
                className="h-10 px-4 rounded-xl bg-black text-white hover:bg-primary transition-colors gap-2 text-[10px] font-black uppercase tracking-widest"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="w-4 h-4" /> Upload
              </Button>
              <input 
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleFileUpload(e.target.files)}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-2xl" />
                  ))}
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-50">
                  <ImageIcon className="w-12 h-12 stroke-[1]" />
                  <p className="text-xs font-black uppercase tracking-widest">No assets found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredImages.map((img) => (
                    <div 
                      key={img.id}
                      className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                      onClick={() => handleSelect(img.url)}
                    >
                      <img 
                        src={img.url} 
                        alt={img.caption || ""} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-primary stroke-[3]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
