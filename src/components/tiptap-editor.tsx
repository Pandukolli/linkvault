"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Undo,
  Redo,
  Sparkles,
  RefreshCw,
  Search,
  ListPlus,
} from "lucide-react";
import { useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface TiptapEditorProps {
  content?: Record<string, unknown> | null;
  onUpdate?: (content: Record<string, unknown>) => void;
  placeholder?: string;
  editable?: boolean;
  autofocus?: boolean;
  debounceMs?: number;
}

function ToolbarButton({
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
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`w-7 h-7 rounded-md ${
        isActive
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );
}

function Toolbar({ editor, onImageUpload }: { editor: Editor, onImageUpload: (file: File) => void }) {
  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageUpload(file);
      }
    };
    input.click();
  }, [onImageUpload]);

  const handleAIAction = async (action: 'improve' | 'seo' | 'continue' | 'engaging') => {
    let text = "";
    let context = "";

    const { from, to } = editor.state.selection;

    if (action === "improve" || action === "engaging") {
      text = editor.state.doc.textBetween(from, to, " ");
      if (!text.trim()) {
        toast.error("Please highlight some text first.");
        return;
      }
    } else if (action === "continue") {
      text = editor.state.doc.textBetween(Math.max(0, from - 1000), from, " ");
      if (!text.trim()) {
        toast.error("Not enough text to continue.");
        return;
      }
    } else if (action === "seo") {
      text = editor.getText();
      if (text.length < 50) {
        toast.error("Please write a bit more content first.");
        return;
      }
    }

    const loader = toast.loading("AI is composing...");

    try {
      const res = await fetch("/api/ai/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text, context })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);

      toast.dismiss(loader);

      if (action === "seo") {
        await navigator.clipboard.writeText(data.result);
        toast.success("SEO Meta Description copied to clipboard!");
      } else {
        editor.chain().focus().insertContent(data.result).run();
        toast.success("Text generated.");
      }
    } catch (err: any) {
      toast.dismiss(loader);
      toast.error(err.message || "AI failed to connect.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/30 opacity-50 hover:opacity-100 transition-opacity duration-300">
      {/* AI Assistant */}
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <div className="h-7 px-2 gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#8b5cf6] hover:text-[#7c3aed] hover:bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 bg-[#8b5cf6]/5 mr-1 rounded-md flex items-center justify-center cursor-pointer transition-colors">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Assist
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 p-2 rounded-2xl shadow-xl shadow-black/10 border-border">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Gemini Composer</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs font-bold gap-2 cursor-pointer py-2 focus:bg-primary/10 focus:text-primary rounded-xl" onClick={() => handleAIAction('improve')}>
              <RefreshCw className="w-3.5 h-3.5" /> Improve paragraph
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs font-bold gap-2 cursor-pointer py-2 focus:bg-primary/10 focus:text-primary rounded-xl" onClick={() => handleAIAction('seo')}>
              <Search className="w-3.5 h-3.5" /> Generate SEO
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs font-bold gap-2 cursor-pointer py-2 focus:bg-primary/10 focus:text-primary rounded-xl" onClick={() => handleAIAction('continue')}>
              <ListPlus className="w-3.5 h-3.5" /> Continue writing
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs font-bold gap-2 cursor-pointer py-2 focus:bg-primary/10 focus:text-primary rounded-xl" onClick={() => handleAIAction('engaging')}>
              <Sparkles className="w-3.5 h-3.5" /> Make more engaging
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Undo / Redo */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
        <Undo className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
        <Redo className="w-3.5 h-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Text Formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold">
        <Bold className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic">
        <Italic className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline">
        <UnderlineIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Strikethrough">
        <Strikethrough className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive("highlight")} title="Highlight">
        <Highlighter className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} title="Inline Code">
        <Code className="w-3.5 h-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Headings */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="Heading 1">
        <Heading1 className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading 2">
        <Heading2 className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="Heading 3">
        <Heading3 className="w-3.5 h-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Lists */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List">
        <List className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Ordered List">
        <ListOrdered className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive("taskList")} title="Task List">
        <ListTodo className="w-3.5 h-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Block */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Quote">
        <Quote className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
        <Minus className="w-3.5 h-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} title="Align Left">
        <AlignLeft className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })} title="Align Center">
        <AlignCenter className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })} title="Align Right">
        <AlignRight className="w-3.5 h-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Insert */}
      <ToolbarButton onClick={addLink} isActive={editor.isActive("link")} title="Insert Link">
        <LinkIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Insert Image">
        <ImageIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title="Insert Table"
      >
        <TableIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
    </div>
  );
}

export function TiptapEditor({
  content,
  onUpdate,
  placeholder = "Start writing...",
  editable = true,
  autofocus = false,
  debounceMs = 800,
}: TiptapEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialContentRef = useRef(content);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full",
        },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: initialContentRef.current || "",
    editable,
    autofocus,
    onUpdate: ({ editor }) => {
      if (!onUpdate) return;
      // Debounce: clear previous timer and set a new one
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdate(editor.getJSON() as Record<string, unknown>);
      }, debounceMs);
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[300px]",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!editable || moved) return false;
        const file = event.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
          event.preventDefault();
          uploadAndInsertImage(file, view, event.clientX, event.clientY);
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (!editable) return false;
        const file = event.clipboardData?.files?.[0];
        if (file && file.type.startsWith('image/')) {
          event.preventDefault();
          uploadAndInsertImage(file, view);
          return true;
        }
        return false;
      }
    },
  });

  const uploadAndInsertImage = async (file: File, view: any, x?: number, y?: number) => {
    toast.message("Uploading image...");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop() || "png";
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("user-images")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("user-images")
        .getPublicUrl(filePath);

      if (x !== undefined && y !== undefined) {
        const coordinates = view.posAtCoords({ left: x, top: y });
        if (coordinates) {
          editor?.chain().focus().insertContentAt(coordinates.pos, { type: 'image', attrs: { src: urlData.publicUrl } }).run();
        } else {
          editor?.chain().focus().setImage({ src: urlData.publicUrl }).run();
        }
      } else {
        editor?.chain().focus().setImage({ src: urlData.publicUrl }).run();
      }
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
    }
  };

  if (!editor) {
    return (
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <div className="h-10 bg-muted/30 border-b border-border animate-pulse" />
        <div className="p-6 space-y-3">
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="tiptap-editor border border-border rounded-xl overflow-hidden bg-card">
      {editable && <Toolbar editor={editor} onImageUpload={(file) => uploadAndInsertImage(file, editor.view)} />}
      <EditorContent editor={editor} />
    </div>
  );
}
