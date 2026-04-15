"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export interface ClipMetadata {
  url: string;
  title: string;
  description: string;
  domain: string;
  smartCollectionName: string;
}

export function useClipboardSync(onLinkDetected?: (data: ClipMetadata) => void) {
  const [isSyncActive, setIsSyncActive] = useState(false);
  const [lastCheckedText, setLastCheckedText] = useState("");

  const checkClipboard = useCallback(async () => {
    if (!isSyncActive) return;

    try {
      // Prompt user or read clipboard if permission already granted
      const text = await navigator.clipboard.readText();
      
      // If nothing new or empty
      if (!text || text === lastCheckedText) return;
      setLastCheckedText(text);

      // Validate URL (http or https)
      const urlPattern = /^(https?:\/\/[^\s]+)/g;
      const match = text.trim().match(urlPattern);
      if (!match) return;

      const url = match[0];
      
      // Parse domain for smart collection
      let domain = "";
      let smartCollectionName = "Quick Saves";
      try {
        const parsedNode = new URL(url);
        domain = parsedNode.hostname;
        
        let p = domain.replace("www.", "").split(".")[0];
        if (p) {
          // Capitalize first letter
          smartCollectionName = p.charAt(0).toUpperCase() + p.slice(1);
        }
      } catch (e) {
        // Invalid URL
        return;
      }

      toast.info("Extracting insights from clipboard link...", { id: "clip-sync" });

      // Fetch metadata
      let title = "";
      let description = "";
      try {
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const meta = await res.json();
          title = meta.title || "";
          description = meta.description || "";
        }
      } catch (e) {
        console.debug("Failed to fetch meta", e);
      }

      toast.dismiss("clip-sync");

      const clipData = {
        url,
        title,
        description,
        domain,
        smartCollectionName,
      };

      if (onLinkDetected) {
        onLinkDetected(clipData);
      }
      
    } catch (err) {
      // Usually means permission denied or not focused
      console.debug("Clipboard read failed:", err);
    }
  }, [isSyncActive, lastCheckedText, onLinkDetected]);

  useEffect(() => {
    // Check local storage for user preference
    const pref = localStorage.getItem("vault_clip_sync");
    if (pref === "true") {
      setIsSyncActive(true);
    }
  }, []);

  useEffect(() => {
    // When window gets focus, check clipboard
    window.addEventListener("focus", checkClipboard);
    return () => window.removeEventListener("focus", checkClipboard);
  }, [checkClipboard]);

  // Set active and persist
  const toggleSync = async (active: boolean) => {
    if (active) {
      try {
        // Request permission on toggle
        await navigator.clipboard.readText();
        setIsSyncActive(true);
        localStorage.setItem("vault_clip_sync", "true");
        toast.success("Clipboard Intelligence Activated", {
           description: "VaultOS will automatically analyze copied links."
        });
      } catch (err) {
         toast.error("Clipboard Permission Denied", {
             description: "Please allow clipboard access in your browser settings to enable this feature."
         });
      }
    } else {
      setIsSyncActive(false);
      localStorage.setItem("vault_clip_sync", "false");
      toast.info("Clipboard Intelligence Deactivated");
    }
  };

  return {
    isSyncActive,
    toggleSync,
    checkClipboard
  };
}
