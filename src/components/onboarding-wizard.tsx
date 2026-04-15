"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { User, Check, ChevronRight, Sun, Moon, Monitor, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePreferences } from "@/hooks/use-preferences";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export function OnboardingWizard() {
  const { t } = useTranslation();
  const { preferences, isLoading } = usePreferences();
  const { theme, setTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [shouldShow, setShouldShow] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Local state for selections
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && preferences) {
      // Show onboarding only for brand-new users (default theme, no customization yet)
      const isNewUser = !preferences.id;
      if (isNewUser) {
        setShouldShow(true);
      }
    }
  }, [isLoading, preferences]);

  if (!shouldShow || closing) return null;

  const handleNext = () => setStep((s) => Math.min(s + 1, 2));

  const handleSelectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    setTheme(themeId);
  };

  const finishOnboarding = async () => {
    setTheme(selectedTheme);

    if (fullName || bio) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            full_name: fullName,
            bio: bio,
          },
          { onConflict: "id" }
        );
      }
    }

    toast.success(t("Welcome to vaultOS", "Welcome to vaultOS"), {
      description: t("Your vault is ready.", "Your vault is ready."),
    });
    setClosing(true);
  };

  const themes = [
    { id: "light", label: "Light", desc: "Clean white", icon: Sun },
    { id: "dark", label: "Dark", desc: "Pitch black", icon: Moon },
    { id: "system", label: "System", desc: "Match your OS", icon: Monitor },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl px-4">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-lg w-full mx-auto p-8 md:p-10 rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-neutral-400 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Welcome
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {t("Choose your look", "Choose your look")}
              </h1>
              <p className="text-sm text-neutral-500 mt-2">
                {t("Pick a theme for your workspace", "Pick a theme for your workspace")}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {themes.map((th) => (
                <button
                  key={th.id}
                  onClick={() => handleSelectTheme(th.id)}
                  className={`relative rounded-xl border p-4 text-center transition-all duration-200 ${
                    selectedTheme === th.id
                      ? "border-white bg-white/10 shadow-lg"
                      : "border-white/10 hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  <th.icon
                    className={`w-6 h-6 mx-auto mb-2 ${
                      selectedTheme === th.id ? "text-white" : "text-neutral-500"
                    }`}
                  />
                  <div className="text-sm font-medium text-white">{th.label}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">{th.desc}</div>
                  {selectedTheme === th.id && (
                    <motion.div
                      layoutId="onboard-theme-check"
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-black" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={finishOnboarding}
                className="text-neutral-500 hover:text-white"
              >
                {t("Skip", "Skip")}
              </Button>
              <Button
                onClick={handleNext}
                className="gap-2 bg-white text-black hover:bg-neutral-200 rounded-xl px-6"
              >
                {t("Continue", "Continue")}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-lg w-full mx-auto p-8 md:p-10 rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <User className="w-7 h-7 text-neutral-400" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                {t("Set up your profile", "Set up your profile")}
              </h2>
              <p className="text-sm text-neutral-500 mt-2">
                {t("Tell us a bit about yourself", "Tell us a bit about yourself")}
              </p>
            </div>

            <div className="space-y-5 mb-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                  <ImageIcon className="w-8 h-8 text-neutral-600" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-neutral-500 font-medium">
                  {t("Name", "Name")}
                </Label>
                <Input
                  placeholder={t("e.g. John Doe", "e.g. John Doe")}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 bg-white/5 border-white/10 focus:border-white/30 rounded-xl text-white placeholder:text-neutral-600"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-neutral-500 font-medium">
                  {t("Bio", "Bio")}
                </Label>
                <Input
                  placeholder={t("A short description...", "A short description...")}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="h-11 bg-white/5 border-white/10 focus:border-white/30 rounded-xl text-white placeholder:text-neutral-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="text-neutral-500 hover:text-white"
              >
                {t("Back", "Back")}
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={finishOnboarding}
                  className="text-neutral-500 hover:text-white"
                >
                  {t("Skip", "Skip")}
                </Button>
                <Button
                  onClick={finishOnboarding}
                  className="gap-2 bg-white text-black hover:bg-neutral-200 rounded-xl px-6"
                >
                  {t("Get Started", "Get Started")}
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
