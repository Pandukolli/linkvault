"use client";

import React, { useState, useEffect, useRef } from "react";
import { type Resume, type ResumeContent, DEFAULT_RESUME_CONTENT } from "@/hooks/use-resumes";
import { 
  Code2, Loader2, FileUp, ShieldCheck, 
  Copy, Check, FileText
} from "lucide-react";
import { scanATS } from "@/lib/resumes/ATSScanner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EditorProps {
  resume: Resume;
  onUpdateContent: (updates: Partial<ResumeContent>) => void;
  onUpdate?: (updates: Partial<Resume>) => void;
}

/**
 * PURE OVERLEAF-STYLE MANUAL ARCHITECT
 * [DE-INTEGRATED]: AI protocols permanently removed.
 */
export function ResumeEditor({ resume, onUpdateContent }: EditorProps) {
  const [sourceText, setSourceText] = useState(JSON.stringify(resume.content, null, 2));
  const [isSaving, setIsSaving] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const ats = scanATS(resume.content);

  useEffect(() => {
    setSourceText(JSON.stringify(resume.content, null, 2));
  }, [resume.id, resume.content ?? "{}"]);

  const handleSourceChange = (val: string) => {
    setSourceText(val);
    try {
      const parsed = JSON.parse(val);
      setIsValid(true);
      
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsSaving(true);
      
      timerRef.current = setTimeout(() => {
        onUpdateContent(parsed);
        setIsSaving(false);
      }, 1000);
    } catch (e) {
      setIsValid(false);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!(window as any).pdfjsLib) {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          await new Promise((res) => {
            script.onload = res;
            document.head.appendChild(script);
          });
        }

        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => (item as any).str);
          text += strings.join(" ") + "\n";
        }
        resolve(text);
      } catch (err) {
        reject(err);
      }
    });
  };

  /**
   * PURE LOCAL EXTRACTION (ZERO-AI)
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    const loadingToast = toast.loading("Extracting original record locally...");

    try {
      const extractedText = await extractTextFromPDF(file);
      
      if (!extractedText.trim()) {
        throw new Error("EMPTY_SOURCE: Document contains no indexable text.");
      }

      // NO AI INVOLVED: Just dump the raw content into the summary for manual organization.
      const rawData: ResumeContent = {
        ...DEFAULT_RESUME_CONTENT,
        summary: extractedText
      };

      handleSourceChange(JSON.stringify(rawData, null, 2));
      toast.success("Identity Buffered: Original PDF text loaded for manual architecting.", { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message || "Archive Extraction Failed.", { id: loadingToast });
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sourceText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success("Identity Buffer Copied.");
  };

  const lines = sourceText.split("\n");

  return (
    <div className="flex flex-col h-full bg-[#1A1C23] text-slate-300 font-mono overflow-hidden">
      <div className="h-16 border-b border-[#2D303E]/50 bg-[#1A1C23] flex items-center justify-between px-8 shrink-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-10">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-[0.4em] flex items-center gap-3">
                <Code2 className="w-4 h-4" /> Source Architect
             </span>
             <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mt-1">PROTOCOL: MANUAL_JSON_V1</span>
          </div>
          
          <div className="flex border-l border-[#2D303E] pl-10 gap-8 h-10 items-center">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1.5 font-space">ATS ANALYSIS</span>
                <span className={cn("text-[11px] font-black tracking-tighter", ats.score > 80 ? "text-emerald-500" : "text-amber-500")}>
                  {ats.score}% FIDELITY RATING
                </span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            disabled={isExtracting}
            onClick={() => fileInputRef.current?.click()}
            className="h-10 px-8 bg-[#2563EB] text-white rounded-[0.75rem] flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-blue-600 shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
            Import RAW Text
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
          
          <button 
            onClick={copyToClipboard}
            className="h-10 w-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 rounded-[0.75rem] transition-all border border-[#2D303E]"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {!isValid && (
           <div className="absolute top-8 right-12 z-20 px-10 py-5 bg-red-500/90 backdrop-blur-xl text-white text-[11px] font-black uppercase tracking-widest rounded-3xl shadow-[0_40px_80px_-20px_rgba(239,68,68,0.5)] flex items-center gap-4 border border-red-400">
             <div className="w-3 h-3 bg-white rounded-full animate-ping" />
             Syntax Protocol Violation
           </div>
        )}

        <div className="w-16 bg-[#16181D] border-r border-[#2D303E]/50 flex flex-col items-end p-8 select-none text-[11px] text-slate-700 gap-0 leading-6 font-space font-bold border-dashed h-full">
          {lines.map((_, i) => (
            <div key={i} className="h-6 flex items-center">{i + 1}</div>
          ))}
        </div>
        
        <textarea
          value={sourceText}
          onChange={(e) => handleSourceChange(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-transparent p-8 text-[15px] leading-6 focus:outline-none resize-none no-scrollbar font-mono text-blue-400/90 selection:bg-[#2563EB]/20"
          placeholder="Manual architect initializing..."
        />
      </div>

      <div className="h-12 bg-[#16181D] border-t border-[#2D303E]/50 flex items-center justify-between px-8 shrink-0">
         <div className="flex items-center gap-10">
            {isSaving ? (
               <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-[0.3em] flex items-center gap-3">
                 <Loader2 className="w-3.5 h-3.5 animate-spin" /> Synchronizing Buffer...
               </span>
            ) : (
               <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.3em] flex items-center gap-3">
                 <ShieldCheck className="w-4 h-4" /> Manual Record Stable
               </span>
            )}
         </div>
         <div className="flex items-center gap-6 text-[9px] font-bold text-slate-600 uppercase tracking-widest pr-2 font-space">
            <span>Lines: {lines.length}</span>
            <span>Encoding: UTF-8</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
         </div>
      </div>
    </div>
  );
}
