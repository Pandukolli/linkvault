"use client";

import { useRef, useState } from "react";
import { type Resume } from "@/hooks/use-resumes";
import { useReactToPrint } from "react-to-print";
import { TemplateRegistry } from "./TemplateRegistry";
import { Button } from "@/components/ui/button";
import { Download, Monitor, Layout, Maximize2, Split } from "lucide-react";
import { motion } from "framer-motion";

interface PreviewProps {
  resume: Resume;
}

export function ResumePreview({ resume }: PreviewProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"resume" | "cover_letter">("resume");
  const [zoom, setZoom] = useState(1);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${resume.personalInfo?.fullName || "Resume"}_${resume.title}`,
  });

  const SelectedTemplate = TemplateRegistry[resume.template_name] || TemplateRegistry.modern;

  return (
    <div className="flex flex-col h-full bg-slate-100/50 overflow-hidden">
      {/* Preview Toolbar */}
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode("resume")}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${viewMode === "resume" ? "bg-white text-[#2563EB] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            Resume
          </button>
          <button 
            onClick={() => setViewMode("cover_letter")}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${viewMode === "cover_letter" ? "bg-white text-[#2563EB] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            Cover Letter
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-r pr-4 mr-2 border-slate-200">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 hover:bg-slate-50 text-slate-400">－</button>
            <span className="text-[10px] font-black text-slate-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1 hover:bg-slate-50 text-slate-400">＋</button>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="h-9 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] font-bold text-[10px] uppercase tracking-widest rounded-md shadow-lg shadow-blue-500/20"
            onClick={() => handlePrint()}
          >
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-12 flex justify-center bg-[#F1F5F9]">
        <div 
          className="origin-top transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <div 
            ref={componentRef} 
            className="w-[850px] shadow-2xl overflow-hidden print:shadow-none bg-white"
          >
            {viewMode === "resume" ? (
              <SelectedTemplate data={resume.content} accentColor={resume.template_color || "#2563EB"} />
            ) : (
              <CoverLetterPreview resume={resume} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CoverLetterPreview({ resume }: { resume: Resume }) {
  const { cover_letter, content } = resume;
  if (!cover_letter) return (
    <div className="p-20 text-center space-y-4">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
        <Monitor className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No Narrative Detected</p>
    </div>
  );

  return (
    <div className="p-20 text-[#1e293b] font-sans min-h-[1100px]">
      <div className="mb-20">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-[#111827] mb-1 font-space">{content.personalInfo.fullName}</h1>
        <p className="text-sm font-bold text-[#64748b] tracking-widest uppercase font-space">{content.personalInfo.professionalTitle}</p>
      </div>

      <div className="space-y-1 mb-12">
        <p className="text-xs font-bold text-[#94a3b8]">{cover_letter.date}</p>
        <p className="text-sm font-bold text-[#111827] mt-6">{cover_letter.recipientName}</p>
        <p className="text-xs font-bold text-[#64748b]">{cover_letter.recipientCompany}</p>
      </div>

      <div className="space-y-6">
        <p className="text-sm font-bold text-[#111827]">Dear {cover_letter.recipientName || "Hiring Manager"},</p>
        <div className="text-[13px] leading-relaxed text-[#475569] space-y-4 whitespace-pre-line">
          {cover_letter.content}
        </div>
      </div>

      <div className="mt-20">
        <p className="text-sm font-bold text-[#111827]">Sincerely,</p>
        <p className="text-xl font-black text-[#111827] mt-4 font-space">{content.personalInfo.fullName}</p>
      </div>
    </div>
  );
}
