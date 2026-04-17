"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useResumes, type ResumeContent, type Resume } from "@/hooks/use-resumes";
import { ResumeEditor } from "@/components/resumes/ResumeEditor";
import { ResumePreview } from "@/components/resumes/ResumePreview";
import { LinkedInImport } from "@/components/resumes/LinkedInImport";
import { TemplateGallery } from "@/components/resumes/TemplateGallery";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, Layout, Sparkles, ChevronLeft, 
  Trash2, Clock, FileCode, ArrowRight, Sparkle, 
  Database, FileUp, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResumesPage() {
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [showLinkedInImport, setShowLinkedInImport] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  const { resumes, isLoading, createResume, updateResume, deleteResume, seedDemo } = useResumes();

  // AUTO-SEEDING DISABLED TO PREVENT DEMO CONFUSION
  // Users now start with a pristine, empty dashboard.

  const activeResume = resumes.find(r => r.id === selectedResumeId);

  const handleUpdate = useCallback((updates: Partial<Resume>) => {
    if (!selectedResumeId) return;
    updateResume.mutate({ id: selectedResumeId, ...updates });
  }, [selectedResumeId, updateResume]);

  const handleUpdateContent = useCallback((updates: Partial<ResumeContent>) => {
    if (!selectedResumeId || !activeResume) return;
    updateResume.mutate({ 
      id: selectedResumeId, 
      content: { ...activeResume.content, ...updates } 
    });
  }, [activeResume, selectedResumeId, updateResume]);

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);
  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const ratio = (e.clientX / window.innerWidth) * 100;
      if (ratio > 25 && ratio < 75) setSplitRatio(ratio);
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  if (activeResume) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col font-sans select-none overflow-hidden">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white shrink-0 z-30">
          <div className="flex items-center gap-6">
            <button onClick={() => setSelectedResumeId(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <input 
                value={activeResume.title}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                className="text-[12px] font-black uppercase tracking-widest text-[#111827] bg-transparent outline-none w-64 focus:text-blue-600 transition-colors"
                placeholder="Naming archive node..."
              />
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Protocol v{activeResume.version}.0 ARCHIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <Button variant="ghost" size="sm" className="h-9 px-5 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl" onClick={() => setShowTemplateGallery(true)}>
               <Layout className="w-4 h-4 mr-2" /> Gallery
             </Button>
             <div className="w-px h-6 bg-slate-200 mx-2" />
             <button 
               className="p-2.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
               onClick={() => { if(confirm("Purge archival record?")) { deleteResume.mutate(activeResume.id); setSelectedResumeId(null); } }}
             >
               <Trash2 className="w-4.5 h-4.5" />
             </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <div style={{ width: `${splitRatio}%` }} className="h-full overflow-hidden flex flex-col bg-[#1A1C23] shrink-0 border-r border-slate-200">
            <ResumeEditor resume={activeResume} onUpdate={handleUpdate} onUpdateContent={handleUpdateContent} />
          </div>

          <div onMouseDown={startResizing} className={cn("w-1.5 hover:w-2 transition-all bg-slate-100 hover:bg-[#2563EB] cursor-col-resize z-40 absolute h-full top-0", isResizing && "bg-[#2563EB]")} style={{ left: `${splitRatio}%` }} />

          <main className="flex-1 bg-[#F8FAFC] overflow-y-auto no-scrollbar py-16 px-12 flex flex-col items-center">
             <div className="w-full max-w-[850px] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.1)] rounded-[0.25rem] overflow-hidden border border-slate-200 bg-white">
                <ResumePreview resume={activeResume} />
             </div>
          </main>
        </div>

        <AnimatePresence>
          {showLinkedInImport && (
            <LinkedInImport onImport={handleUpdateContent} onClose={() => setShowLinkedInImport(false)} />
          )}
          {showTemplateGallery && (
            <TemplateGallery currentTemplate={activeResume.template_name} onSelect={(id) => { handleUpdate({ template_name: id }); setShowTemplateGallery(false); }} onClose={() => setShowTemplateGallery(false)} />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto min-h-screen p-8 md:p-20 bg-[#FBFBFE]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
        <div className="space-y-4">
           <div className="flex items-center gap-3 px-4 py-1.5 bg-blue-500/5 border border-blue-500/10 rounded-full w-fit">
              <Sparkle className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Archival Protocol v4.0</span>
           </div>
          <h1 className="text-8xl font-black text-[#111827] tracking-tighter uppercase leading-[0.9] font-space">
            Record<br/>Vault
          </h1>
        </div>
        <Button
          className="h-16 px-12 gap-4 bg-[#111827] text-white hover:bg-[#2563EB] rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1 active:scale-95 border-none"
          onClick={() => createResume.mutate({ title: "New Record" }, { onSuccess: (data) => setSelectedResumeId(data.id) })}
        >
          <Plus className="w-5 h-5" />
          Establish Archive
        </Button>
      </div>

      {resumes.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 bg-white border border-dashed border-slate-200 rounded-[3rem] text-center px-10">
           <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-10">
              <FileCode className="w-10 h-10 text-slate-300" />
           </div>
           <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter font-space mb-4">Zero Knowledge found</h2>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-md mx-auto mb-12">No resume archives detected. Start fresh or architect from an existing PDF.</p>
           
           <div className="flex flex-col md:flex-row gap-6">
              <Button 
                onClick={() => createResume.mutate({ title: "New Record" }, { onSuccess: (data) => setSelectedResumeId(data.id) })}
                className="h-16 px-10 bg-white border-2 border-slate-950 text-slate-950 hover:bg-slate-950 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
              >
                <Plus className="w-4 h-4 mr-3" /> Start Clean Record
              </Button>
              <Button 
                variant="outline"
                className="h-16 px-10 border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-500 hover:text-blue-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                onClick={() => seedDemo.mutate()}
              >
                <Database className="w-4 h-4 mr-3" /> Load Prototype Demo
              </Button>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[200px] rounded-[1.5rem] bg-white border border-slate-100 shadow-sm" />
            ))
          ) : (
            resumes.map((resume) => (
              <motion.div
                key={resume.id}
                whileHover={{ y: -4, scale: 1.01 }}
                className="group relative h-[210px] bg-white border border-slate-200 rounded-[1.5rem] p-6 cursor-pointer transition-all hover:border-blue-500 hover:shadow-[0_30px_60px_-15px_rgba(37,99,235,0.12)] flex flex-col overflow-hidden"
                onClick={() => setSelectedResumeId(resume.id)}
              >
                {/* Architectural Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.03] rounded-bl-[4rem] group-hover:bg-blue-500/[0.06] transition-colors" />
  
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/10 group-hover:bg-[#2563EB] transition-colors">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <span className="text-[7px] font-black text-blue-600/60 uppercase tracking-[0.25em] border border-blue-500/10 px-2 py-1 rounded-full">
                      Archived: {resume.template_name}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-black text-[#111827] uppercase tracking-tighter leading-none group-hover:text-[#2563EB] line-clamp-2 mb-1 pr-4 font-space transition-colors">
                    {resume.title}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Version {resume.version}.0 Node</p>
   
                  <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-5">
                     <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.1em]">
                        <Clock className="w-3 h-3" />
                        {new Date(resume.updated_at).toLocaleDateString()}
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Record Open</span>
                        <div className="w-7 h-7 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                           <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
