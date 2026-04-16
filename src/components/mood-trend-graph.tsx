"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

type MoodData = { date: string; score: number };

const MOOD_SCORES: Record<string, number> = {
  "awful": 1,
  "sad": 2,
  "neutral": 3,
  "good": 4,
  "happy": 5,
};

export function MoodTrendGraph({ notes }: { notes: any[] }) {
  const data = useMemo(() => {
    const raw: MoodData[] = [];
    const past30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split("T")[0];
    });

    const moodMap = new Map<string, number>();
    notes.forEach(note => {
      const date = note.created_at.split("T")[0];
      const mood = note.content?._mood;
      if (mood && MOOD_SCORES[mood]) {
        moodMap.set(date, MOOD_SCORES[mood]);
      }
    });

    past30.forEach(date => {
      raw.push({
        date: new Date(date).getDate().toString(),
        score: moodMap.get(date) || 3, // Default to neutral if no entry
      });
    });

    return raw;
  }, [notes]);

  return (
    <div className="w-full h-24 mt-4 opacity-50 hover:opacity-100 transition-opacity">
      <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Mood Trend (30 Days)</div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <Tooltip 
            contentStyle={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', fontSize: '12px' }}
            formatter={(val: any) => [val === 5 ? 'Happy' : val === 4 ? 'Good' : val === 3 ? 'Neutral' : val === 2 ? 'Sad' : 'Awful', "Mood"]}
          />
          <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
