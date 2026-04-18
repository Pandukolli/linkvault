"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Extension, Node, mergeAttributes } from "@tiptap/core";
import { VoiceNoteRecorder } from "./voice-note-recorder";
import { handleTransliterationKeyDown } from "./transliteration-extension";

export const VoiceNoteExtension = Node.create({
  name: "voiceNote",
  group: "block",
  atom: true,
  addAttributes() {
    return { url: { default: null }, duration: { default: 0 }, timestamp: { default: 0 } };
  },
  parseHTML() { return [{ tag: "div.nb-voice-note" }]; },
  renderHTML({ HTMLAttributes }) {
    return [
      "div", 
      mergeAttributes(HTMLAttributes, { class: "nb-voice-note", contenteditable: "false" }),
      ["span", {}, "🎙️ Voice Note "],
      ["audio", { src: HTMLAttributes.url, controls: "true", class: "h-8" }]
    ];
  },
});

export const StickerExtension = Node.create({
  name: "sticker",
  group: "inline",
  inline: true,
  addAttributes() { return { emoji: { default: "⭐" } }; },
  parseHTML() { return [{ tag: "span.nb-sticker" }]; },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { class: "nb-sticker" }), HTMLAttributes.emoji];
  },
});

/* ─────────── Custom Font Size Extension ─────────── */
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize) => ({ chain }) => {
        return chain().setMark("textStyle", { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

const EnhancedImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'none',
        parseHTML: element => element.getAttribute('data-align') || 'none',
        renderHTML: attributes => {
          if (attributes.align === 'left') return { 'data-align': 'left', style: 'float: left; margin: 0 1.5rem 1rem 0; max-width: 50%;' };
          if (attributes.align === 'right') return { 'data-align': 'right', style: 'float: right; margin: 0 0 1rem 1.5rem; max-width: 50%;' };
          if (attributes.align === 'center') return { 'data-align': 'center', style: 'display: block; margin: 2rem auto; clear: both;' };
          return { 'data-align': 'none', style: 'display: inline-block; max-width: 100%;' };
        },
      },
      src: { default: null },
      alt: { default: null },
      title: { default: null },
    };
  },
});
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Link as LinkIcon,
  ImagePlus,
  Minus,
  Undo,
  Redo,
  Type,
  Palette,
  ChevronDown,
  Table as TableIcon,
  Columns,
  Rows,
  Trash2,
  Mic,
  PenTool,
  StickyNote,
  Languages
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─────────── Constants (8 Vibrant Paper Colors) ─────────── */
export const PAGE_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Cream", value: "#fdf6e3" },
  { name: "Mint", value: "#f0fff4" },
  { name: "Sky", value: "#f0f9ff" },
  { name: "Lavender", value: "#f5f3ff" },
  { name: "Sand", value: "#fdfaf6" },
];

export const EDITOR_FONTS = [
  { name: "Qwigley (Classic)", value: "'Qwigley', cursive" },
  { name: "Inter", value: "'Inter', sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Merriweather", value: "'Merriweather', serif" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Libre Baskerville", value: "'Libre Baskerville', serif" },
  { name: "Crimson Text", value: "'Crimson Text', serif" },
  { name: "Lora", value: "'Lora', serif" },
  { name: "Literata", value: "'Literata', serif" },
  { name: "Source Serif Pro", value: "'Source Serif Pro', serif" },
  { name: "EB Garamond", value: "'EB Garamond', serif" },
  { name: "Satoshi", value: "'Satoshi', sans-serif" },
];

export const TEXT_COLORS = [
  { name: "Default", value: "inherit" },
  { name: "Charcoal", value: "#333333" },
  { name: "Steel", value: "#64748b" },
  { name: "Mint", value: "#10b981" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Ruby", value: "#e11d48" },
  { name: "Forest", value: "#166534" },
  { name: "Royal", value: "#1e40af" },
  { name: "Plum", value: "#701a75" },
];

/* ─────────── Types ─────────── */
interface NotesEditorProps {
  content?: Record<string, unknown> | null;
  onUpdate?: (content: Record<string, unknown>, textStats: { words: number; chars: number; readingTime: number }) => void;
  placeholder?: string;
  editable?: boolean;
  autofocus?: boolean;
  showGridLines?: boolean;
  pageColor?: string;
  onPageColorChange?: (color: string) => void;
  fontFamily?: string;
  onFontChange?: (font: string) => void;
  isHandwriting?: boolean;
  onHandwritingToggle?: (checked: boolean) => void;
  typingLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}

const STICKERS = [
  "⭐", "💖", "🌸", "📌", "🎈", "✨", "🔥", "🎀", "🧸",
  "❤️", "💜", "💙", "🌻", "🌿", "🍀", "🌙", "☁️", "⚡",
  "🦋", "🐱", "🐶", "☕", "📸", "🎨", "🎵", "🍓", "🍰",
  "💡", "🔒", "🔑", "🚀", "💎", "🦄", "🌈", "☀️", "🎉"
];

function StickerPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <ToolBtn onClick={() => setOpen(!open)} title="Add Sticker"><StickyNote className="w-3.5 h-3.5" /></ToolBtn>
      {open && (
         <div className="absolute top-10 left-0 bg-white/95 backdrop-blur-xl shadow-xl border border-slate-200 p-3 rounded-[16px] w-[220px] max-h-64 overflow-y-auto z-50">
           <div className="grid grid-cols-6 gap-2">
             {STICKERS.map(s => (
               <button key={s} onClick={() => { onSelect(s); setOpen(false); }} className="text-xl flex items-center justify-center hover:bg-slate-100 hover:scale-125 transition-all p-1 rounded-md">
                 {s}
               </button>
             ))}
           </div>
         </div>
      )}
    </div>
  );
}

