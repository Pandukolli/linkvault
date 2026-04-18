"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function UserMenu() {
  const { t } = useTranslation();
  const router = useRouter();
  const supabase = createClient();
  const { profile } = useProfile();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(t("Failed to sign out", "Failed to sign out"));
    } else {
      toast.success(t("Signed out successfully", "Signed out successfully"));
      router.push("/login");
      router.refresh();
    }
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-2xl focus:outline-none transition-all duration-500">
          <Avatar className="h-10 w-10 border border-slate-100 cursor-pointer hover:border-primary/40 transition-all duration-500 rounded-xl">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} className="object-cover" />
            <AvatarFallback className="bg-slate-50 text-slate-400 text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-white border-elegant p-2 shadow-2xl mt-1">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-black text-black tracking-tight leading-none">{profile?.full_name || "User"}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                  {profile?.full_name ? t("Online", "Online") : t("Setting up...", "Setting up...")}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mx-2 mb-2 bg-slate-50" />
        <Link href="/dashboard/profile">
          <DropdownMenuItem className="cursor-pointer rounded-xl h-11 px-3 group transition-all duration-300 hover:bg-slate-50">
            <User className="w-4 h-4 mr-3 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="font-bold text-sm text-slate-600 group-hover:text-black tracking-tight">{t("My Profile", "My Profile")}</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/dashboard/settings">
          <DropdownMenuItem className="cursor-pointer rounded-xl h-11 px-3 group transition-all duration-300 hover:bg-slate-50">
            <Settings className="w-4 h-4 mr-3 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="font-bold text-sm text-slate-600 group-hover:text-black tracking-tight">{t("Settings", "Settings")}</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem className="cursor-pointer rounded-xl h-11 px-3 group transition-all duration-300 hover:bg-slate-50">
          <Sparkles className="w-4 h-4 mr-3 text-slate-400 group-hover:text-amber-500 transition-colors" />
          <span className="font-bold text-sm text-slate-600 group-hover:text-black tracking-tight">{t("Stats", "Stats")}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="mx-2 my-2 bg-slate-50" />
        
        <DropdownMenuItem
          className="cursor-pointer rounded-xl h-11 px-3 text-red-500 focus:text-red-600 focus:bg-red-50 font-bold transition-all duration-300"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span className="text-sm uppercase tracking-widest">{t("Sign Out", "Sign Out")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
