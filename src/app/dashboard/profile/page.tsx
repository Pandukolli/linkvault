"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Camera,
  Loader2,
  Save,
  User as UserIcon,
  Mail,
  AtSign,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { profile, isLoading, updateProfile, uploadAvatar } = useProfile();
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setEmail(data.user.email || "");
    });
  }, [supabase.auth]);

  if (profile && !initialized) {
    setFullName(profile.full_name || "");
    setBio(profile.bio || "");
    setInitialized(true);
  }

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error(t("Please upload an image file", "Please upload an image file"));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t("Image must be under 2 MB", "Image must be under 2 MB"));
        return;
      }
      uploadAvatar.mutate(file);
    },
    [uploadAvatar, t]
  );

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleSave = () => {
    if (!fullName.trim()) {
      toast.error(t("Name is required", "Name is required"));
      return;
    }
    updateProfile.mutate({ full_name: fullName.trim(), bio: bio.trim() || undefined });
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const bioLength = bio.length;
  const bioMax = 160;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md space-y-8 p-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-32 w-32 rounded-full bubble-glow" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        {/* Simple Premium Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
            <UserIcon className="w-3.5 h-3.5" />
            <span>{t("Account Settings", "Account Settings")}</span>
          </div>
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">
            {t("My Profile", "My Profile")}
          </h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
          <div className="p-8 sm:p-10 space-y-10">
            
            {/* Minimal Avatar Section */}
            <div className="flex flex-col items-center">
              <div
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`absolute -inset-1.5 rounded-full border-2 border-primary/20 border-dashed transition-all duration-500 ${
                  isDragging ? "opacity-100 scale-105" : "opacity-0 scale-95"
                }`} />
                
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg transition-transform duration-500 group-hover:scale-105">
                  <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
                  <AvatarFallback className="bg-slate-50 text-slate-400 text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                  {uploadAvatar.isPending ? (
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>
              <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t("Tap to change photo", "Tap to change photo")}
              </p>
            </div>

            <div className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  {t("Email Address", "Email Address")}
                </Label>
                <div className="relative">
                  <Input
                    value={email}
                    disabled
                    className="h-12 bg-slate-50 text-slate-500 border-none rounded-xl cursor-not-allowed pr-12 font-bold"
                  />
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  {t("Full Name", "Full Name")}
                </Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("Your name", "Your name")}
                  className="h-12 bg-white border border-slate-100 hover:border-primary focus:border-primary rounded-xl font-bold transition-all shadow-none"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t("Bio", "Bio")}
                  </Label>
                  <span className="text-[9px] font-bold text-slate-300">
                    {bioLength}/{bioMax}
                  </span>
                </div>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t("Tell us about yourself...", "Tell us about yourself...")}
                  maxLength={bioMax}
                  className="h-28 bg-white border border-slate-100 hover:border-primary focus:border-primary rounded-xl resize-none font-bold p-4 shadow-none transition-all"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                size="lg"
                onClick={handleSave}
                disabled={updateProfile.isPending || !fullName.trim()}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
              >
                {updateProfile.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                ) : (
                  <Save className="w-5 h-5 mr-3" />
                )}
                {t("Save Changes", "Save Changes")}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