/* ─────────── Toolbar Button ─────────── */
function ToolBtn({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      className={`ntb-btn ${isActive ? "active" : ""}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="ntb-sep" />;
}

/* ─────────── Language Selector Dropdown ─────────── */
const SUPPORTED_LANGUAGES = [
  { value: "en", label: "English", flag: "🇺🇸", font: undefined },
  { value: "hi", label: "Hindi", flag: "🇮🇳", font: "'Noto Sans Devanagari', sans-serif" },
  { value: "te", label: "Telugu", flag: "🇮🇳", font: "'Noto Sans Telugu', sans-serif" },
  { value: "ta", label: "Tamil", flag: "🇮🇳", font: "'Noto Sans Tamil', sans-serif" },
];

export function getScriptFont(lang: string) {
  return SUPPORTED_LANGUAGES.find((l) => l.value === lang)?.font;
}

function LanguageSelector({
  currentLang,
  onSelect,
}: {
  currentLang: string;
  onSelect: (lang: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as any)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = SUPPORTED_LANGUAGES.find((l) => l.value === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="ntb-dropdown" ref={ref}>
      <button
        className="ntb-dropdown-trigger font-dropdown !px-2"
        onClick={() => setOpen(!open)}
        title="Typing Language"
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span className="ntb-dropdown-label hidden sm:inline-block w-6 font-bold uppercase">{current.value}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ntb-dropdown-menu">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              className={`ntb-dropdown-item ${currentLang === lang.value ? "active" : ""}`}
              onClick={() => {
                onSelect(lang.value);
                setOpen(false);
              }}
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span> {lang.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── Font Selector Dropdown ─────────── */
function FontSelector({
  currentFont,
  onSelect,
}: {
  currentFont: string;
  onSelect: (font: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as any)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = EDITOR_FONTS.find((f) => f.value === currentFont) || EDITOR_FONTS[0];

  return (
    <div className="ntb-dropdown" ref={ref}>
      <button
        className="ntb-dropdown-trigger font-dropdown"
        onClick={() => setOpen(!open)}
        title="Font family"
      >
        <Type className="w-3.5 h-3.5" />
        <span className="ntb-dropdown-label">{current.name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ntb-dropdown-menu">
          {EDITOR_FONTS.map((font) => (
            <button
              key={font.name}
              className={`ntb-dropdown-item ${currentFont === font.value ? "active" : ""}`}
              style={{ fontFamily: font.value }}
              onClick={() => {
                onSelect(font.value);
                setOpen(false);
              }}
            >
              {font.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


/* ─────────── Font Size Input (Direct Number) ─────────── */
function FontSizeInput({ editor }: { editor: Editor }) {
  const [val, setVal] = useState("16");

  useEffect(() => {
    const currentSize = editor.getAttributes("textStyle").fontSize || "16px";
    setVal(currentSize.replace("px", ""));
  }, [editor.state.selection]);

  const updateSize = (newSize: string) => {
    if (!newSize || isNaN(Number(newSize))) return;
    const s = Math.min(200, Math.max(1, Number(newSize)));
    editor.chain().focus().setFontSize(`${s}px`).run();
    setVal(s.toString());
  };

  return (
    <div className="flex items-center gap-1 group bg-black/5 hover:bg-black/10 rounded-lg px-2 py-0.5 border border-black/5 transition-all">
      <Type className="w-3 h-3 text-muted-foreground" />
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={(e) => updateSize(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") updateSize((e.target as HTMLInputElement).value); }}
        className="w-10 bg-transparent border-none outline-none text-[12px] font-bold text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        title="Font Size (px)"
      />
      <span className="text-[10px] font-bold text-muted-foreground pointer-events-none">px</span>
    </div>
  );
}

/* ─────────── Page Color Picker ─────────── */
function PageColorPicker({
  currentColor,
  onSelect,
}: {
  currentColor: string;
  onSelect: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as any)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="ntb-dropdown" ref={ref}>
      <button
        className="ntb-dropdown-trigger color-dropdown"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(!open)}
        title="Page color"
      >
        <Palette className="w-3.5 h-3.5" />
        <div
          className="ntb-color-swatch-sm"
          style={{ background: currentColor || "#f8f1e3" }}
        />
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ntb-dropdown-menu ntb-colorgroup-menu">
          {PAGE_COLORS.map((c) => (
            <button
              key={c.value}
              onMouseDown={(e) => e.preventDefault()}
              className={`ntb-color-option-sq ${currentColor === c.value ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                onSelect(c.value);
                setOpen(false);
              }}
              title={c.name}
            >
              <div className="ntb-color-sq" style={{ background: c.value }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── Image Upload Function ─────────── */
async function uploadImage(file: File): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to upload images");
      return null;
    }

    const ext = file.name.split(".").pop() || "png";
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("note-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) {
      console.error("Upload error:", error);
      toast.error("Image upload failed — ensure bucket exists & is public");
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("note-images")
      .getPublicUrl(fileName);

    toast.success("Image uploaded!");
    return urlData.publicUrl;
  } catch (err) {
    console.error("Upload error:", err);
    toast.error("Failed to upload image");
    return null;
  }
}

/* ─────────── Toolbar Component ─────────── */
function NotesToolbar({
  editor,
  pageColor,
  onPageColorChange,
  fontFamily,
  onFontChange,
  isHandwriting,
  onHandwritingToggle,
  showVoice,
  onVoiceToggle,
  typingLanguage,
  onLanguageChange,
}: {
  editor: Editor;
  pageColor: string;
  onPageColorChange: (color: string) => void;
  fontFamily: string;
  onFontChange: (font: string) => void;
  isHandwriting?: boolean;
  onHandwritingToggle?: (val: boolean) => void;
  showVoice: boolean;
  onVoiceToggle: () => void;
  typingLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}) {
  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL (include https://):");
    if (url) {
      if (editor.state.selection.empty) {
        editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
      } else {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  }, [editor]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }
      const url = await uploadImage(file);
      if (url) {
        // Insert image and then an empty paragraph so the cursor lands right after it without overwriting the image
        const pos = editor.state.selection.to;
        editor
          .chain()
          .focus()
          .insertContentAt(pos, [
            { type: 'image', attrs: { src: url } },
            { type: 'paragraph' }
          ])
          .run();
      }
    };
    input.click();
  }, [editor]);

  // showVoice is now lifted to NotesEditor — received as prop
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!editor) return;
    const updateFocus = () => setIsFocused(editor.isFocused);
    editor.on("focus", updateFocus);
    editor.on("blur", updateFocus);
    return () => { editor.off("focus", updateFocus); editor.off("blur", updateFocus); }
  }, [editor]);

  return (
    <div className="ntb-toolbar">
      {/* Primary Tools Row */}
      <div className="ntb-toolbar-row">
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        <LanguageSelector currentLang={typingLanguage || "en"} onSelect={(l) => onLanguageChange?.(l)} />

        <Sep />

        <FontSelector currentFont={fontFamily} onSelect={onFontChange} />
        <FontSizeInput editor={editor} />
        <PageColorPicker currentColor={pageColor} onSelect={onPageColorChange} />

        <Sep />

        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold">
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic">
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Strike">
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive("highlight")} title="Highlight">
          <Highlighter className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="H1">
          <span className="text-[10px] font-bold">H1</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="H2">
          <span className="text-[10px] font-bold">H2</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="H3">
          <span className="text-[10px] font-bold">H3</span>
        </ToolBtn>

        <Sep />

        <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} title="Inline Code">
          <Code className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        <div className="relative">
          <ToolBtn onClick={onVoiceToggle} title="Record Voice Note" isActive={showVoice}>
            <Mic className="w-3.5 h-3.5" />
          </ToolBtn>
          {showVoice && (
            <div className="absolute top-full mt-2 left-0 z-50">
              <VoiceNoteRecorder 
                onSave={(url, dur) => {
                  const pos = editor.state.selection.to;
                  editor.chain().focus().insertContentAt(pos, { type: "voiceNote", attrs: { url, duration: dur } }).run();
                  onVoiceToggle(); // close after save
                }} 
                onCancel={onVoiceToggle} 
              />
            </div>
          )}
        </div>

        <StickerPicker onSelect={(s) => editor.chain().focus().insertContent({ type: "sticker", attrs: { emoji: s } }).run()} />

        <ToolBtn onClick={() => { if(onHandwritingToggle) onHandwritingToggle(!isHandwriting); }} title="Handwriting Mode" isActive={isHandwriting}>
          <PenTool className="w-3.5 h-3.5" />
        </ToolBtn>

        <div className="ml-auto flex items-center gap-1">
          <ToolBtn onClick={handleImageUpload} title="Insert Image">
            <ImagePlus className="w-3.5 h-3.5" />
          </ToolBtn>
        </div>
      </div>

      <div className="ntb-toolbar-row ntb-toolbar-row2">
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} title="Left">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })} title="Center">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })} title="Right">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="List">
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Ordered">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive("taskList")} title="Task List">
          <ListTodo className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Quote">
          <Quote className="w-3.5 h-3.5" />
        </ToolBtn>
        
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Page Break / Rule">
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>
        
        <div className="ml-auto">
          <ToolBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Table">
            <TableIcon className="w-3.5 h-3.5" />
          </ToolBtn>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Word Count Helpers ─────────── */
