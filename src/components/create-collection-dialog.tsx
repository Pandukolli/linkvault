"use client";

import { useState } from "react";
import { useCollections } from "@/hooks/use-collections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FolderPlus, Loader2 } from "lucide-react";
import type { Collection } from "@/lib/types";
import { Switch } from "@/components/ui/switch";

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCollection?: Collection | null;
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
  editingCollection,
}: CreateCollectionDialogProps) {
  const [name, setName] = useState(editingCollection?.name || "");
  const [description, setDescription] = useState(editingCollection?.description || "");
  const [isPublic, setIsPublic] = useState(editingCollection?.is_public || false);

  const { createCollection, updateCollection } = useCollections();
  const isEditing = !!editingCollection;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && editingCollection) {
      updateCollection.mutate({
        id: editingCollection.id,
        name: name.trim(),
        description: description.trim() || null,
        is_public: isPublic,
      });
    } else {
      createCollection.mutate({
        name: name.trim(),
        description: description.trim() || undefined,
        is_public: isPublic,
      });
    }

    setName("");
    setDescription("");
    setIsPublic(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-primary" />
            {isEditing ? "Edit Collection" : "Create Collection"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Name</Label>
            <Input
              id="name"
              placeholder="My Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coll-desc" className="text-sm">Description (optional)</Label>
            <Textarea
              id="coll-desc"
              placeholder="What's this collection about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background/50 resize-none h-20"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="text-sm font-medium">Public Collection</Label>
              <p className="text-xs text-muted-foreground">
                Anyone with the link can view this collection
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <Button
            type="submit"
            disabled={createCollection.isPending || updateCollection.isPending}
            className="w-full h-11"
          >
            {(createCollection.isPending || updateCollection.isPending) && (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            )}
            {isEditing ? "Update Collection" : "Create Collection"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
