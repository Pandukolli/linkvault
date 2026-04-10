"use client";

import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/user-menu";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/use-profile";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { profile } = useProfile();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/dashboard/links?q=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  // Formatting date
  const now = new Date();
  const dateString = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);

  const hours = now.getHours();
  const greeting = hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : "Good evening";
  const firstName = profile?.full_name?.split(" ")[0] || "operator";

  return (
    <header className="h-20 border-b-[1.5px] border-elegant bg-card flex items-center justify-between px-6 md:px-8 sticky top-0 z-40 transition-colors">
      {/* Left: Mobile menu + Greeting Container */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden w-10 h-10 rounded-xl hover:bg-slate-100 text-black"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="hidden sm:flex flex-col">
          <h1 className="text-xl font-black tracking-tight text-black flex items-center gap-1.5 uppercase">
            {greeting}, <span className="text-primary">{firstName}</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
            {dateString}
          </p>
        </div>
      </div>

      {/* Right: Search + User */}
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative hidden md:flex w-64 lg:w-96 transition-all focus-within:w-[450px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={t("Search everything...", "Search everything...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 w-full bg-slate-50 border-transparent focus:border-primary focus:bg-white rounded-xl text-sm font-bold text-black transition-all"
          />
        </form>

        <div className="w-px h-6 bg-slate-100 mx-1 hidden md:block" />

        <UserMenu />
      </div>
    </header>
  );
}
