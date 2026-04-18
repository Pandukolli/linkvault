import { createClient } from "@/lib/supabase/server";
import { Film, Calendar, ArrowLeft, Globe, Camera } from "lucide-react";
import type { GalleryImage } from "@/lib/types";
import Link from "next/link";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // NOTE: For this to work for public (unauthenticated) visitors, run this SQL in Supabase:
  // CREATE POLICY "Public stories visible" ON user_images FOR SELECT USING (published_at IS NOT NULL);
  const { data: story, error } = await supabase
    .from("user_images")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !story) {
    return <StoryUnavailable reason="not-found" />;
  }

  if (!story.published_at) {
    return <StoryUnavailable reason="private" />;
  }

  const template = (story as GalleryImage).story_style || "cinematic";
  return <StoryView story={story as GalleryImage} template={template} />;
}

function StoryUnavailable({ reason }: { reason: "not-found" | "private" }) {
  return (
    <div className="min-h-screen bg-[#0A0B0F] flex items-center justify-center p-12 text-center">
      <div>
        <Film className="w-16 h-16 text-white/10 mx-auto mb-6" />
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4 text-white">
          Story Unavailable
        </h1>
        <p className="text-white/30 font-medium max-w-xs mx-auto text-sm leading-relaxed">
          {reason === "private"
            ? "This story is private. Only the author can see it."
            : "This story doesn't exist or the link is broken."}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Go Home
        </Link>
      </div>
    </div>
  );
}

