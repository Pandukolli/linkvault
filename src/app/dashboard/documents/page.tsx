"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useDocuments } from "@/hooks/use-documents";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserDocument } from "@/lib/types";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  File,
  FileImage,
  FileSpreadsheet,
  FileCode,
  Clock,
} from "lucide-react";

function getFileIcon(type: string | null) {
  const baseClass = "w-6 h-6 transition-colors duration-500 group-hover:text-primary";
  switch (type) {
    case "pdf":
      return <FileText className={`${baseClass} text-red-500`} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return <FileImage className={`${baseClass} text-blue-500`} />;
    case "xls":
    case "xlsx":
    case "csv":
      return <FileSpreadsheet className={`${baseClass} text-emerald-500`} />;
    case "js":
    case "ts":
    case "html":
    case "css":
    case "json":
      return <FileCode className={`${baseClass} text-amber-500`} />;
    default:
      return <File className={`${baseClass} text-slate-400`} />;
  }
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { documents, isLoading, uploadDocument, downloadDocument, deleteDocument } =
    useDocuments();

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      await uploadDocument.mutateAsync(files[i]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tight uppercase flex items-center gap-5">
            <div className="w-12 h-12 rounded-[1.5rem] bg-primary/5 flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            Archives
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 opacity-40">
            {documents.length} verified documents in secure transmission vault
          </p>
        </div>
        <Button
          className="h-12 px-8 gap-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 uppercase tracking-tighter"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-5 h-5 stroke-[3]" />
          Synchronize Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.json,.html,.css,.js,.ts"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>

      {/* Documents List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-3xl bg-slate-50" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div
          className="text-center py-32 rounded-[3.5rem] bg-white border border-slate-100 shadow-2xl shadow-primary/5 cursor-pointer group transition-all duration-700 hover:border-primary/20"
          onClick={() => fileInputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="w-24 h-24 mx-auto bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100 shadow-inner group-hover:scale-110 transition-all duration-500">
            <Upload className="w-10 h-10 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-3xl font-black text-black mb-3 tracking-tighter uppercase">Vault is ready</h3>
          <p className="text-sm text-slate-400 font-bold max-w-sm mx-auto mb-10 uppercase tracking-[0.2em] leading-relaxed">
            Drag files into this transmission zone or click to initiate upload protocols.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.5 }}
              className="group bg-white border border-slate-100 rounded-[2.5rem] p-6 cursor-pointer flex items-center gap-6 shadow-2xl shadow-primary/[0.02] hover:shadow-primary/[0.08] hover:-translate-y-1 transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-[1.25rem] bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/5 transition-colors">
                {getFileIcon(doc.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-black text-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                  {doc.name}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-2 py-0.5 rounded">
                    {doc.type?.toUpperCase() || "DATA"}
                  </div>
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    {formatFileSize(doc.size ?? undefined)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all shadow-lg shadow-black/5"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadDocument(doc);
                  }}
                  title="Download Transmission"
                >
                  <Download className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-black/5"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Permanently erase archival transmission?")) {
                      deleteDocument.mutate(doc);
                    }
                  }}
                  title="Purge Document"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
