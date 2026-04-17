import React from "react";
import { type ResumeContent } from "@/hooks/use-resumes";

interface TemplateProps {
  data: ResumeContent;
  accentColor: string;
}

/* ─────────── 1. HARVARD TRADITIONAL (SERIAL 1) ─────────── */
const AtsPack1: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="bg-white min-h-[1056px] p-[2.5rem] text-black font-serif flex flex-col items-center">
      <h1 className="text-[20pt] font-black uppercase mb-1 tracking-tight">{data.personalInfo.fullName}</h1>
      <div className="flex gap-2 text-[9pt] font-medium mb-6 text-slate-800">
        <span>{data.personalInfo.location}</span> | <span>{data.personalInfo.phone}</span> | <span>{data.personalInfo.email}</span>
      </div>
      
      <div className="w-full space-y-8">
        <section>
          <div className="w-full border-b border-black mb-1">
             <h2 className="text-[10pt] font-black uppercase pb-0.5">Professional Experience</h2>
          </div>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4 mt-2">
              <div className="flex justify-between font-bold text-[10pt]">
                <span>{exp.company}</span>
                <span>{exp.period}</span>
              </div>
              <div className="flex justify-between italic text-[9.5pt] mb-1">
                <span>{exp.role}</span>
                <span>{exp.location}</span>
              </div>
              <p className="text-[9.5pt] leading-[1.3] text-justify whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </section>

        <section>
          <div className="w-full border-b border-black mb-2">
            <h2 className="text-[10pt] font-black uppercase pb-0.5">Education</h2>
          </div>
          {data.education.map((edu, i) => (
            <div key={i} className="flex justify-between text-[10.5pt] mb-2 pt-1 font-bold">
               <div>{edu.institution} — <span className="italic font-normal">{edu.degree}</span></div>
               <span>{edu.period}</span>
            </div>
          ))}
        </section>

        <section>
          <div className="w-full border-b border-black mb-2">
            <h2 className="text-[10pt] font-black uppercase pb-0.5">Skills & Expertise</h2>
          </div>
          <div className="space-y-1.5 pt-1">
            {data.skills.map((s, i) => (
               <div key={i} className="text-[9.5pt]">
                  <span className="font-bold underline">{s.category}:</span> {s.items.join(", ")}
               </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

/* ─────────── 2. MODERN ASYMMETRIC (SERIAL 2) ─────────── */
const AtsPack2: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="bg-white min-h-[1056px] p-[2.5rem] text-black font-serif">
      <div className="text-right mb-12 border-b-2 border-black pb-6">
        <h1 className="text-[26pt] font-black uppercase tracking-tighter leading-none">{data.personalInfo.fullName}</h1>
        <div className="text-[10pt] font-bold text-slate-500 mt-3 space-x-3 uppercase tracking-widest italic">
           <span>{data.personalInfo.email}</span> • <span>{data.personalInfo.phone}</span> • <span>{data.personalInfo.location}</span>
        </div>
      </div>

      <div className="space-y-10">
        <section>
          <div className="w-full border-b border-black mb-4">
            <h2 className="text-[11pt] font-black uppercase pb-1">Professional Trajectory</h2>
          </div>
          <div className="space-y-8 pt-2">
            {data.experience.map((exp, i) => (
              <div key={i} className="flex gap-10">
                <div className="w-28 shrink-0 text-[10pt] font-bold text-slate-400 border-r border-slate-100 pr-4">{exp.period}</div>
                <div className="flex-1">
                  <h4 className="text-[12pt] font-black">{exp.company}</h4>
                  <p className="text-[10pt] italic font-bold text-slate-600 mb-3">{exp.role} / {exp.location}</p>
                  <p className="text-[10.5pt] text-slate-700 leading-relaxed text-justify">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

/* ─────────── 3. FINANCE ELITE (SERIAL 3) ─────────── */
const AtsPack3: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="bg-white min-h-[1056px] p-[3rem] text-[#0f172a] font-serif border-[1px] border-slate-100">
      <div className="flex flex-col items-center mb-10 border-b-4 border-slate-900 pb-8">
        <h1 className="text-[20pt] font-black uppercase tracking-widest">{data.personalInfo.fullName}</h1>
        <div className="flex gap-4 text-[10pt] font-bold text-slate-600 mt-2">
           <span>{data.personalInfo.phone}</span> | <span>{data.personalInfo.email}</span> | <span>{data.personalInfo.location}</span>
        </div>
      </div>

      <div className="space-y-8">
         <section>
            <div className="w-full border-b border-black mb-4">
               <h2 className="text-[11pt] font-black uppercase pb-1">Experience Cluster</h2>
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-6 mb-8 last:mb-0">
                 <div className="flex justify-between font-bold text-[11pt] mb-1">
                    <span>{exp.company}</span>
                    <span className="font-normal italic">{exp.period}</span>
                 </div>
                 <p className="text-[10pt] font-bold text-slate-600 mb-2 italic underline">{exp.role}</p>
                 <p className="text-[10pt] text-justify leading-[1.4]">{exp.description}</p>
              </div>
            ))}
         </section>
      </div>
    </div>
  );
};

/* ─────────── 4. TECHNICAL BLOCK (SERIAL 4) ─────────── */
const AtsPack4: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="bg-white min-h-[1056px] p-[2.5rem] text-[#1e1e1e] font-serif">
      <div className="grid grid-cols-2 gap-12 mb-14 border-b-[3px] border-black pb-8">
        <h1 className="text-[32pt] font-black uppercase tracking-tighter leading-none">{data.personalInfo.fullName}</h1>
        <div className="flex flex-col justify-end items-end gap-1 text-[10pt] font-bold italic">
           <p className="underline">{data.personalInfo.email}</p>
           <p>{data.personalInfo.phone}</p>
           <p className="text-slate-500 font-normal not-italic">{data.personalInfo.location}</p>
        </div>
      </div>

      <div className="space-y-12">
         <section>
            <div className="w-full border-b border-black mb-6">
               <h3 className="text-[12pt] font-black uppercase pb-1">Core Credentials</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-6 pt-2">
               {data.skills.map((s, i) => (
                 <div key={i}>
                    <p className="text-[9.5pt] font-black text-slate-400 uppercase mb-1">{s.category}</p>
                    <p className="text-[10.5pt] font-bold border-l-4 border-slate-900 pl-6">{s.items.join(", ")}</p>
                 </div>
               ))}
            </div>
         </section>

         <section>
            <div className="w-full border-b border-black mb-8">
               <h3 className="text-[12pt] font-black uppercase pb-1">Career Highlights</h3>
            </div>
            <div className="space-y-10">
               {data.experience.map((exp, i) => (
                 <div key={i}>
                    <div className="flex justify-between items-baseline mb-2">
                       <h4 className="text-[14pt] font-black tracking-tight">{exp.company}</h4>
                       <span className="text-[10.5pt] font-bold italic text-slate-400">{exp.period}</span>
                    </div>
                    <p className="text-[10.5pt] font-bold text-slate-500 mb-3">{exp.role} — {exp.location}</p>
                    <p className="text-[10.5pt] leading-relaxed text-justify text-slate-800">{exp.description}</p>
                 </div>
               ))}
            </div>
         </section>
      </div>
    </div>
  );
};

