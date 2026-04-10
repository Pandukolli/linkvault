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
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-24">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12 pb-8 border-b border-slate-50">
          <Button
            variant="ghost"
            className="h-10 px-4 gap-2 rounded-xl text-slate-400 hover:text-black hover:bg-slate-50 transition-all font-black uppercase text-[10px] tracking-widest self-start md:self-auto"
            onClick={() => setSelectedResume(null)}
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
            Return to Career Hub
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Button
              className="h-10 px-6 gap-2 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
              onClick={handleExportPDF}
            >
              <Download className="w-3.5 h-3.5" />
              Manifest PDF
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-xl text-slate-300 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
              onClick={() => {
                if (confirm("Permanently erase archival resume?")) {
                  deleteResume.mutate(activeResume.id);
                  setSelectedResume(null);
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Resume Title */}
        <input
          type="text"
          value={activeResume.title || ""}
          onChange={(e) => updateResume.mutate({ id: activeResume.id, title: e.target.value })}
          className="w-full text-5xl font-black tracking-tight bg-transparent border-none outline-none mb-16 placeholder:text-slate-100 text-black uppercase"
          placeholder="Credential Nomenclature..."
        />

        <div className="space-y-12">
          {/* Personal Info */}
          <section className="bg-white rounded-[3rem] p-10 space-y-10 border border-slate-100 shadow-2xl shadow-primary/[0.02] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.03] blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 ml-1 relative z-10">
              <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              Personal Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Designation</Label>
                <Input
                  placeholder="Official Name..."
                  value={content.name}
                  onChange={(e) => updateContent({ name: e.target.value })}
                  className="h-14 text-sm rounded-2xl border-slate-50 font-bold focus:border-primary/20 transition-all shadow-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Archive Email</Label>
                <Input
                  placeholder="Primary Communication..."
                  value={content.email}
                  onChange={(e) => updateContent({ email: e.target.value })}
                  className="h-14 text-sm rounded-2xl border-slate-50 font-bold focus:border-primary/20 transition-all shadow-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Protocol</Label>
                <Input
                  placeholder="Phone Line..."
                  value={content.phone}
                  onChange={(e) => updateContent({ phone: e.target.value })}
                  className="h-14 text-sm rounded-2xl border-slate-50 font-bold focus:border-primary/20 transition-all shadow-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Geographic Location</Label>
                <Input
                  placeholder="Archive Node..."
                  value={content.location}
                  onChange={(e) => updateContent({ location: e.target.value })}
                  className="h-14 text-sm rounded-2xl border-slate-50 font-bold focus:border-primary/20 transition-all shadow-none"
                />
              </div>
            </div>
            <div className="space-y-2 relative z-10">
              <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Mission briefing</Label>
              <textarea
                placeholder="Professional summary of your career trajectory..."
                value={content.summary}
                onChange={(e) => updateContent({ summary: e.target.value })}
                className="w-full min-h-[140px] text-sm bg-white border border-slate-50 rounded-[2rem] p-6 resize-none outline-none focus:border-primary/20 transition-all font-bold leading-relaxed shadow-none"
              />
            </div>
          </section>

          {/* Experience */}
          <section className="bg-white rounded-[3rem] p-10 space-y-10 border border-slate-100 shadow-2xl shadow-primary/[0.02]">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 ml-1">
                <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                Professional History
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-4 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl text-primary hover:bg-primary/5 transition-all"
                onClick={() =>
                  updateContent({
                    experience: [
                      ...content.experience,
                      { company: "", role: "", period: "", description: "" },
                    ],
                  })
                }
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Add Record
              </Button>
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

          {/* Education */}
          <section className="bg-white rounded-[3rem] p-10 space-y-10 border border-slate-100 shadow-2xl shadow-primary/[0.02]">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 ml-1">
                <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-primary" />
                </div>
                Academic Archives
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-4 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl text-primary hover:bg-primary/5 transition-all"
                onClick={() =>
                  updateContent({
                    education: [
                      ...content.education,
                      { institution: "", degree: "", period: "" },
                    ],
                  })
                }
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Add Credential
              </Button>
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
          <section className="bg-white rounded-[3rem] p-10 space-y-10 border border-slate-100 shadow-2xl shadow-primary/[0.02]">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 ml-1">
              <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-primary" />
              </div>
              Core proficiencies
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
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tight uppercase flex items-center gap-5">
            <div className="w-12 h-12 rounded-[1.5rem] bg-primary/5 flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-primary" />
            </div>
            Credentials
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 opacity-40">
            Strategic professional archives and credential management
          </p>
        </div>
        <Button
          className="h-12 px-8 gap-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 uppercase tracking-tighter"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-[2.5rem] bg-slate-50" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-32 rounded-[3.5rem] bg-white border border-slate-100 shadow-2xl shadow-primary/5">
          <div className="w-24 h-24 mx-auto bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100 shadow-inner group transition-all duration-500 hover:scale-110">
            <Briefcase className="w-10 h-10 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-3xl font-black text-black mb-3 tracking-tighter uppercase">Archives empty</h3>
          <p className="text-sm text-slate-400 font-bold max-w-sm mx-auto mb-10 uppercase tracking-[0.2em] leading-relaxed">
            Initialize your first professional record to begin archival credential management.
          </p>
          <Button
            className="h-14 px-10 gap-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1 uppercase tracking-tighter"
            onClick={() => createResume.mutate("Official Resume")}
          >
            <Plus className="w-6 h-6 stroke-[3]" />
            Establish First Record
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => {
            const resumeContent = resume.content as ResumeContent | null;
            return (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="group bg-white border border-slate-100 rounded-[3rem] p-10 cursor-pointer shadow-2xl shadow-primary/[0.02] hover:shadow-primary/[0.08] transition-all duration-500 relative overflow-hidden"
                onClick={() => setSelectedResume(resume.id)}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/[0.02] blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-[10px] font-black text-slate-300 bg-slate-50 px-3 py-1.5 rounded-xl tabular-nums uppercase tracking-widest">
                    v1.0
                  </span>
                </div>
                <h3 className="text-xl font-black text-black uppercase tracking-tight mb-3 relative z-10 group-hover:text-primary transition-colors">
                  {resume.title}
                </h3>
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2 relative z-10 mb-6">
                  <Clock className="w-3.5 h-3.5" />
                  Archived {new Date(resume.updated_at).toLocaleDateString()}
                </div>
                {resumeContent?.name && (
                  <div className="pt-6 border-t border-slate-50 space-y-2 relative z-10">
                    <div className="text-[10px] font-black text-black uppercase tracking-widest truncate">{resumeContent.name}</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] truncate">{resumeContent.email}</div>
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
