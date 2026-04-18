"use client";

import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, ChevronDown, ChevronUp, Clock, X } from "lucide-react";
import type { Note } from "@/lib/types";

// ─── Helpers ───────────────────────────────────────────────
function extractPreview(json: any): string {
  if (!json?.content) return "";
  let text = "";
  for (const node of json.content) {
    if (node.type === "paragraph" || node.type === "heading") {
      text += node.content?.map((c: any) => c.text || "").join("") + " ";
    }
  }
  return text.trim().substring(0, 120);
}

// ─── FEATURE 1: Memory Threads ──────────────────────────────
// Stored in content._linkedNoteIds: string[]
export interface EnhancedContentExt {
  _linkedNoteIds?: string[];
  _isLegacyLetter?: boolean;
  _unlockDate?: string;
  _isPoetryMode?: boolean;
  [key: string]: any;
}

interface MemoryThreadProps {
  activeNoteId: string;
  allNotes: Note[];
  linkedIds: string[];
  onLink: (ids: string[]) => void;
}

export const MemoryThread = memo(function MemoryThread({
  activeNoteId, allNotes, linkedIds, onLink,
}: MemoryThreadProps) {
  const [open, setOpen] = useState(false);
  const [pickId, setPickId] = useState("");

  const linkedNotes = allNotes.filter(n => linkedIds.includes(n.id) && n.id !== activeNoteId);
  const available   = allNotes.filter(n => n.id !== activeNoteId && !linkedIds.includes(n.id));

  const link = () => {
    if (!pickId) return;
    onLink([...linkedIds, pickId]);
    setPickId("");
  };

  const unlink = (id: string) => onLink(linkedIds.filter(i => i !== id));

  return (
    <div className="nb-thread-root no-print">
      <button
        onClick={() => setOpen(v => !v)}
        className="nb-thread-toggle"
        title="Memory Threads"
      >
        <Link2 className="w-3.5 h-3.5" />
        <span>Threads</span>
        {linkedNotes.length > 0 && (
          <span className="nb-thread-count">{linkedNotes.length}</span>
        )}
        {open ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="nb-thread-panel"
          >
            {/* Thread timeline */}
            {linkedNotes.length > 0 && (
              <div className="nb-thread-timeline">
                {linkedNotes.map((note, i) => (
                  <div key={note.id} className="nb-thread-node">
                    <div className="nb-thread-line" style={{ opacity: i === linkedNotes.length - 1 ? 0 : 1 }} />
                    <div className="nb-thread-dot" />
                    <div className="nb-thread-card">
                      <span className="nb-thread-title">
                        {note.title || "Untitled"}
                      </span>
                      <span className="nb-thread-preview">
                        {extractPreview(note.content) || "Empty note"}
                      </span>
                      <button className="nb-thread-unlink" onClick={() => unlink(note.id)}>
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Link picker */}
            {available.length > 0 ? (
              <div className="nb-thread-picker">
                <select
                  className="nb-thread-select"
                  value={pickId}
                  onChange={e => setPickId(e.target.value)}
                >
                  <option value="">Connect a thought...</option>
                  {available.slice(0, 20).map(n => (
                    <option key={n.id} value={n.id}>
                      {n.title || "Untitled"}
                    </option>
                  ))}
                </select>
                <button className="nb-thread-link-btn" onClick={link} disabled={!pickId}>
                  + Link
                </button>
              </div>
            ) : (
              <p className="text-[10px] text-center opacity-40 mt-2">No other notes to link</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ─── FEATURE 2: Ink & Emotion ────────────────────────────────
// Renders a very subtle mood-tinted overlay on the editor area
const MOOD_TINTS: Record<string, string> = {
  happy:   "rgba(251, 191, 36, 0.04)",
  good:    "rgba(52, 211, 153, 0.04)",
  neutral: "rgba(148, 163, 184, 0.03)",
  sad:     "rgba(99, 102, 241, 0.05)",
  awful:   "rgba(100, 116, 139, 0.06)",
};

interface InkEmotionOverlayProps {
  mood: string | null;
}

export const InkEmotionOverlay = memo(function InkEmotionOverlay({ mood }: InkEmotionOverlayProps) {
  const tint = mood ? (MOOD_TINTS[mood] || null) : null;
  if (!tint) return null;

  return (
    <div
      className="nb-ink-tint"
      style={{ background: tint }}
      aria-hidden="true"
    />
  );
});

// ─── FEATURE 3: Legacy Letters (Write to Future Self) ────────
// Stored in content._isLegacyLetter: true, content._unlockDate: ISO string
interface LegacyLetterProps {
  isLetter: boolean;
  unlockDate: string | null;
  onToggle: (val: boolean) => void;
  onSetDate: (date: string) => void;
  noteCreatedAt: string;
}

export const LegacyLetterBadge = memo(function LegacyLetterBadge({
  isLetter, unlockDate, onToggle, onSetDate, noteCreatedAt,
}: LegacyLetterProps) {
  const [open, setOpen] = useState(false);

  const isLocked = isLetter && unlockDate && new Date(unlockDate) > new Date();
  const isUnlocked = isLetter && unlockDate && new Date(unlockDate) <= new Date();

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minISO = minDate.toISOString().split("T")[0];

  return (
    <div className="nb-letter-root no-print">
      <button
        onClick={() => setOpen(v => !v)}
        className={`nb-letter-btn ${isLetter ? "active" : ""}`}
        title="Write to Future Self"
      >
        <span>{isLocked ? "🔒" : isUnlocked ? "💌" : "✉️"}</span>
        <span className="text-[10px] font-bold">
          {isLocked ? "Sealed" : isUnlocked ? "Unlocked!" : "Future Letter"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.18 }}
            className="nb-letter-panel"
          >
            {isLocked ? (
              // SEALED state
              <div className="nb-letter-sealed">
                <div className="nb-envelope">
                  <div className="nb-envelope-flap" />
                  <div className="nb-envelope-body">
                    <span>💌</span>
                  </div>
                </div>
                <p className="nb-letter-sealed-text">
                  Sealed until
                </p>
                <p className="nb-letter-unlock-date">
                  {new Date(unlockDate!).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
                <button
                  className="nb-letter-cancel-btn"
                  onClick={() => { onToggle(false); onSetDate(""); setOpen(false); }}
                >
                  Remove seal
                </button>
              </div>
            ) : isUnlocked ? (
              // UNLOCKED state
              <div className="nb-letter-unlocked">
                <div className="text-3xl mb-2">💌</div>
                <p className="text-sm font-bold text-emerald-600">Your letter has arrived!</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Originally written on {new Date(noteCreatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
                <button className="nb-letter-cancel-btn mt-3" onClick={() => { onToggle(false); setOpen(false); }}>
                  Mark as read
                </button>
              </div>
            ) : (
              // CONFIGURE state
              <div className="nb-letter-config">
                <p className="nb-letter-config-label">
                  {isLetter ? "Unlock date set" : "Seal this note until a future date"}
                </p>

                {!isLetter ? (
                  <>
                    <div className="nb-letter-date-row">
                      <Clock className="w-3.5 h-3.5 opacity-50" />
                      <input
                        type="date"
                        className="nb-letter-date-input"
                        min={minISO}
                        onChange={e => {
                          if (e.target.value) {
                            onSetDate(new Date(e.target.value).toISOString());
                            onToggle(true);
                            setOpen(false);
                          }
                        }}
                      />
                    </div>
                    <p className="text-[10px] opacity-40 mt-2">
                      The note will be readable but visually "sealed" until the unlock date.
                    </p>
                  </>
                ) : (
                  <button className="nb-letter-cancel-btn" onClick={() => { onToggle(false); onSetDate(""); setOpen(false); }}>
                    Remove seal
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Sealed overlay shown over the editor when letter is locked
interface SealedOverlayProps {
  unlockDate: string;
  onPreview: () => void;
}

export const SealedOverlay = memo(function SealedOverlay({ unlockDate, onPreview }: SealedOverlayProps) {
  const daysLeft = Math.ceil((new Date(unlockDate).getTime() - Date.now()) / 86400000);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="nb-sealed-overlay"
    >
      {/* Animated envelope */}
      <div className="nb-sealed-envelope">
        <motion.div
          className="nb-se-flap"
          animate={{ rotateX: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        <div className="nb-se-body">
          <div className="nb-se-seal">💌</div>
        </div>
      </div>
      <h3 className="nb-sealed-title">Sealed for Future You</h3>
      <p className="nb-sealed-sub">
        Opens in <span className="font-black">{daysLeft} {daysLeft === 1 ? "day" : "days"}</span>
      </p>
      <p className="nb-sealed-date">
        {new Date(unlockDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      </p>
      <button className="nb-sealed-peek" onClick={onPreview}>
        👁 Peek at it anyway
      </button>
    </motion.div>
  );
});

// ─── FEATURE 4: Visual Poetry Mode ──────────────────────────
// Stored in content._isPoetryMode: boolean
interface PoetryModeToggleProps {
  enabled: boolean;
  onToggle: (val: boolean) => void;
}

export const PoetryModeToggle = memo(function PoetryModeToggle({ enabled, onToggle }: PoetryModeToggleProps) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`nb-poetry-btn no-print ${enabled ? "active" : ""}`}
      title="Visual Poetry Mode"
    >
      <span className="text-base">{enabled ? "🌸" : "✍️"}</span>
      <span className="text-[10px] font-bold">
        {enabled ? "Poetry" : "Poetry Mode"}
      </span>
    </button>
  );
});
