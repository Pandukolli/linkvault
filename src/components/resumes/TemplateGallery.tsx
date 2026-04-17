"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, FileText, Layout, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
}

const ATS_PACK_TEMPLATES: Template[] = [
  { id: "harvard", name: "Traditional Harvard", category: "ATS PACK 1", description: "Standard conservative corporate layout. High parsing fidelity." },
  { id: "modern", name: "Modern Asymmetrical", category: "ATS PACK 2", description: "Creative headers and crisp sans-serif typography for tech/marketing." },
  { id: "finance", name: "Finance Compact", category: "ATS PACK 3", description: "Ultra-high density serif design for wall street & investment banking." },
  { id: "technical", name: "Technical Block", category: "ATS PACK 4", description: "Engineered with block dividers for clear technical skills hierarchy." },
  { id: "leadership", name: "Executive Leadership", category: "ATS PACK 5", description: "Right-aligned elite design for C-suite and senior academic roles." },
];

interface TemplateGalleryProps {
  currentTemplate: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function TemplateGallery({ currentTemplate, onSelect, onClose }: TemplateGalleryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[60px]"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 40 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 40 }}
        className="relative bg-white/5 w-full max-w-[1400px] h-full max-h-[860px] rounded-[3.5rem] border border-white/20 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col glass-container"
      >
        {/* Header */}
        <div className="p-12 border-b border-white/10 flex items-center justify-between px-20">
           <div className="flex items-center gap-8">
              <div className="w-16 h-16 rounded-[1.5rem] bg-[#2563EB] shadow-2xl shadow-blue-500/30 flex items-center justify-center">
                 <Layout className="w-8 h-8 text-white" />
              </div>
              <div>
                 <h2 className="text-4xl font-black uppercase tracking-tighter text-white font-space leading-none mb-2">ATS Pack Architect</h2>
                 <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">5 Elite Protocols Discovered</p>
              </div>
           </div>
           <button onClick={onClose} className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all border border-white/10">
              <X className="w-6 h-6" />
           </button>
        </div>

        {/* Grid of Direct Previews */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-20">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-10">
              {ATS_PACK_TEMPLATES.map((tmpl) => (
                <motion.div
                  key={tmpl.id}
                  whileHover={{ y: -12, scale: 1.02 }}
                  onMouseEnter={() => setHoveredId(tmpl.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onSelect(tmpl.id)}
                  className={cn(
                    "relative aspect-[3/4.2] cursor-pointer rounded-[2.5rem] p-3 transition-all duration-500 overflow-hidden",
                    "border-2",
                    currentTemplate === tmpl.id 
                      ? "border-blue-500 bg-blue-500/10 shadow-[0_40px_80px_-20px_rgba(37,99,235,0.4)]" 
                      : "border-white/5 bg-white/[0.04] hover:bg-white/10 hover:border-white/20"
                  )}
                >
                   {/* Realistic Document Preview Render */}
                   <div className="h-full w-full bg-white rounded-[2rem] shadow-inner p-10 flex flex-col relative overflow-hidden">
                       <div className="h-4 w-1/2 bg-slate-900/10 rounded mb-2" />
                       <div className="h-2 w-full bg-slate-900/5 rounded mb-1" />
                       <div className="h-2 w-full bg-slate-900/5 rounded mb-6" />
                       
                       <div className="space-y-3">
                          <div className="h-3 w-1/3 bg-slate-900/10 rounded" />
                          <div className="h-2 w-full bg-slate-900/5 rounded" />
                          <div className="h-2 w-full bg-slate-900/5 rounded" />
                       </div>

                       <div className="mt-8 space-y-3">
                          <div className="h-3 w-1/4 bg-slate-900/10 rounded" />
                          <div className="h-2 w-full bg-slate-900/5 rounded" />
                       </div>

                       {/* Style-Specific Divider Overlay */}
                       <div className={cn(
                         "absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent p-10 flex flex-col justify-end transition-opacity duration-300",
                         hoveredId === tmpl.id || currentTemplate === tmpl.id ? "opacity-100" : "opacity-0"
                       )}>
                          <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg uppercase tracking-widest border border-blue-500/20 w-fit mb-4">{tmpl.category}</span>
                          <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">{tmpl.name}</h4>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed line-clamp-2">{tmpl.description}</p>
                       </div>
                       
                       {currentTemplate === tmpl.id && (
                         <div className="absolute top-8 right-8 w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-2xl animate-in zoom-in-50">
                            <Check className="w-6 h-6 text-white" />
                         </div>
                       )}
                   </div>
                </motion.div>
              ))}
           </div>
        </div>

        {/* Footer */}
        <div className="p-12 border-t border-white/10 bg-white/[0.02] flex items-center justify-between px-20">
           <div className="flex items-center gap-6">
              <Sparkles className="w-8 h-8 text-blue-400" />
              <div className="flex flex-col">
                 <span className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-1">Architecture Sync Active</span>
                 <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Protocol Version 5.4.1 (Stable)</span>
              </div>
           </div>
           <Button onClick={onClose} className="h-16 px-20 bg-white text-[#111827] hover:bg-blue-500 hover:text-white font-black uppercase tracking-[0.2em] rounded-2zl shadow-2xl transition-all active:scale-95 border-none">Execute Selection</Button>
        </div>
      </motion.div>

      <style jsx>{`
        .glass-container {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(60px);
          -webkit-backdrop-filter: blur(60px);
        }
      `}</style>
    </div>
  );
}
