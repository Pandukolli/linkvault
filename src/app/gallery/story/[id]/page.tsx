import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Film, Calendar, Camera } from "lucide-react";
import type { UserImage } from "@/lib/types";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Try to fetch the story. Warning: If no public RLS policy exists, this might return null for unauthenticated users
  // Ideal RLS Policy: CREATE POLICY "Public stories" ON user_images FOR SELECT USING (published_at IS NOT NULL);
  const { data: story, error } = await supabase
    .from("user_images")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !story || !story.published_at) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-12 text-center">
        <div>
          <Film className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-4 text-black">Story Unavailable</h1>
          <p className="text-slate-400 font-bold max-w-sm mx-auto uppercase tracking-widest text-sm text-balance">
            This narrative might be private, deleted, or you followed a broken link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfb] text-black relative overflow-hidden flex items-center justify-center py-24 selection:bg-slate-200">
      {/* Background Cinematic Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-[-5%] bg-gradient-to-br from-slate-100/50 to-white opacity-40 mix-blend-multiply" />
        <div className="film-grain" />
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 relative z-10 animate-fade-in-up flex flex-col md:flex-row gap-16 md:gap-24 items-center">
        {/* Photo Side */}
         <div className="flex-1 w-full polaroid-card shadow-2xl hover:scale-[1.01] transition-transform duration-700">
           <div className="aspect-[3/4] md:aspect-square bg-slate-100 overflow-hidden relative">
             <img src={story.url} alt={story.title || "Story"} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/5" />
           </div>
         </div>
         
         {/* Story Side */}
         <div className="flex-1 w-full max-w-lg bg-transparent">
            <div className="flex items-center gap-3 mb-10 text-slate-400">
              <Camera className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">{new Date(story.created_at).getFullYear()} Archive</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black font-serif uppercase tracking-tighter mb-8 leading-tight">
              {story.title || "Untitled Tale"}
            </h1>
            
            <div className="w-12 h-1 bg-black mb-10" />
            
            <div className="prose prose-slate prose-lg">
              <p className="font-serif text-lg leading-loose text-slate-600 drop-shadow-sm">
                {story.story || "A photograph captured in time, waiting for its story to be told."}
              </p>
            </div>
            
            <div className="mt-16 pt-8 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{new Date(story.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
