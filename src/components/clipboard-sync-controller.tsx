"use client";

import { useState } from "react";
import { useClipboardSync, ClipMetadata } from "@/hooks/use-clipboard-sync";
import { useCollections } from "@/hooks/use-collections";
import { SaveLinkDialog } from "@/components/save-link-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function ClipboardSyncController() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clipData, setClipData] = useState<ClipMetadata | null>(null);
  const [collectionId, setCollectionId] = useState<string>("");
  
  const { collections, createCollection } = useCollections();
  const { toggleSync } = useClipboardSync();

  useEffect(() => {
    const pref = localStorage.getItem("vault_clip_sync");
    if (pref === null) {
      // First time user, show polite request
      toast.custom((t) => (
        <div className="flex flex-col gap-3 p-4 bg-[#14151B] border border-[#A3FF3D]/30 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#A3FF3D]/10 blur-2xl rounded-full" />
          <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest relative z-10 w-full mb-1">
             <span className="w-1.5 h-1.5 rounded-full bg-[#A3FF3D] animate-pulse" />
             Neural Sync Detection
          </h3>
          <p className="text-[12px] text-slate-300 relative z-10 font-bold mb-2 pr-4 leading-relaxed">
             Allow vaultOS to intelligently access your clipboard and automatically save relevant links you copy across the web?
          </p>
          <div className="flex items-center gap-3 relative z-10 mt-auto">
            <Button 
               size="sm"
               onClick={() => {
                 toggleSync(true);
                 toast.dismiss(t);
               }}
               className="bg-[#A3FF3D] hover:bg-[#A3FF3D]/90 text-black font-black uppercase tracking-widest text-[10px] px-6 h-9 rounded-xl shadow-lg shadow-[#A3FF3D]/20 transition-all hover:scale-105"
            >
              Authorize
            </Button>
            <Button 
               size="sm"
               variant="ghost" 
               onClick={() => {
                 localStorage.setItem("vault_clip_sync", "false");
                 toast.dismiss(t);
               }}
               className="text-white/40 hover:text-white font-bold text-[10px] uppercase tracking-widest px-4 h-9 rounded-xl"
            >
              Not Now
            </Button>
          </div>
        </div>
      ), { duration: 15000, id: "clip-prompt", position: "bottom-right" });
    }
  }, [toggleSync]);

  const handleLinkDetected = async (data: ClipMetadata) => {
    // Determine the smart collection ID
    let targetCollectionId = "";
    const existing = collections.find(c => c.name.toLowerCase() === data.smartCollectionName.toLowerCase());
    
    if (existing) {
      targetCollectionId = existing.id;
    } else {
      // Create it
      try {
        toast.loading(`Creating Neural Sector: ${data.smartCollectionName}...`, { id: "col-create" });
        const newCol = await createCollection.mutateAsync({
          name: data.smartCollectionName,
          description: `Auto-generated collection for ${data.domain}`,
          is_public: false
        });
        targetCollectionId = newCol.id;
        toast.dismiss("col-create");
      } catch (err: any) {
        toast.dismiss("col-create");
        console.error("auto collect failed", err.message || err);
        // Continue even if collection creation fails (handles race conditions or RLS issues)
      }
    }

    setClipData(data);
    setCollectionId(targetCollectionId);
    setDialogOpen(true);
  };

  // The hook does background work when window is focused
  useClipboardSync(handleLinkDetected);

  return (
    <>
      <SaveLinkDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={clipData ? { 
          url: clipData.url, 
          title: clipData.title, 
          description: clipData.description,
          collectionId: collectionId
        } : null}
      />
    </>
  );
}
