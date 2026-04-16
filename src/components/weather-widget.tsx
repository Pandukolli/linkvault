"use client";

import { useEffect, useState } from "react";
import { CloudRain, Sun, Cloud, Wind } from "lucide-react";

export function WeatherWidget() {
  const [weather, setWeather] = useState<{ temp: number; desc: string; icon: any } | null>(null);

  useEffect(() => {
    // Simulated weather fetch for a soothing journal experience
    const conditions = [
      { temp: 24, desc: "Gentle Breeze", icon: Wind },
      { temp: 27, desc: "Light Rain", icon: CloudRain },
      { temp: 22, desc: "Partly Cloudy", icon: Cloud },
      { temp: 28, desc: "Sunny & Warm", icon: Sun },
    ];
    
    // Pick based on day of week to simulate a stable result for today
    const idx = new Date().getDay() % conditions.length;
    setWeather(conditions[idx]);
  }, []);

  if (!weather) return null;

  const Icon = weather.icon;

  return (
    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/50 px-3 py-1.5 rounded-xl border border-black/5 backdrop-blur-sm shadow-sm w-max">
      <Icon className="w-3.5 h-3.5 text-primary" />
      <span>{weather.temp}°C • {weather.desc}</span>
    </div>
  );
}