function StoryView({ story, template }: { story: GalleryImage; template: string }) {
  const isCinematic   = template === "cinematic" || template === "documentary";
  const isPolaroid    = template === "polaroid";
  const isPoetic      = template === "poetic";
  const isTravel      = template === "travel";

  // Background colors by template
  const bg = isCinematic ? "#08090D" : isPolaroid ? "#FAF6F0" : isPoetic ? "#F5F3FF" : isTravel ? "#F0FDF4" : "#08090D";
  const textPrimary   = isCinematic ? "#FFFFFF" : "#0F172A";
  const textSecondary = isCinematic ? "rgba(255,255,255,0.5)" : "#6B7280";

  const publishedDate = new Date(story.published_at!).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: bg }}>

      {/* Ambient effects */}
      {isCinematic && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
          {/* Film grain */}
          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "128px 128px" }} />
        </div>
      )}

      {isPoetic && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-40"
          style={{ background: "radial-gradient(ellipse 80% 80% at 20% 20%, #EDE9FE 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, #FCE7F3 0%, transparent 60%)" }}
        />
      )}

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50"
        style={{ background: isCinematic ? "linear-gradient(90deg, #F97316 0%, #7C3AED 100%)" : "#2563EB", width: "100%" }}
      />

      {/* Nav bar */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5 max-w-6xl mx-auto">
        <Link href="/"
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
          style={{ color: textSecondary }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          VaultOS
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: textSecondary }}>
          <Globe className="w-3 h-3" />
          Public Story
        </div>
      </nav>

      {/* ─── CINEMATIC / DOCUMENTARY ─── */}
      {isCinematic && (
        <main className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
          <div className="relative w-full mb-14 overflow-hidden rounded-lg shadow-2xl" style={{ aspectRatio: "16/9" }}>
            <img src={story.url} alt={story.title || "Story"} className="w-full h-full object-cover brightness-75" />
            {/* Letterbox bars */}
            <div className="absolute top-0 inset-x-0 h-[9%] bg-black" />
            <div className="absolute bottom-0 inset-x-0 h-[9%] bg-black" />
            {/* Light leak */}
            <div className="absolute top-0 left-0 w-40 h-40 pointer-events-none opacity-15"
              style={{ background: "radial-gradient(circle, #FDE68A 0%, transparent 70%)" }} />
            {/* Title overlay */}
            <div className="absolute bottom-[10%] left-8 right-8">
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight mb-3"
                style={{ textShadow: "0 4px 40px rgba(0,0,0,0.9)" }}>
                {story.title || "Untitled Story"}
              </h1>
              <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                <Calendar className="w-3.5 h-3.5" />
                <span>{publishedDate}</span>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="w-10 h-0.5 bg-[#F97316] mb-10" />
            <p className="text-white/65 font-serif text-xl leading-[2] tracking-wide whitespace-pre-wrap"
              style={{ fontFamily: "Merriweather, Georgia, serif" }}>
              {story.story || "A photograph captured in time, waiting for its story to be told."}
            </p>
            {story.caption && (
              <p className="text-white/30 text-sm italic font-serif mt-8">{story.caption}</p>
            )}
          </div>
        </main>
      )}

      {/* ─── POLAROID ─── */}
      {isPolaroid && (
        <main className="relative z-10 max-w-4xl mx-auto px-6 pb-32 min-h-[80vh] flex flex-col md:flex-row gap-16 md:gap-20 items-center pt-6">
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white p-4 pb-16 max-w-sm w-full relative shadow-2xl"
              style={{ transform: "rotate(-2deg)", boxShadow: "0 25px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)" }}>
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img src={story.url} alt="" className="w-full h-full object-cover brightness-95 contrast-105" />
              </div>
              {story.caption && (
                <p className="absolute bottom-5 left-0 right-0 text-center text-sm font-bold text-[#4B3F2F] px-4 font-mono tracking-tighter truncate">
                  {story.caption}
                </p>
              )}
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <p className="text-[#C2895A] text-xs font-black uppercase tracking-[0.3em] mb-5">
              {new Date(story.created_at).getFullYear()} · Polaroid Series
            </p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#1C1404] mb-5 leading-tight"
              style={{ fontFamily: "Merriweather, serif" }}>
              {story.title || "Untitled Tale"}
            </h1>
            <div className="w-10 h-1 bg-[#C2895A] mb-8" />
            <p className="text-lg text-[#5C4A32] leading-[1.9] italic whitespace-pre-wrap"
              style={{ fontFamily: "Merriweather, Georgia, serif" }}>
              {story.story || "A photograph captured in time."}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#C2895A] mt-10">{publishedDate}</p>
          </div>
        </main>
      )}

      {/* ─── POETIC ─── */}
      {isPoetic && (
        <main className="relative z-10 max-w-3xl mx-auto px-6 pb-32 text-center pt-6">
          <div className="w-56 h-56 md:w-72 md:h-72 mx-auto rounded-full overflow-hidden shadow-2xl shadow-purple-200 border-8 border-white mb-10">
            <img src={story.url} alt="" className="w-full h-full object-cover saturate-50 brightness-110 contrast-90" />
          </div>
          <p className="text-[#A78BFA] text-xs font-black uppercase tracking-[0.4em] mb-6">a visual poem</p>
          <h1 className="text-4xl md:text-6xl font-black text-[#2D1B69] tracking-tight leading-tight mb-8"
            style={{ fontFamily: "Merriweather, serif" }}>
            {story.title || "Untitled"}
          </h1>
          <p className="max-w-lg mx-auto text-lg text-[#6D5E8C] leading-[2.2] italic whitespace-pre-wrap"
            style={{ fontFamily: "Merriweather, serif" }}>
            {story.story || "Words to follow."}
          </p>
          <p className="text-[10px] text-[#C4B5FD] font-bold uppercase tracking-widest mt-12">{publishedDate}</p>
        </main>
      )}

      {/* ─── TRAVEL JOURNAL ─── */}
      {isTravel && (
        <main className="relative z-10 max-w-5xl mx-auto px-6 pb-32 pt-6">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            <div className="space-y-5">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-green-900/10">
                <img src={story.url} alt="" className="w-full h-full object-cover" />
              </div>
              {story.caption && (
                <div className="bg-white border border-[#D1FAE5] rounded-xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#059669] mb-1">Field Note</p>
                  <p className="text-sm font-medium text-[#1F2937]">{story.caption}</p>
                </div>
              )}
            </div>
            <div className="pt-2">
              <p className="text-[#059669] text-[10px] font-black uppercase tracking-[0.4em] mb-4">Travel Journal</p>
              <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-tight mb-5"
                style={{ fontFamily: "Merriweather, serif" }}>
                {story.title || "The Journey"}
              </h1>
              <div className="w-10 h-0.5 bg-[#059669] mb-8" />
              <p className="text-[#374151] leading-[1.9] text-lg whitespace-pre-wrap"
                style={{ fontFamily: "Merriweather, serif" }}>
                {story.story || "Every place has a story waiting to be told."}
              </p>
              <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest mt-10">{publishedDate}</p>
            </div>
          </div>
        </main>
      )}

      {/* Fallback for unknown templates — uses cinematic-style layout */}
      {!isCinematic && !isPolaroid && !isPoetic && !isTravel && (
        <main className="relative z-10 max-w-4xl mx-auto px-6 pb-32 pt-6">
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">
            <div className="flex-1">
              <img src={story.url} alt={story.title || "Story"} className="w-full rounded-2xl shadow-2xl" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-6" style={{ color: textSecondary }}>
                <Camera className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  {new Date(story.created_at).getFullYear()} Archive
                </span>
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-5 leading-tight" style={{ color: textPrimary }}>
                {story.title || "Untitled Story"}
              </h1>
              <p className="text-lg leading-[1.9] whitespace-pre-wrap" style={{ color: textSecondary, fontFamily: "Merriweather, serif" }}>
                {story.story || "A moment preserved in time."}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-10" style={{ color: textSecondary }}>
                {publishedDate}
              </p>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t py-8 text-center"
        style={{ borderColor: isCinematic ? "rgba(255,255,255,0.05)" : "#E5E7EB" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: isCinematic ? "rgba(255,255,255,0.2)" : "#9CA3AF" }}>
          Crafted with VaultOS · Visual Archive
        </p>
      </footer>
    </div>
  );
}
