"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Settings, Paintbrush, Bot, Database, Shield, AlertTriangle,
  Monitor, Moon, Sun, Download, Upload, Trash2, LogOut,
  Globe, Clock, LayoutGrid, LayoutList,
  Sparkles, Brain, Zap, Search, Mail,
  FileJson, FileText, FileSpreadsheet, HardDrive,
  Eye, EyeOff, ShieldCheck, Timer, Smartphone, AlertCircle, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePreferences } from "@/hooks/use-preferences";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { createClient } from "@/lib/supabase/client";
import { exportToJSON, exportToCSV, exportToMarkdown } from "@/lib/export-utils";
import { useTranslation } from "react-i18next";

const languages = [
  { value: "en", label: "English" }, { value: "hi", label: "Hindi" },
  { value: "te", label: "Telugu" }, { value: "ta", label: "Tamil" },
  { value: "kn", label: "Kannada" }, { value: "ml", label: "Malayalam" },
  { value: "mr", label: "Marathi" }, { value: "bn", label: "Bengali" },
  { value: "es", label: "Spanish" }, { value: "fr", label: "French" },
  { value: "de", label: "German" }, { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" }, { value: "nl", label: "Dutch" },
  { value: "ru", label: "Russian" }, { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" }, { value: "zh", label: "Chinese (Simplified)" },
  { value: "ar", label: "Arabic" }, { value: "tr", label: "Turkish" },
  { value: "id", label: "Indonesian" }, { value: "th", label: "Thai" },
  { value: "vi", label: "Vietnamese" }
];

type Section = "general" | "appearance" | "ai" | "data" | "privacy" | "danger";

function SettingRow({
  icon: Icon, label, description, children, comingSoon,
}: {
  icon?: React.ElementType; label: string; description?: string;
  children: React.ReactNode; comingSoon?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-8 p-6 sm:p-8 group transition-all border-b border-slate-50 last:border-0 hover:bg-white/50">
      <div className="flex items-start gap-5 min-w-0 flex-1">
        {Icon && (
          <div className="mt-0.5 w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/5 group-hover:scale-110 transition-all duration-500">
            <Icon className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
          </div>
        )}
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-3">
            <Label className="text-sm font-black text-black uppercase tracking-tight">{label}</Label>
            {comingSoon && (
              <Badge variant="secondary" className="text-[9px] px-2 py-0.5 h-auto font-black bg-slate-100 text-slate-400 border-none uppercase tracking-widest">SOON</Badge>
            )}
          </div>
          {description && <p className="text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-[0.05em] opacity-70 italic">{description}</p>}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SettingCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-primary/5 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Section>("general");
  const [languageOpen, setLanguageOpen] = useState(false);
  const { preferences: p, isLoading, set } = usePreferences();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [accountDeleteText, setAccountDeleteText] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: { id: Section; label: string; icon: React.ElementType; danger?: boolean }[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "ai", label: "AI & Intelligence", icon: Bot },
    { id: "data", label: "Data & Export", icon: Database },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
  ];

  const handleSignOutOtherDevices = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "others" });
      if (error) throw error;
      toast.success("Other sessions revoked successfully");
    } catch {
      toast.error("Failed to revoke other sessions");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-72" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden -m-4 md:-m-6 lg:-m-8 bg-background">
      {/* Header */}
      <div className="flex-none px-6 sm:px-8 md:px-12 pt-12 pb-8 border-b border-slate-100 bg-white">
        <h1 className="text-3xl font-black text-black tracking-tight uppercase">{t("Settings")}</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">Configure preferences, intelligence, and account security</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left nav */}
        <aside className="hidden md:flex w-56 lg:w-72 flex-col border-r border-slate-100 bg-white p-6 lg:p-8 gap-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group relative flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-300 cursor-pointer ${
                  isActive
                    ? item.danger ? "bg-red-500 text-white font-black" : "bg-primary text-white font-black shadow-lg shadow-primary/20"
                    : item.danger ? "text-red-400 hover:text-red-500 hover:bg-red-50 font-bold" : "text-slate-400 hover:text-black hover:bg-slate-50 font-bold"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110 opacity-70"}`} />
                  {item.label}
                </div>
                {isActive && (
                   <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                )}
              </button>
            );
          })}
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden flex overflow-x-auto border-b border-slate-100 bg-white px-2 gap-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-4 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
                activeTab === item.id
                  ? item.danger ? "text-red-500 border-b-2 border-red-500" : "text-primary border-b-2 border-primary"
                  : "text-slate-400"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />{item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 md:p-12 lg:p-16">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="max-w-3xl space-y-10">

              {/* GENERAL */}
              {activeTab === "general" && (
                <>
                  <div>
                    <h2 className="text-2xl font-black text-black uppercase tracking-tight">General</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Core preferences and display behavior</p>
                  </div>
                  <SettingCard>
                    <SettingRow icon={Globe} label="Language" description="Primary display language">
                      <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
                        <PopoverTrigger className="flex h-9 w-[180px] items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm hover:bg-muted focus:outline-hidden focus:ring-1 focus:ring-ring">
                          {p.language ? languages.find((l) => l.value === p.language)?.label || "Select..." : "Select..."}
                        </PopoverTrigger>
                        <PopoverContent className="w-[220px] p-0" align="end">
                          <Command>
                            <CommandInput placeholder="Search language..." />
                            <CommandList>
                              <CommandEmpty>No language found.</CommandEmpty>
                              <CommandGroup>
                                {languages.map((language) => (
                                  <CommandItem key={language.value} value={language.label}
                                    onSelect={() => { set("language", language.value); setLanguageOpen(false); }}>
                                    <Check className={`mr-2 h-4 w-4 ${p.language === language.value ? "opacity-100" : "opacity-0"}`} />
                                    {language.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </SettingRow>
                    <SettingRow icon={Clock} label="Timezone" description="Used for timestamps and digests">
                      <Select value={p.timezone || ""} onValueChange={(v) => set("timezone", v as string)}>
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-detect</SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="est">EST (UTC−5)</SelectItem>
                          <SelectItem value="pst">PST (UTC−8)</SelectItem>
                          <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                          <SelectItem value="jst">JST (UTC+9)</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>
                    <SettingRow icon={LayoutGrid} label="Default View" description="Preferred link layout">
                      <Select value={p.default_view || ""} onValueChange={(v) => set("default_view", v as string)}>
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid"><span className="flex items-center gap-2"><LayoutGrid className="w-3.5 h-3.5" /> Grid</span></SelectItem>
                          <SelectItem value="list"><span className="flex items-center gap-2"><LayoutList className="w-3.5 h-3.5" /> List</span></SelectItem>
                          <SelectItem value="compact"><span className="flex items-center gap-2"><LayoutList className="w-3.5 h-3.5" /> Compact</span></SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>
                    <SettingRow icon={Database} label="Items Per Page" description="Links loaded per view">
                      <Select value={String(p.items_per_page)} onValueChange={(v) => set("items_per_page", Number(v))}>
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25 items</SelectItem>
                          <SelectItem value="50">50 items</SelectItem>
                          <SelectItem value="100">100 items</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>
                  </SettingCard>
                </>
              )}

              {/* AI & INTELLIGENCE */}
              {activeTab === "ai" && (
                <>
                  <div className="mb-10">
                    <h2 className="text-3xl font-black text-black uppercase tracking-tight">Intelligence</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 opacity-50">Neural processing and semantic analysis</p>
                  </div>

                  <div className="rounded-[2rem] border border-slate-100 bg-white p-6 flex items-center gap-6 shadow-2xl shadow-primary/5 transition-all hover:scale-[1.02] duration-500 group mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                      <Brain className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-black uppercase tracking-widest">Neural Core Engine</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase opacity-60">Architected with Google Gemini</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-black bg-emerald-50 text-emerald-600 border-none px-3 py-1"><Zap className="w-3 h-3 mr-1.5" />ACTIVE</Badge>
                  </div>

                  <SettingCard>
                    <SettingRow icon={Zap} label="AI Auto-tagging" description="Auto-analyze and tag links when saved">
                      <Switch checked={p.auto_tagging} onCheckedChange={(v) => set("auto_tagging", v)} />
                    </SettingRow>
                    <SettingRow icon={Brain} label="Smart Summary on Save" description="Generate a 2-line summary per link">
                      <Switch checked={p.smart_summary} onCheckedChange={(v) => set("smart_summary", v)} />
                    </SettingRow>
                    <SettingRow icon={Bot} label="AI Model" description="Gemini model for intelligence processing">
                      <Select value={p.ai_model || ""} onValueChange={(v) => set("ai_model", v as string)}>
                        <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini-2.5-flash"><span className="flex items-center gap-2"><Zap className="w-3 h-3" /> Gemini 2.5 Flash</span></SelectItem>
                          <SelectItem value="gemini-2.5-pro"><span className="flex items-center gap-2"><Brain className="w-3 h-3" /> Gemini 2.5 Pro</span></SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>
                    <SettingRow icon={Search} label="Semantic Search Strength" description="Context matching depth for search queries">
                      <Select value={p.semantic_search_strength || ""} onValueChange={(v) => set("semantic_search_strength", v as string)}>
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low — Exact</SelectItem>
                          <SelectItem value="medium">Medium — Balanced</SelectItem>
                          <SelectItem value="high">High — Deep context</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>
                    <SettingRow icon={Mail} label="Daily AI Digest" description="Email summary of new saves each morning" comingSoon>
                      <Switch disabled />
                    </SettingRow>
                  </SettingCard>
                </>
              )}

              {/* DATA & EXPORT */}
              {activeTab === "data" && (
                <>
                  <div>
                    <h2 className="text-3xl font-black text-black uppercase tracking-tight">Archives</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 opacity-50">Data portability and storage protocols</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-black px-1 opacity-40">Export Protocols</h3>
                    <SettingCard>
                      <SettingRow icon={FileJson} label="Export as JSON" description="Full structured export with tags and metadata">
                        <Button size="sm" variant="outline" onClick={async () => { await exportToJSON(); toast.success("Export finished — JSON"); }} className="gap-1.5 rounded-lg"><Download className="w-3.5 h-3.5" /> Export</Button>
                      </SettingRow>
                      <SettingRow icon={FileSpreadsheet} label="Export as CSV" description="Spreadsheet-compatible format">
                        <Button size="sm" variant="outline" onClick={async () => { await exportToCSV(); toast.success("Export finished — CSV"); }} className="gap-1.5 rounded-lg"><Download className="w-3.5 h-3.5" /> Export</Button>
                      </SettingRow>
                      <SettingRow icon={FileText} label="Export as Markdown" description="For Obsidian, Notion, or GitHub">
                        <Button size="sm" variant="outline" onClick={async () => { await exportToMarkdown(); toast.success("Export finished — Markdown"); }} className="gap-1.5 rounded-lg"><Download className="w-3.5 h-3.5" /> Export</Button>
                      </SettingRow>
                    </SettingCard>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold px-1">Import</h3>
                    <SettingCard>
                      <SettingRow icon={Upload} label="Import from Chrome Bookmarks" description="Upload your Chrome HTML bookmarks file">
                        <Button size="sm" variant="outline" className="gap-1.5 rounded-lg"><Upload className="w-3.5 h-3.5" /> Import</Button>
                      </SettingRow>
                    </SettingCard>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold px-1">Backup</h3>
                    <SettingCard>
                      <SettingRow icon={HardDrive} label="Backup Frequency" description="Automatic cloud backups">
                        <Select value={p.backup_frequency || ""} onValueChange={(v) => set("backup_frequency", v as string)}>
                          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Automatic (Daily)</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="manual">Manual Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </SettingRow>
                    </SettingCard>
                  </div>
                </>
              )}

              {/* PRIVACY & SECURITY */}
              {activeTab === "privacy" && (
                <>
                  <div>
                    <h2 className="text-3xl font-black text-black uppercase tracking-tight">Security</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 opacity-50">Visibility, encryption, and protocols</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold px-1">Visibility</h3>
                    <SettingCard>
                      <SettingRow icon={Eye} label="Public Profile" description="Allow others to view your profile and public collections">
                        <Switch checked={p.public_profile} onCheckedChange={(v) => set("public_profile", v)} />
                      </SettingRow>
                      <SettingRow icon={EyeOff} label="Public Collections by Default" description="New collections visible to anyone by default">
                        <Switch checked={p.allow_public_collections} onCheckedChange={(v) => set("allow_public_collections", v)} />
                      </SettingRow>
                    </SettingCard>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold px-1">Sessions</h3>
                    <SettingCard>
                      <div className="p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Smartphone className="w-4 h-4 text-emerald-500" /></div>
                            <div>
                              <p className="text-sm font-medium">Current Session</p>
                              <p className="text-xs text-muted-foreground">This device — Active now</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-0">ACTIVE</Badge>
                        </div>
                        <Separator />
                        <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10 gap-1.5 rounded-lg" onClick={handleSignOutOtherDevices}>
                          <LogOut className="w-3.5 h-3.5" /> Sign Out Other Devices
                        </Button>
                      </div>
                    </SettingCard>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold px-1">Security</h3>
                    <SettingCard>
                      <SettingRow icon={ShieldCheck} label="Two-Factor Authentication" description="Extra security layer for your account" comingSoon>
                        <Button size="sm" variant="outline" disabled className="gap-1.5 opacity-50 rounded-lg">Enable 2FA</Button>
                      </SettingRow>
                      <SettingRow icon={Timer} label="Data Retention" description="How long deleted items stay recoverable">
                        <Select defaultValue="30">
                          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </SettingRow>
                    </SettingCard>
                  </div>
                </>
              )}

              {/* DANGER ZONE */}
              {activeTab === "danger" && (
                <>
                  <div>
                    <h2 className="text-3xl font-black text-red-500 uppercase tracking-tight">Danger Zone</h2>
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] mt-2 opacity-50">Irreversible destructive operations</p>
                  </div>

                  <div className="rounded-[2.5rem] border border-red-100 bg-white overflow-hidden shadow-2xl shadow-red-500/5">
                    <div className="p-8 space-y-6">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Trash2 className="w-7 h-7 text-red-500" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-black text-black">PURGE DATA</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">Permanently delete all links, notes, and collections. non-recoverable.</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-4 ml-0 sm:ml-20">
                        <Input placeholder='Type "PURGE" to confirm' value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} className="max-w-xs text-xs rounded-xl h-11 border-slate-100" />
                        <Button disabled={deleteConfirmText !== "PURGE"} variant="destructive" size="sm" className="h-11 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-500/20">
                          Execute Purge
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-destructive/25 bg-destructive/[0.03] overflow-hidden">
                    <div className="p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-semibold">Delete Account Permanently</h3>
                          <p className="text-sm text-destructive/80">Permanently erase your profile, all saved data, and authentication.</p>
                        </div>
                      </div>
                      <div className="ml-14 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                        <p className="text-xs text-destructive/70 flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          This is permanent. Data will be deleted within 24 hours and cannot be recovered.
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-14">
                        <Input placeholder='Type "delete my account"' value={accountDeleteText} onChange={(e) => setAccountDeleteText(e.target.value)} className="max-w-xs text-sm rounded-lg" />
                        <Button disabled={accountDeleteText !== "delete my account"} variant="destructive" size="sm" className="rounded-lg" onClick={() => { toast.error("Account deletion is disabled in preview"); setAccountDeleteText(""); }}>
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
