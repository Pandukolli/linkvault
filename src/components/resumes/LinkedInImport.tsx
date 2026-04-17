"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  X, LinkedIn, Sparkles, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface LinkedInImportProps {
  onImport: (data: any) => void;
  onClose: () => void;
}

export function LinkedInImport({ onImport, onClose }: LinkedInImportProps) {
  const [text, setText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleParse = async () => {
    if (!text.trim()) {
      toast.error("Paste your profile text to begin");
      return;
    }

    setIsParsing(true);
    try {
      const response = await fetch("/api/ai/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "parse_linkedin", text }),
      });

      const data = await response.json();
      if (data.result) {
        setParsedData(data.result);
        toast.success("Intelligence successfully mapped your profile");
      } else {
        toast.error("AI failed to extract structured logic");
      }
    } catch (error) {
      toast.error("Logic failure during parsing");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-[#111827]">LinkedIn Intelligent Import</h2>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">AI-Powered Entity Mapping</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {!parsedData ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Raw Profile Data</label>
                <Textarea 
                  placeholder="Paste your LinkedIn About, Experience, or full profile text here..."
                  className="min-h-[200px] text-xs font-medium p-6 bg-slate-50/50 border-slate-200 focus:border-[#2563EB] transition-all resize-none"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-[#2563EB]/80 leading-relaxed uppercase tracking-wider">
                  Our AI will architect your resume based on the patterns found in this text. For optimal results, include Experience, Education, and Skills.
                </p>
              </div>

              <Button 
                disabled={isParsing} 
                onClick={handleParse} 
                className="w-full h-14 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Initializing Intelligence...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3" />
                    Begin Semantic Mapping
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-center gap-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-700">Mapping Validated</h3>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Found {parsedData.experience?.length || 0} Experience Nodes • {parsedData.skills?.[0]?.items?.length || 0} Capability Tags</p>
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-4 border border-slate-100 rounded-xl p-4 bg-slate-50/30">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Identification</span>
                  <p className="text-sm font-black text-[#111827]">{parsedData.personalInfo?.fullName}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase">{parsedData.personalInfo?.professionalTitle}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Experience Highlights</span>
                  {parsedData.experience?.slice(0, 2).map((exp: any, i: number) => (
                    <p key={i} className="text-[11px] font-bold text-[#475569]">· {exp.role} at {exp.company}</p>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-14 font-black uppercase tracking-widest rounded-xl" onClick={() => setParsedData(null)}>Reset</Button>
                <Button className="flex-1 h-14 bg-[#2563EB] text-white font-black uppercase tracking-widest rounded-xl shadow-lg" onClick={() => onImport(parsedData)}>Apply To Resume</Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
