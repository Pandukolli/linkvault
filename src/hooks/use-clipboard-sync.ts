"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

export interface ClipMetadata {
  url: string;
  title: string;
  description: string;
  domain: string;
  smartCollectionName: string;
}

// Friendly brand names for common domains
const BRAND_MAP: Record<string, string> = {
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "twitter.com": "Twitter",
  "x.com": "X (Twitter)",
  "github.com": "GitHub",
  "linkedin.com": "LinkedIn",
  "reddit.com": "Reddit",
  "instagram.com": "Instagram",
  "facebook.com": "Facebook",
  "tiktok.com": "TikTok",
  "medium.com": "Medium",
  "dev.to": "Dev.to",
  "notion.so": "Notion",
  "figma.com": "Figma",
  "vercel.com": "Vercel",
  "netlify.com": "Netlify",
  "chatgpt.com": "ChatGPT",
  "chat.openai.com": "ChatGPT",
  "grok.com": "Grok",
  "claude.ai": "Claude",
  "perplexity.ai": "Perplexity",
  "stackoverflow.com": "Stack Overflow",
  "npmjs.com": "npm",
  "docs.google.com": "Google Docs",
  "drive.google.com": "Google Drive",
};

function getSmartCollectionName(hostname: string): { domain: string; smartCollectionName: string } {
  const cleanHost = hostname.replace(/^www\./, "");
  
  // Check brand map first
  for (const [key, brand] of Object.entries(BRAND_MAP)) {
    if (cleanHost === key || cleanHost.endsWith(`.${key}`)) {
      return { domain: cleanHost, smartCollectionName: brand };
    }
  }

  // Fallback: capitalize the base domain
  const base = cleanHost.split(".")[0];
  const smartCollectionName = base
    ? base.charAt(0).toUpperCase() + base.slice(1)
    : "Quick Saves";

  return { domain: cleanHost, smartCollectionName };
}

export function useClipboardSync(onLinkDetected?: (data: ClipMetadata) => void) {
  const [isSyncActive, setIsSyncActive] = useState(false);
  const lastCheckedRef = useRef<string>("");
  const isActiveRef = useRef<boolean>(false);

  // Keep ref in sync with state so event listeners always see current value
  useEffect(() => {
    isActiveRef.current = isSyncActive;
  }, [isSyncActive]);

  const checkClipboard = useCallback(async () => {
    if (!isActiveRef.current) {
      console.log("[ClipboardSync] Skipping — sync not active");
      return;
    }

    console.log("[ClipboardSync] Checking clipboard...");

    // Guard: clipboard API only exists in browser
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      console.warn("[ClipboardSync] navigator.clipboard unavailable");
      return;
    }

    try {
      const text = await navigator.clipboard.readText();

      if (!text || text === lastCheckedRef.current) {
        console.log("[ClipboardSync] No new text");
        return;
      }

      lastCheckedRef.current = text;

      // Validate URL
      const urlPattern = /^(https?:\/\/[^\s]+)/;
      const match = text.trim().match(urlPattern);
      if (!match) {
        console.log("[ClipboardSync] Not a URL:", text.slice(0, 60));
        return;
      }

      const url = match[0];
      console.log("[ClipboardSync] Detected URL:", url);

      let domain = "";
      let smartCollectionName = "Quick Saves";

      try {
        const parsed = new URL(url);
        const result = getSmartCollectionName(parsed.hostname);
        domain = result.domain;
        smartCollectionName = result.smartCollectionName;
      } catch {
        console.warn("[ClipboardSync] Invalid URL:", url);
        return;
      }

      toast.info("🔗 Extracting link insights...", { id: "clip-sync", duration: 3000 });

      // Fetch metadata
      let title = "";
      let description = "";
      try {
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const meta = await res.json();
          title = meta.title || "";
          description = meta.description || "";
          console.log("[ClipboardSync] Metadata fetched:", { title, description });
        }
      } catch (e) {
        console.debug("[ClipboardSync] Metadata fetch failed:", e);
      }

      toast.dismiss("clip-sync");

      const clipData: ClipMetadata = { url, title, description, domain, smartCollectionName };
      console.log("[ClipboardSync] Dispatching to handler:", clipData);

      if (onLinkDetected) {
        onLinkDetected(clipData);
      }
    } catch (err) {
      // DOMException: NotAllowedError is normal when page isn't focused
      console.debug("[ClipboardSync] Read failed (expected if not focused):", err);
    }
  }, [onLinkDetected]);

  // Load preference from localStorage (SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const pref = localStorage.getItem("vault_clip_sync");
    if (pref === "true") {
      setIsSyncActive(true);
      console.log("[ClipboardSync] Auto-activated from saved preference");
    }
  }, []);

  // Attach focus and visibilitychange listeners for production reliability
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onFocus = () => {
      console.log("[ClipboardSync] Window focused — checking clipboard");
      checkClipboard();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[ClipboardSync] Tab became visible — checking clipboard");
        checkClipboard();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [checkClipboard]);

  // Manual trigger: user pastes manually (fallback for browsers that block auto-read)
  const triggerPaste = useCallback(async () => {
    if (!isSyncActive) {
      toast.error("Enable Clipboard Sync first");
      return;
    }
    // Reset lastChecked so we can re-detect the same URL  
    lastCheckedRef.current = "";
    await checkClipboard();
  }, [isSyncActive, checkClipboard]);

  const toggleSync = async (active: boolean) => {
    if (active) {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        toast.error("Clipboard API not available in this browser.");
        return;
      }
      try {
        // Requesting readText() triggers the permission prompt
        await navigator.clipboard.readText();
        setIsSyncActive(true);
        isActiveRef.current = true;
        localStorage.setItem("vault_clip_sync", "true");
        console.log("[ClipboardSync] Activated by user");
        toast.success("🧠 Clipboard Intelligence Activated", {
          description: "VaultOS will auto-save links you copy.",
        });
      } catch {
        toast.error("Clipboard Permission Denied", {
          description: "Allow clipboard access in browser settings to use this feature.",
        });
      }
    } else {
      setIsSyncActive(false);
      isActiveRef.current = false;
      localStorage.setItem("vault_clip_sync", "false");
      console.log("[ClipboardSync] Deactivated by user");
      toast.info("Clipboard Intelligence Deactivated");
    }
  };

  return {
    isSyncActive,
    toggleSync,
    triggerPaste,
    checkClipboard,
  };
}