/* ─────────── 5. LEADERSHIP VERTICAL (SERIAL 5) ─────────── */
const AtsPack5: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="bg-white min-h-[1056px] p-[3rem] text-black font-serif">
       <div className="flex flex-col items-center mb-14">
          <h1 className="text-[28pt] font-black uppercase mb-3 tracking-tighter">{data.personalInfo.fullName}</h1>
          <div className="w-full h-[5px] bg-black my-5" />
          <div className="flex gap-10 text-[10.5pt] font-bold uppercase tracking-[0.3em] text-slate-500 italic">
             <span>{data.personalInfo.location}</span>
             <span>{data.personalInfo.email}</span>
             <span>{data.personalInfo.phone}</span>
          </div>
       </div>

       <div className="space-y-12">
          <section>
             <div className="w-full border-b-2 border-black mb-6">
                <h2 className="text-[12pt] font-black uppercase pb-1.5">Summary of Capability</h2>
             </div>
             <p className="text-[10.5pt] italic font-medium leading-[1.6] text-center px-16 text-slate-700 whitespace-pre-line">{data.summary}</p>
          </section>

          <section>
             <div className="w-full border-b-2 border-black mb-8">
                <h2 className="text-[12pt] font-black uppercase pb-1.5">Experience Archive</h2>
             </div>
             {data.experience.map((exp, i) => (
               <div key={i} className="mb-10 last:mb-0">
                  <div className="flex justify-between items-baseline font-black text-[12pt] border-b border-slate-100 pb-2 mb-3">
                     <span>{exp.company}</span>
                     <span className="font-normal italic text-slate-400">{exp.period}</span>
                  </div>
                  <p className="text-[10.5pt] font-bold text-slate-500 mb-4 ml-6">{exp.role} / {exp.location}</p>
                  <p className="text-[10.5pt] leading-[1.4] text-justify px-6 text-slate-800">{exp.description}</p>
               </div>
             ))}
          </section>
       </div>
    </div>
  );
};

export const TemplateRegistry: Record<string, React.FC<TemplateProps>> = {
  harvard: AtsPack1,
  modern: AtsPack2,
  finance: AtsPack3,
  technical: AtsPack4,
  leadership: AtsPack5,
  executive: AtsPack5,
  minimal: AtsPack3,
  academic: AtsPack1,
};
