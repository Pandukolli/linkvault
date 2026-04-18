"use client";

import { useState, useCallback } from "react";
import { useClipboardSync, ClipMetadata } from "@/hooks/use-clipboard-sync";
import { useCollections } from "@/hooks/use-collections";
import { useLinks } from "@/hooks/use-links";
import { SaveLinkDialog } from "@/components/save-link-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function ClipboardSyncController() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clipData, setClipData] = useState<ClipMetadata | null>(null);
  const [collectionId, setCollectionId] = useState<string>("");

  const { collections, createCollection } = useCollections();
  const { saveLink } = useLinks();

  // ─── Auto-save handler ───────────────────────────────────────────────────────
  const handleLinkDetected = useCallback(
    async (data: ClipMetadata) => {
      console.log("[ClipboardSyncController] Link detected:", data.url);

      // Find or create the smart collection
      let targetCollectionId = "";
      const existing = collections.find(
        (c) => c.name.toLowerCase() === data.smartCollectionName.toLowerCase()
      );

      if (existing) {
        targetCollectionId = existing.id;
        console.log("[ClipboardSyncController] Using existing collection:", existing.name);
      } else {
        try {
          console.log("[ClipboardSyncController] Creating collection:", data.smartCollectionName);
          toast.loading(`Creating smart collection: ${data.smartCollectionName}...`, {
            id: "col-create",
          });
          const newCol = await createCollection.mutateAsync({
            name: data.smartCollectionName,
            description: `Auto-generated collection for ${data.domain}`,
            is_public: false,
          });
          targetCollectionId = newCol.id;
          toast.dismiss("col-create");
          console.log("[ClipboardSyncController] Collection created:", newCol.id);
        } catch (err: unknown) {
          toast.dismiss("col-create");
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[ClipboardSyncController] Collection creation failed:", msg);
          // Don't bail — still try to save the link
        }
      }

      // Auto-save link directly (no dialog needed for auto-save)
      try {
        console.log("[ClipboardSyncController] Auto-saving link...");
        await saveLink.mutateAsync({
          url: data.url,
          title: data.title || data.url,
          description: data.description || "",
          collection_id: targetCollectionId || undefined,
          tags: [],
        });

        toast.success(`🔗 Link auto-saved to "${data.smartCollectionName}"`, {
          description: data.title || data.url,
          duration: 5000,
          action: {
            label: "View",
            onClick: () => {
              // Open the save dialog for the user to review/edit
              setClipData(data);
              setCollectionId(targetCollectionId);
              setDialogOpen(true);
            },
          },
        });
      } catch (saveErr: any) {
        const errorMsg = saveErr?.message || (typeof saveErr === 'object' ? JSON.stringify(saveErr) : String(saveErr));
        console.error("[ClipboardSyncController] Auto-save failed:", errorMsg);

        // Fall back to dialog so user can save manually
        setClipData(data);
        setCollectionId(targetCollectionId);
        setDialogOpen(true);
      }
    },
    [collections, createCollection, saveLink]
  );

  // The hook does background work when window is focused / tab becomes visible
  const { toggleSync } = useClipboardSync(handleLinkDetected);

  // ─── First-time onboarding prompt ────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const pref = localStorage.getItem("vault_clip_sync");
    if (pref === null) {
      toast.custom(
        (t) => (
          <div className="flex flex-col gap-3 p-4 bg-[#14151B] border border-[#06B6D4]/30 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#06B6D4]/10 blur-2xl rounded-full" />
            <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest relative z-10 w-full mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
              Neural Sync Detection
            </h3>
            <p className="text-[12px] text-slate-300 relative z-10 font-bold mb-2 pr-4 leading-relaxed">
              Allow vaultOS to auto-detect and save links you copy across the web?
            </p>
            <div className="flex items-center gap-3 relative z-10 mt-auto">
              <Button
                size="sm"
                onClick={() => {
                  toggleSync(true);
                  toast.dismiss(t);
                }}
                className="bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-black font-black uppercase tracking-widest text-[10px] px-6 h-9 rounded-xl shadow-lg shadow-[#06B6D4]/20 transition-all hover:scale-105"
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
        ),
        { duration: 15000, id: "clip-prompt", position: "bottom-right" }
      );
    }
  }, [toggleSync]);

  return (
    <>
      <SaveLinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={
          clipData
            ? {
              url: clipData.url,
              title: clipData.title,
              description: clipData.description,
              collectionId: collectionId,
            }
            : null
        }
      />
    </>
  );
}
