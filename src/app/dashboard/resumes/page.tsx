"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useResumes, type ResumeContent } from "@/hooks/use-resumes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Plus,
  ChevronLeft,
  Trash2,
  Download,
  GraduationCap,
  User,
  MapPin,
  Mail,
  Phone,
  Wrench,
  X,
  Clock,
} from "lucide-react";

export default function ResumesPage() {
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const { resumes, isLoading, createResume, updateResume, deleteResume, DEFAULT_RESUME } =
    useResumes();

  const activeResume = resumes.find((r) => r.id === selectedResume);
  const content: ResumeContent = (activeResume?.content as ResumeContent) || DEFAULT_RESUME;

  const updateContent = (updates: Partial<ResumeContent>) => {
    if (!selectedResume) return;
    updateResume.mutate({
      id: selectedResume,
      content: { ...content, ...updates },
    });
  };

  const handleExportPDF = async () => {
    if (!activeResume) return;

    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Name
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(content.name || "Your Name", margin, y);
    y += 10;

    // Contact
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const contactParts = [content.email, content.phone, content.location].filter(Boolean);
    doc.text(contactParts.join(" • "), margin, y);
    y += 12;

    // Line
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Summary
    if (content.summary) {
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("SUMMARY", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(content.summary, pageWidth - margin * 2);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 5 + 8;
    }

    // Experience
    if (content.experience?.length > 0 && content.experience[0].company) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("EXPERIENCE", margin, y);
      y += 7;

      for (const exp of content.experience) {
        if (!exp.company) continue;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(exp.role || "", margin, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(exp.period || "", pageWidth - margin - doc.getTextWidth(exp.period || ""), y);
        y += 5;
        doc.setTextColor(60);
        doc.text(exp.company, margin, y);
        y += 6;
        if (exp.description) {
          doc.setTextColor(0);
          const descLines = doc.splitTextToSize(exp.description, pageWidth - margin * 2);
          doc.text(descLines, margin, y);
          y += descLines.length * 5 + 4;
        }
        y += 3;
      }
      y += 5;
    }

    // Education
    if (content.education?.length > 0 && content.education[0].institution) {
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("EDUCATION", margin, y);
      y += 7;

      for (const edu of content.education) {
        if (!edu.institution) continue;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(edu.degree || "", margin, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(edu.period || "", pageWidth - margin - doc.getTextWidth(edu.period || ""), y);
        y += 5;
        doc.setTextColor(60);
        doc.text(edu.institution, margin, y);
        y += 8;
      }
      y += 5;
    }

    // Skills
    if (content.skills?.length > 0) {
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("SKILLS", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(content.skills.join(" • "), margin, y);
    }

    doc.save(`${activeResume.title || "resume"}.pdf`);
  };

  if (selectedResume && activeResume) {
    return (
      <div className="max-w-[1500px] mx-auto px-6 md:px-12 py-12 pb-24">
        <div className="flex flex-col md:flex-row md:items-center gap-8 mb-16 pb-10 border-b border-white/5">
          <Button
            variant="ghost"
            className="h-12 px-6 gap-3 rounded-2xl text-white/30 hover:text-white hover:bg-white/5 transition-all font-black uppercase text-[10px] tracking-widest self-start md:self-auto border border-white/5"
            onClick={() => setSelectedResume(null)}
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            Return to Career Hub
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <Button
              className="h-12 px-8 gap-3 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] transition-all shadow-2xl shadow-white/10 hover:-translate-y-1"
              onClick={handleExportPDF}
            >
              <Download className="w-4 h-4" />
              Manifest PDF
            </Button>
            <button
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white/10 hover:text-red-500 hover:bg-white/5 transition-all border border-white/5"
              onClick={() => {
                if (confirm("Permanently erase archival resume?")) {
                  deleteResume.mutate(activeResume.id);
                  setSelectedResume(null);
                }
              }}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resume Title */}
        <input
          type="text"
          value={activeResume.title || ""}
          onChange={(e) => updateResume.mutate({ id: activeResume.id, title: e.target.value })}
          className="w-full text-7xl font-black tracking-tighter bg-transparent border-none outline-none mb-16 placeholder:text-white/5 text-white uppercase drop-shadow-2xl"
          placeholder="Credential Nomenclature..."
        />

        <div className="space-y-12">
          {/* Personal Info */}
          <section className="bg-[#050505] rounded-[3rem] p-12 space-y-12 border border-white/5 shadow-2xl relative overflow-hidden group">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4 relative z-10" style={{ color: "#5E7BFF" }}>
              <User className="w-4 h-4" />
              Personal Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Full Designation</Label>
                <Input
                  placeholder="Official Name..."
                  value={content.name}
                  onChange={(e) => updateContent({ name: e.target.value })}
                  className="h-14 text-sm rounded-2xl border-white/5 bg-white/5 font-bold text-white focus:border-white/20 transition-all shadow-none"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Archive Email</Label>
                <Input
                  placeholder="Primary Communication..."
                  value={content.email}
                  onChange={(e) => updateContent({ email: e.target.value })}
                  className="h-14 text-sm rounded-2xl border-white/5 bg-white/5 font-bold text-white focus:border-white/20 transition-all shadow-none"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Contact Protocol</Label>
                <Input
                  placeholder="Phone Line..."
                  value={content.phone}
                  onChange={(e) => updateContent({ phone: e.target.value })}
                  className="h-14 text-sm rounded-2xl border-white/5 bg-white/5 font-bold text-white focus:border-white/20 transition-all shadow-none"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Geographic Location</Label>
                <Input
                  placeholder="Archive Node..."
                  value={content.location}
                  onChange={(e) => updateContent({ location: e.target.value })}
                  className="h-14 text-sm rounded-2xl border-white/5 bg-white/5 font-bold text-white focus:border-white/20 transition-all shadow-none"
                />
              </div>
            </div>
            <div className="space-y-3 relative z-10">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Mission briefing</Label>
              <textarea
                placeholder="Professional summary of your career trajectory..."
                value={content.summary}
                onChange={(e) => updateContent({ summary: e.target.value })}
                className="w-full min-h-[160px] text-sm bg-white/5 border border-white/5 rounded-[2.5rem] p-8 resize-none outline-none text-white focus:border-white/20 transition-all font-medium leading-relaxed shadow-none"
              />
            </div>
          </section>

          {/* Experience */}
          <section className="bg-[#050505] rounded-[3rem] p-12 space-y-12 border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4" style={{ color: "#5E7BFF" }}>
                <Briefcase className="w-4 h-4" />
                Professional History
              </h3>
              <button
                className="h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/10"
                onClick={() =>
                  updateContent({
                    experience: [
                      ...content.experience,
                      { company: "", role: "", period: "", description: "" },
                    ],
                  })
                }
              >
                <Plus className="w-4 h-4" />
                Add Record
              </button>
            </div>
            {content.experience.map((exp, i) => (
              <div key={i} className="relative p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6 group/item hover:border-primary/10 transition-all">
                <button
                  className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-300 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover/item:opacity-100 shadow-xl"
                  onClick={() =>
                    updateContent({
                      experience: content.experience.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Job Designation</Label>
                    <Input
                      placeholder="Role / Title..."
                      value={exp.role}
                      onChange={(e) => {
                        const updated = [...content.experience];
                        updated[i] = { ...exp, role: e.target.value };
                        updateContent({ experience: updated });
                      }}
                      className="h-12 text-xs rounded-xl border-white bg-white font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Organization</Label>
                    <Input
                      placeholder="Company..."
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...content.experience];
                        updated[i] = { ...exp, company: e.target.value };
                        updateContent({ experience: updated });
                      }}
                      className="h-12 text-xs rounded-xl border-white bg-white font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Temporal Duration</Label>
                  <Input
                    placeholder="Period (e.g., Jan 2022 - Present)"
                    value={exp.period}
                    onChange={(e) => {
                      const updated = [...content.experience];
                      updated[i] = { ...exp, period: e.target.value };
                      updateContent({ experience: updated });
                    }}
                    className="h-12 text-xs rounded-xl border-white bg-white font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Achievement log</Label>
                  <textarea
                    placeholder="Detailed record of contributions and strategic outcomes..."
                    value={exp.description}
                    onChange={(e) => {
                      const updated = [...content.experience];
                      updated[i] = { ...exp, description: e.target.value };
                      updateContent({ experience: updated });
                    }}
                    className="w-full min-h-[100px] text-sm bg-white border border-white rounded-2xl p-5 resize-none outline-none focus:border-primary/20 transition-all font-bold leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </section>

          {/* Academic */}
          <section className="bg-[#050505] rounded-[3rem] p-12 space-y-12 border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4" style={{ color: "#5E7BFF" }}>
                <GraduationCap className="w-4 h-4" />
                Academic Archives
              </h3>
              <button
                className="h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/10"
                onClick={() =>
                  updateContent({
                    education: [
                      ...content.education,
                      { institution: "", degree: "", period: "" },
                    ],
                  })
                }
              >
                <Plus className="w-4 h-4" />
                Add Credential
              </button>
            </div>
            {content.education.map((edu, i) => (
              <div key={i} className="relative p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6 group/item hover:border-primary/10 transition-all">
                <button
                  className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-300 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover/item:opacity-100 shadow-xl"
                  onClick={() =>
                    updateContent({
                      education: content.education.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Degree Title</Label>
                    <Input
                      placeholder="Qualification..."
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...content.education];
                        updated[i] = { ...edu, degree: e.target.value };
                        updateContent({ education: updated });
                      }}
                      className="h-12 text-xs rounded-xl border-white bg-white font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Archive Institution</Label>
                    <Input
                      placeholder="University / School..."
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...content.education];
                        updated[i] = { ...edu, institution: e.target.value };
                        updateContent({ education: updated });
                      }}
                      className="h-12 text-xs rounded-xl border-white bg-white font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Temporal Duration</Label>
                  <Input
                    placeholder="Period..."
                    value={edu.period}
                    onChange={(e) => {
                      const updated = [...content.education];
                      updated[i] = { ...edu, period: e.target.value };
                      updateContent({ education: updated });
                    }}
                    className="h-12 text-xs rounded-xl border-white bg-white font-bold"
                  />
                </div>
              </div>
            ))}
          </section>

          {/* Skills */}
          <section className="bg-[#050505] rounded-[3rem] p-12 space-y-12 border border-white/5 shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4" style={{ color: "#5E7BFF" }}>
              <Wrench className="w-4 h-4" />
              Core Proficiencies
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Skill Array</Label>
                <Input
                  placeholder="Type skill designations separated by commas (e.g., React, TypeScript, Node.js)"
                  value={content.skills?.join(", ") || ""}
                  onChange={(e) =>
                    updateContent({
                      skills: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="h-14 text-sm rounded-2xl border-slate-50 font-bold focus:border-primary/20 transition-all shadow-none bg-slate-50"
                />
              </div>
              {content.skills?.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {content.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-black px-4 py-2 rounded-xl bg-primary/5 text-primary uppercase tracking-widest border border-primary/10 shadow-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto px-6 md:px-12 py-12 pb-24 h-full relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
        <div className="space-y-4">
          <h1 className="text-7xl font-black text-white tracking-tighter uppercase">
            Credentials
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: "#5E7BFF" }}>
            Strategic professional archives and credential management
          </p>
        </div>
        <Button
          className="h-14 px-10 gap-3 bg-white text-black hover:bg-white/90 rounded-2xl font-black transition-all shadow-2xl shadow-white/10 hover:-translate-y-1 uppercase tracking-tighter"
          onClick={() =>
            createResume.mutate("Official Resume", {
              onSuccess: (data) => setSelectedResume(data.id),
            })
          }
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          Establish Record
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-[2.5rem] bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-40 rounded-[3.5rem] bg-[#050505] border border-white/5 shadow-2xl">
          <div className="w-24 h-24 mx-auto bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-10 border border-white/5 transition-all duration-700">
            <Briefcase className="w-10 h-10 text-white/10" />
          </div>
          <h3 className="text-4xl font-black text-white/50 mb-4 tracking-tighter uppercase">Archives empty</h3>
          <p className="text-[11px] text-white/10 font-black max-w-sm mx-auto mb-10 uppercase tracking-[0.3em] leading-relaxed">
            Initialize your first professional record to begin archival credential management.
          </p>
          <Button
            className="h-16 px-12 gap-4 bg-white text-black hover:bg-white/90 rounded-3xl font-black shadow-2xl shadow-white/10 transition-all hover:-translate-y-1 uppercase tracking-tighter"
            onClick={() => createResume.mutate("Official Resume")}
          >
            <Plus className="w-6 h-6 stroke-[3]" />
            Establish First Record
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resumes.map((resume) => {
            const resumeContent = resume.content as ResumeContent | null;
            return (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="group bg-[#050505] border border-white/5 rounded-[3rem] p-12 cursor-pointer transition-all duration-700 hover:border-white/10 relative overflow-hidden flex flex-col min-h-[400px]"
                onClick={() => setSelectedResume(resume.id)}
              >
                <div className="flex items-start justify-between mb-10">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase className="w-8 h-8 text-white/30" />
                  </div>
                  <span className="text-[10px] font-black text-white/20 bg-white/5 px-4 py-2 rounded-xl uppercase tracking-widest border border-white/5">
                    Archival v1
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 group-hover:text-white transition-colors">
                  {resume.title}
                </h3>
                <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-3 mb-10">
                  <Clock className="w-4 h-4" />
                  Modified {new Date(resume.updated_at).toLocaleDateString()}
                </div>
                {resumeContent?.name && (
                  <div className="mt-auto pt-8 border-t border-white/5 space-y-3">
                    <div className="text-[11px] font-black text-white uppercase tracking-widest truncate">{resumeContent.name}</div>
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] truncate">{resumeContent.email}</div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
