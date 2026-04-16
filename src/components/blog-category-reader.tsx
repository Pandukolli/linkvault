"use client";

import { TiptapEditor } from "@/components/tiptap-editor";
import { Clock, Calendar, BookOpen, Code2, Layers, Feather, Star, Mail, BookMarked } from "lucide-react";

interface BlogReaderProps {
  title: string;
  content: any;
  meta: any;
  publishedAt: string;
  updatedAt: string;
}

/* ─── Helper ─── */
function AuthorRow({ meta, publishedAt, updatedAt }: { meta: any; publishedAt: string; updatedAt: string }) {
  return (
    <div className="flex items-center gap-3">
      {meta.authorAvatar ? (
        <img src={meta.authorAvatar} className="w-10 h-10 rounded-full object-cover border-2 border-white/10 flex-shrink-0" alt={meta.authorName} />
      ) : (
        <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
      )}
      <div>
        <div className="text-xs font-black uppercase tracking-widest">{meta.authorName || "Author"}</div>
        <div className="text-[10px] font-bold text-inherit opacity-50 uppercase tracking-widest">
          {new Date(publishedAt || updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {meta.readingTime || "3"} min read
        </div>
      </div>
    </div>
  );
}

/* ─── PERSONAL ESSAY ─── */
function EssayReader({ title, content, meta, publishedAt, updatedAt }: BlogReaderProps) {
  return (
    <div className="min-h-screen bg-[#fefdf8]">
      <div className="max-w-2xl mx-auto px-6 pt-16 pb-32">
        {/* Category pill */}
        <div className="flex items-center gap-2 mb-10">
          <Feather className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-600">Personal Essay</span>
          {meta.tags?.slice(0, 2).map((t: string) => (
            <span key={t} className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[9px] font-bold border border-amber-100">#{t}</span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-black text-stone-900 tracking-tight leading-[1.05] mb-10"
          style={{ fontFamily: "'Georgia', serif" }}>
          {title}
        </h1>

        {/* Author */}
        <div className="flex items-center justify-between border-y border-stone-200 py-5 mb-12 text-stone-600">
          <AuthorRow meta={meta} publishedAt={publishedAt} updatedAt={updatedAt} />
        </div>

        {/* Cover */}
        {meta.coverImage && (
          <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-xl shadow-stone-200">
            <img src={meta.coverImage} className="w-full h-full object-cover" alt="Cover" />
          </div>
        )}

        {/* Excerpt pull quote */}
        {meta.excerpt && (
          <blockquote className="my-10 pl-6 border-l-4 border-amber-300 italic text-xl text-stone-500 font-medium leading-relaxed"
            style={{ fontFamily: "'Georgia', serif" }}>
            {meta.excerpt}
          </blockquote>
        )}

        {/* Content — warm serif prose */}
        <div className="prose prose-lg prose-stone max-w-none
          prose-headings:font-black prose-headings:tracking-tight prose-headings:text-stone-900
          prose-p:leading-[1.9] prose-p:text-stone-700 prose-p:font-medium
          prose-p:first-of-type:first-letter:text-7xl prose-p:first-of-type:first-letter:font-black
          prose-p:first-of-type:first-letter:float-left prose-p:first-of-type:first-letter:mr-3
          prose-p:first-of-type:first-letter:leading-none prose-p:first-of-type:first-letter:text-amber-600
          prose-blockquote:border-amber-300 prose-blockquote:not-italic
          prose-a:text-amber-600"
          style={{ fontFamily: "'Georgia', serif" }}>
          <TiptapEditor content={content} editable={false} />
        </div>

        {/* Author bio */}
        {meta.authorBio && (
          <div className="mt-20 p-8 rounded-3xl bg-amber-50 border border-amber-100 flex gap-6 items-start">
            {meta.authorAvatar && <img src={meta.authorAvatar} className="w-16 h-16 rounded-full object-cover flex-shrink-0" alt="" />}
            <div>
              <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">About the Author</div>
              <h3 className="text-lg font-black text-stone-900 mb-2">{meta.authorName}</h3>
              <p className="text-sm text-stone-500 leading-relaxed italic">{meta.authorBio}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── TECHNICAL DEEP DIVE ─── */
function TechnicalReader({ title, content, meta, publishedAt, updatedAt }: BlogReaderProps) {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      {/* Tech banner */}
      <div className="border-b border-[#30363d] bg-[#161b22]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4 text-[10px] font-mono font-bold text-[#8b949e] uppercase tracking-widest">
          <Code2 className="w-4 h-4 text-[#58a6ff]" />
          <span className="text-[#58a6ff]">docs</span>
          <span>/</span>
          <span>{meta.category || "Technical Deep Dive"}</span>
          {meta.series && <><span>/</span><span className="text-[#58a6ff]">{meta.series}</span></>}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-12 pb-32 flex gap-10">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {meta.tags?.map((t: string) => (
              <span key={t} className="px-3 py-1 bg-[#58a6ff]/10 text-[#58a6ff] rounded-full text-[9px] font-mono font-bold border border-[#58a6ff]/20">
                #{t}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6 font-mono">
            {title}
          </h1>

          {/* Meta row */}
          <div className="flex items-center gap-6 border-y border-[#30363d] py-4 mb-10 text-[10px] font-mono font-bold text-[#8b949e] uppercase">
            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(publishedAt || updatedAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {meta.readingTime || "5"} min read</span>
            {meta.authorName && <span className="flex items-center gap-1.5">by {meta.authorName}</span>}
          </div>

          {/* Cover */}
          {meta.coverImage && (
            <div className="w-full aspect-video rounded-xl overflow-hidden mb-10 border border-[#30363d]">
              <img src={meta.coverImage} className="w-full h-full object-cover" alt="" />
            </div>
          )}

          {/* Content — dark tech prose */}
          <div className="prose prose-invert max-w-none
            prose-headings:font-black prose-headings:text-white prose-headings:border-b prose-headings:border-[#30363d] prose-headings:pb-2
            prose-code:bg-[#161b22] prose-code:border prose-code:border-[#30363d] prose-code:text-[#58a6ff] prose-code:rounded
            prose-pre:bg-[#161b22] prose-pre:border prose-pre:border-[#30363d]
            prose-a:text-[#58a6ff] prose-p:text-[#c9d1d9] prose-p:leading-relaxed
            prose-blockquote:border-[#58a6ff] prose-blockquote:text-[#8b949e]">
            <TiptapEditor content={content} editable={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TUTORIAL / HOW-TO ─── */
function TutorialReader({ title, content, meta, publishedAt, updatedAt }: BlogReaderProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Tutorial header band */}
      <div className="bg-gradient-to-r from-[#06B6D4] to-[#0891b2] text-white">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 mb-4 text-white/70 text-[10px] font-black uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5" /> Tutorial / How-to
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">{title}</h1>
          <div className="flex items-center flex-wrap gap-4 text-sm font-bold text-white/80">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {meta.readingTime || "5"} min</span>
            {meta.authorName && <span>by {meta.authorName}</span>}
            {meta.tags?.slice(0, 3).map((t: string) => (
              <span key={t} className="px-3 py-1 bg-white/20 rounded-full text-xs font-black">#{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 pb-32">
        {/* What you'll learn card */}
        {meta.excerpt && (
          <div className="p-6 rounded-2xl bg-[#f0fdff] border border-[#06B6D4]/20 mb-10">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4] mb-2">Overview</div>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">{meta.excerpt}</p>
          </div>
        )}

        {/* Cover */}
        {meta.coverImage && (
          <div className="w-full aspect-video rounded-2xl overflow-hidden mb-10 shadow-lg">
            <img src={meta.coverImage} className="w-full h-full object-cover" alt="" />
          </div>
        )}

        {/* Content — tutorial prose with numbered headings via CSS */}
        <style>{`
          .tutorial-prose h2 { counter-increment: step; }
          .tutorial-prose h2::before {
            content: "Step " counter(step) ": ";
            color: #06B6D4;
            font-size: 0.7rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            display: block;
            margin-bottom: 0.25rem;
          }
          .tutorial-prose { counter-reset: step; }
          .tutorial-prose h2 { 
            background: #f0fdff; 
            border-left: 4px solid #06B6D4;
            padding: 0.75rem 1rem;
            border-radius: 0 0.75rem 0.75rem 0;
            margin-top: 2.5rem;
          }
          .tutorial-prose blockquote {
            background: #fefce8;
            border-left: 4px solid #fbbf24;
            border-radius: 0 0.75rem 0.75rem 0;
          }
          .tutorial-prose code { background: #f1f5f9; color: #06B6D4; }
        `}</style>
        <div className="tutorial-prose prose prose-lg prose-slate max-w-none
          prose-headings:font-black prose-p:leading-relaxed prose-p:font-medium
          prose-a:text-[#06B6D4] prose-blockquote:not-italic">
          <TiptapEditor content={content} editable={false} />
        </div>
      </div>
    </div>
  );
}

/* ─── STORY / NARRATIVE ─── */
function StoryReader({ title, content, meta, publishedAt, updatedAt }: BlogReaderProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e3d8]">
      {/* Atmospheric cover */}
      {meta.coverImage ? (
        <div className="relative h-[60vh] overflow-hidden">
          <img src={meta.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a]" />
          <div className="absolute bottom-0 left-0 right-0 max-w-2xl mx-auto px-6 pb-16">
            <h1 className="text-5xl md:text-7xl font-black leading-none text-white"
              style={{ fontFamily: "'Georgia', serif" }}>{title}</h1>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-6 pt-24">
          <h1 className="text-6xl font-black text-white leading-none mb-8"
            style={{ fontFamily: "'Georgia', serif" }}>{title}</h1>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 pb-32">
        {/* Meta */}
        <div className="flex items-center gap-4 py-8 border-b border-[#2a2a2a] mb-12">
          {meta.authorAvatar && <img src={meta.authorAvatar} className="w-10 h-10 rounded-full object-cover" alt="" />}
          <div>
            <div className="text-sm font-bold text-[#e8e3d8]">{meta.authorName || "Author"}</div>
            <div className="text-[10px] text-[#5a5a5a] font-bold uppercase tracking-widest">
              {new Date(publishedAt || updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-wider">
            <BookMarked className="w-3.5 h-3.5" /> {meta.readingTime || "8"} min
          </div>
        </div>

        {/* Excerpt as epigraph */}
        {meta.excerpt && (
          <p className="text-2xl text-[#8b8077] leading-relaxed mb-14 italic text-center px-8"
            style={{ fontFamily: "'Georgia', serif" }}>
            "{meta.excerpt}"
          </p>
        )}

        {/* Content */}
        <div className="prose max-w-none text-[#c8c0b0]"
          style={{ fontFamily: "'Georgia', serif" }}>
          <style>{`
            .story-prose p { line-height: 2; font-size: 1.15rem; margin-bottom: 1.75rem; }
            .story-prose h2 { color: #e8e3d8; font-family: 'Georgia', serif; font-style: italic; 
              border: none; border-top: 1px solid #2a2a2a; padding-top: 2rem; margin-top: 3rem; }
            .story-prose h3 { color: #8b8077; font-style: italic; text-transform: none; letter-spacing: 0; }
          `}</style>
          <div className="story-prose prose prose-invert max-w-none prose-p:leading-[2] prose-headings:italic">
            <TiptapEditor content={content} editable={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── REVIEW ─── */
function ReviewReader({ title, content, meta, publishedAt, updatedAt }: BlogReaderProps) {
  const rating = meta.reviewRating || 4;
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-32">
        <div className="flex items-center gap-2 mb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Review
        </div>

        <div className="flex gap-10 items-start">
          <div className="flex-1">
            {meta.coverImage && (
              <div className="w-full aspect-video rounded-2xl overflow-hidden mb-10 shadow-xl">
                <img src={meta.coverImage} className="w-full h-full object-cover" alt="" />
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-tight mb-6">{title}</h1>
            <AuthorRow meta={meta} publishedAt={publishedAt} updatedAt={updatedAt} />

            <div className="mt-10 prose prose-lg prose-slate max-w-none
              prose-headings:font-black prose-headings:text-black
              prose-p:leading-relaxed prose-p:font-medium prose-p:text-slate-700
              prose-a:text-amber-500 prose-blockquote:border-amber-300">
              <TiptapEditor content={content} editable={false} />
            </div>
          </div>

          {/* Verdict Card */}
          <div className="hidden lg:block w-72 flex-shrink-0 sticky top-24">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Verdict</div>
              <div className="text-5xl font-black text-black mb-1">{rating}<span className="text-2xl text-slate-300">/5</span></div>
              <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                ))}
              </div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {meta.tags?.map((t: string) => (
                  <span key={t} className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-bold">#{t}</span>
                ))}
              </div>
              {meta.authorName && (
                <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] font-bold text-slate-400">
                  Reviewed by {meta.authorName}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── NEWSLETTER ─── */
function NewsletterReader({ title, content, meta, publishedAt, updatedAt }: BlogReaderProps) {
  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <div className="max-w-[640px] mx-auto px-6 pt-12 pb-32">
        {/* Email header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-0">
          <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
            <Mail className="w-5 h-5 text-white" />
            <div>
              <div className="text-white font-black text-sm">{meta.series || "vaultOS Newsletter"}</div>
              <div className="text-slate-400 text-[10px] font-bold">
                {new Date(publishedAt || updatedAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>

          <div className="px-8 py-10">
            {meta.tags?.length > 0 && (
              <div className="flex gap-2 mb-6">
                {meta.tags.slice(0, 3).map((t: string) => (
                  <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold">#{t}</span>
                ))}
              </div>
            )}
            <h1 className="text-3xl font-black text-slate-900 leading-tight mb-6">{title}</h1>
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-8 text-sm text-slate-500 font-medium">
              {meta.authorAvatar && <img src={meta.authorAvatar} className="w-8 h-8 rounded-full object-cover" alt="" />}
              <span>By <b className="text-slate-700">{meta.authorName || "Author"}</b></span>
              <span>· {meta.readingTime || "3"} min read</span>
            </div>

            <div className="prose prose-slate max-w-none
              prose-headings:font-black prose-headings:text-slate-900
              prose-p:leading-relaxed prose-p:text-slate-600 prose-p:font-medium
              prose-hr:border-slate-200 prose-a:text-blue-600
              prose-blockquote:bg-slate-50 prose-blockquote:border-blue-500 prose-blockquote:rounded-r-xl prose-blockquote:py-2 prose-blockquote:not-italic">
              <TiptapEditor content={content} editable={false} />
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">vaultOS Newsletter — All rights reserved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── JOURNAL ─── */
function JournalReader({ title, content, meta, publishedAt, updatedAt }: BlogReaderProps) {
  const date = new Date(publishedAt || updatedAt);
  return (
    <div className="min-h-screen bg-[#fefce8]">
      <div className="max-w-2xl mx-auto px-6 pt-16 pb-32">
        {/* Date display */}
        <div className="text-center mb-12">
          <div className="text-6xl font-black text-amber-200">{date.getDate()}</div>
          <div className="text-xs font-black uppercase tracking-[0.4em] text-amber-500">
            {date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>
        </div>

        <div className="h-px bg-amber-200 my-8" />

        {/* Title */}
        <h1 className="text-4xl font-black text-amber-900 leading-tight mb-8 text-center"
          style={{ fontFamily: "'Georgia', serif" }}>
          {title}
        </h1>

        {meta.excerpt && (
          <p className="text-center text-lg text-amber-700 italic mb-10 leading-relaxed"
            style={{ fontFamily: "'Georgia', serif" }}>
            {meta.excerpt}
          </p>
        )}

        {meta.coverImage && (
          <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden mb-12 shadow-lg shadow-amber-100">
            <img src={meta.coverImage} className="w-full h-full object-cover" alt="" />
          </div>
        )}

        {/* Tags */}
        {meta.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {meta.tags.map((t: string) => (
              <span key={t} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] font-bold border border-amber-200">#{t}</span>
            ))}
          </div>
        )}

        {/* Content */}
        <style>{`
          .journal-prose p { line-height: 2; color: #78350f; font-size: 1.1rem; }
          .journal-prose h2, .journal-prose h3 { color: #92400e; font-family: 'Georgia', serif; }
        `}</style>
        <div className="journal-prose prose max-w-none prose-p:leading-[2] text-amber-900"
          style={{ fontFamily: "'Georgia', serif" }}>
          <TiptapEditor content={content} editable={false} />
        </div>

        {meta.authorName && (
          <div className="mt-16 text-right italic text-amber-600 font-medium"
            style={{ fontFamily: "'Georgia', serif" }}>
            — {meta.authorName}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── DEFAULT ─── */
function DefaultReader({ title, content, meta, publishedAt, updatedAt }: BlogReaderProps) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-32">
        {meta.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {meta.tags.map((t: string) => t && (
              <span key={t} className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">{t}</span>
            ))}
          </div>
        )}
        <h1 className="text-5xl md:text-6xl font-black text-black tracking-tighter leading-[0.95] mb-8 uppercase">{title}</h1>
        <div className="flex items-center justify-between border-y border-slate-200 py-5 mb-14">
          <AuthorRow meta={meta} publishedAt={publishedAt} updatedAt={updatedAt} />
          <div className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {meta.readingTime || "3"} min read
          </div>
        </div>
        {meta.coverImage && (
          <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden mb-14 shadow-xl">
            <img src={meta.coverImage} className="w-full h-full object-cover" alt="Cover" />
          </div>
        )}
        <div className="prose prose-lg prose-slate max-w-none
          prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
          prose-p:font-medium prose-p:leading-relaxed prose-a:text-[#06B6D4]
          prose-img:rounded-3xl prose-img:shadow-xl">
          <TiptapEditor content={content} editable={false} />
        </div>
      </div>
    </div>
  );
}

/* ─── EXPORTED COMPONENT ─── */
export function BlogCategoryReader({ title, content, meta, publishedAt, updatedAt }: BlogReaderProps) {
  const category = meta?.category || "";

  if (category === "Personal Essay") {
    return <EssayReader title={title} content={content} meta={meta} publishedAt={publishedAt} updatedAt={updatedAt} />;
  }
  if (category === "Technical Deep Dive") {
    return <TechnicalReader title={title} content={content} meta={meta} publishedAt={publishedAt} updatedAt={updatedAt} />;
  }
  if (category === "Tutorial / How-to") {
    return <TutorialReader title={title} content={content} meta={meta} publishedAt={publishedAt} updatedAt={updatedAt} />;
  }
  if (category === "Story / Narrative") {
    return <StoryReader title={title} content={content} meta={meta} publishedAt={publishedAt} updatedAt={updatedAt} />;
  }
  if (category === "Review") {
    return <ReviewReader title={title} content={content} meta={meta} publishedAt={publishedAt} updatedAt={updatedAt} />;
  }
  if (category === "Newsletter") {
    return <NewsletterReader title={title} content={content} meta={meta} publishedAt={publishedAt} updatedAt={updatedAt} />;
  }
  if (category === "Journal") {
    return <JournalReader title={title} content={content} meta={meta} publishedAt={publishedAt} updatedAt={updatedAt} />;
  }

  return <DefaultReader title={title} content={content} meta={meta} publishedAt={publishedAt} updatedAt={updatedAt} />;
}