function getWordCount(editor: Editor | null): number {
  if (!editor) return 0;
  const text = editor.state.doc.textContent;
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}
function getCharCount(editor: Editor | null): number {
  if (!editor) return 0;
  return editor.state.doc.textContent.length;
}

/* ─────────── Main Editor Component ─────────── */
export function NotesEditor({
  content,
  onUpdate,
  placeholder = "Start writing your thoughts...",
  editable = true,
  autofocus = false,
  showGridLines = false,
  pageColor = "#f8f1e3",
  onPageColorChange,
  fontFamily = "'Qwigley', cursive",
  onFontChange,
  isHandwriting = false,
  onHandwritingToggle,
  typingLanguage = "en",
  onLanguageChange,
}: NotesEditorProps) {
  const isInternalUpdate = useRef(false);
  // Lifted from NotesToolbar so state persists through re-renders
  const [showVoice, setShowVoice] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder }),
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      VoiceNoteExtension,
      StickerExtension,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: "nb-link" },
      }),
      EnhancedImage.configure({
        HTMLAttributes: { class: "nb-image" },
        allowBase64: true,
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || "",
    editable,
    autofocus,
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      const w = getWordCount(editor);
      const c = getCharCount(editor);
      const readingTime = Math.ceil(w / 200); // 200 words per min avg
      onUpdate?.(
        editor.getJSON() as Record<string, unknown>, 
        { words: w, chars: c, readingTime }
      );
    },
    editorProps: {
      attributes: {
        class: `nb-prosemirror ${showGridLines ? "nb-grid-lines" : ""} ${isHandwriting ? "nb-handwriting" : ""}`,
        style: `font-family: ${getScriptFont(typingLanguage) || fontFamily}; line-height: ${typingLanguage !== 'en' ? '1.8' : '1.7'};`,
        lang: typingLanguage,
      },
      handleKeyDown: (view, event) => {
        return handleTransliterationKeyDown(view, event, typingLanguage);
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          const file = files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            uploadImage(file).then((url) => {
              if (url && editor) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            });
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                uploadImage(file).then((url) => {
                  if (url && editor) {
                    editor.chain().focus().setImage({ src: url }).run();
                  }
                });
              }
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  // Optional external sync logic removed because we now use `key={activeNote.id}` in the parent 
  // to force remount on switch, which completely eliminates race condition overwrites while typing!
  
  // Update font family dynamically
  useEffect(() => {
    if (editor) {
      const el = editor.view.dom as HTMLElement;
      el.style.fontFamily = getScriptFont(typingLanguage) || fontFamily;
      el.style.lineHeight = typingLanguage !== 'en' ? '1.8' : '1.7';
      el.lang = typingLanguage;
    }
  }, [fontFamily, typingLanguage, editor]);

  // Click-to-type anywhere magic
  const handleDoubleClickEmptySpace = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!editor) return;
    
    // Check if we actually clicked an empty space, not inside the text block itself
    const target = e.target as HTMLElement;
    if (target.classList.contains("ProseMirror")) return; // they clicked the text directly
    
    const dom = editor.view.dom;
    const lastChild = dom.lastElementChild;
    if (!lastChild) return;
    
    // Calculate how far down they clicked relative to the last line of text
    const childRect = lastChild.getBoundingClientRect();
    const clickY = e.clientY;
    
    if (clickY > childRect.bottom) {
      const diff = clickY - childRect.bottom;
      const count = Math.max(1, Math.floor(diff / 28)); // Roughly 28px per empty paragraph line
      
      let html = "";
      for (let i = 0; i < count; i++) {
        html += "<p></p>";
      }
      
      editor.chain().focus('end').insertContent(html).run();
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="nb-editor-skeleton bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
        <div className="nb-toolbar-skeleton bg-black/5 animate-pulse h-10 w-full rounded-xl mb-8" />
        <div className="nb-content-skeleton space-y-4">
          <div className="nb-skel-line w-[80%] h-4 bg-black/5 animate-pulse rounded-md" />
          <div className="nb-skel-line w-[50%] h-4 bg-black/5 animate-pulse rounded-md" />
          <div className="nb-skel-line w-[75%] h-4 bg-black/5 animate-pulse rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="nb-editor-wrapper">
      {editable && (
        <NotesToolbar 
          editor={editor} 
          pageColor={pageColor} 
          onPageColorChange={onPageColorChange!} 
          fontFamily={fontFamily} 
          onFontChange={onFontChange!} 
          isHandwriting={isHandwriting}
          onHandwritingToggle={onHandwritingToggle}
          showVoice={showVoice}
          onVoiceToggle={() => setShowVoice(v => !v)}
          typingLanguage={typingLanguage}
          onLanguageChange={onLanguageChange}
        />
      )}
      {editor && editor.isActive('image') && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-popover border border-border shadow-2xl rounded-xl p-1.5 flex gap-1.5 items-center shadow-black/50">
          <button className="p-2 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors flex items-center gap-2" onClick={() => editor.chain().focus().updateAttributes('image', { align: 'left' }).run()} title="Float Left">
            <AlignLeft className="w-4 h-4" /> <span className="text-xs font-medium">Left Wrap</span>
          </button>
          <div className="w-px h-5 bg-border" />
          <button className="p-2 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors flex items-center gap-2" onClick={() => editor.chain().focus().updateAttributes('image', { align: 'none' }).run()} title="Inline">
            <AlignCenter className="w-4 h-4" /> <span className="text-xs font-medium">Inline</span>
          </button>
          <button className="p-2 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors flex items-center gap-2" onClick={() => editor.chain().focus().updateAttributes('image', { align: 'right' }).run()} title="Float Right">
            <AlignRight className="w-4 h-4" /> <span className="text-xs font-medium">Right Wrap</span>
          </button>
          <div className="w-px h-5 bg-border" />
          <button 
            className="p-2 rounded hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors flex items-center gap-2" 
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              editor.chain().focus().deleteSelection().run();
              toast.success("Image deleted");
            }} 
            title="Delete Image"
          >
            <Trash2 className="w-4 h-4" /> <span className="text-xs font-medium">Delete Only Image</span>
          </button>
        </div>
      )}
      <div 
        className="nb-editor-content-wrap" 
        style={{ 
          fontFamily: fontFamily 
        } as React.CSSProperties}
        onDoubleClick={handleDoubleClickEmptySpace}
      >
        <EditorContent 
          editor={editor} 
          onDoubleClick={(e) => {
            if (editor?.isActive('image')) {
              editor.chain().focus().run();
            }
          }}
        />
      </div>
    </div>
  );
}
