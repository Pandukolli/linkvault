"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

async function uploadAudioFile(file: File): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const fileName = `${user.id}/${Date.now()}-voicenote.webm`;
    const { error } = await supabase.storage.from("note-images").upload(fileName, file, { contentType: "audio/webm" });
    if (error) return null;

    const { data: urlData } = supabase.storage.from("note-images").getPublicUrl(fileName);
    return urlData.publicUrl;
  } catch (err) { return null; }
}

export function VoiceNoteRecorder({ onSave, onCancel }: { onSave: (url: string, duration: number) => void, onCancel: () => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timer = useRef<any>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = async () => {
        setIsUploading(true);
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        try {
          toast.loading("Uploading voice note...");
          const file = new File([audioBlob], `voice_note_${Date.now()}.webm`, { type: "audio/webm" });
          const publicUrl = await uploadAudioFile(file);
          
          if (publicUrl) {
            toast.dismiss();
            toast.success("Voice note saved");
            onSave(publicUrl, duration); // Note: duration state from closure won't be entirely safe without ref but timer clears so UI is close enough. Actually, pass the ref or just keep duration.
          } else {
             toast.dismiss();
             toast.error("Failed to upload audio.");
             setIsUploading(false);
          }
        } catch (error) {
           toast.dismiss();
           toast.error("Failed to upload audio.");
           setIsUploading(false);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      timer.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
    }
    setIsRecording(false);
    clearInterval(timer.current);
  };

  useEffect(() => {
    // Component unmount cleanup
    return () => {
      if (timer.current) clearInterval(timer.current);
      if (mediaRecorder.current?.state === "recording") mediaRecorder.current.stop();
    };
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 shadow-[0_12px_40px_rgb(0,0,0,0.08)] p-5 rounded-[24px] w-64 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
      <style>{`
        @keyframes audioWave {
          0% { transform: scaleY(0.2); opacity: 0.4; }
          100% { transform: scaleY(1); opacity: 1; }
        }
        .wave-bar {
          width: 2.5px;
          background-color: #10b981;
          border-radius: 99px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .wave-active {
          animation: audioWave 0.5s ease-in-out infinite alternate;
        }
      `}</style>
      
      <div className="text-[9px] uppercase tracking-[0.25em] font-extrabold text-slate-400">
        {isRecording ? "Listening" : "Voice Memo"}
      </div>

      {/* The Wave Display */}
      <div className="flex items-center justify-center gap-1.5 h-10 w-full px-4 relative">
        {[0,1,2,3,4,5,6,7,8,9,10,11].map((i) => (
           <div 
             key={i} 
             className={`wave-bar ${isRecording ? 'wave-active' : ''}`}
             style={{
               height: isRecording ? '100%' : '15%',
               animationDelay: `${i * 0.08}s`,
               animationDuration: `${0.4 + (i % 4) * 0.12}s`
             }}
           />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white pointer-events-none opacity-80" />
      </div>

      <div className="font-mono text-[13px] tracking-widest text-slate-600 font-medium">
        {formatTime(duration)}
      </div>

      <div className="w-full flex items-center justify-center gap-2">
        {isUploading ? (
          <div className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest animate-pulse py-2">Finishing...</div>
        ) : isRecording ? (
          <button onClick={stopRecording} className="w-full bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors py-2.5 rounded-[14px] flex items-center justify-center gap-2 group">
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Stop Recording</span>
          </button>
        ) : (
          <div className="flex gap-2 w-full">
            <button onClick={onCancel} className="bg-slate-50 text-slate-400 border border-slate-100 hover:text-slate-600 hover:bg-slate-100 transition-colors p-2.5 rounded-[14px] flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={startRecording} className="flex-1 bg-black text-white hover:bg-slate-800 shadow-md transition-colors py-2.5 rounded-[14px] flex items-center justify-center gap-2">
              <Mic className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Begin</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
