import { type ResumeContent } from "@/hooks/use-resumes";

export interface ATSRating {
  score: number;
  checks: {
    label: string;
    passed: boolean;
    impact: "high" | "medium" | "low";
    tip: string;
  }[];
}

export function scanATS(content: ResumeContent): ATSRating {
  const checks: ATSRating["checks"] = [];
  let score = 0;

  // 1. Contact Integrity
  const hasPhone = !!content.personalInfo.phone;
  const hasEmail = !!content.personalInfo.email;
  const hasLinkedIn = !!content.personalInfo.linkedin;
  
  checks.push({
    label: "Professional Contact Links",
    passed: hasPhone && hasEmail && hasLinkedIn,
    impact: "high",
    tip: "Ensure Phone, Email, and LinkedIn are all present for recruiter accessibility."
  });
  if (hasPhone) score += 10;
  if (hasEmail) score += 10;
  if (hasLinkedIn) score += 5;

  // 2. Summary Presence
  const hasSummary = content.summary.length > 50;
  checks.push({
    label: "Executive Narrative",
    passed: hasSummary,
    impact: "high",
    tip: "A strong 2-3 sentence summary helps ATS contextualize your profile."
  });
  if (hasSummary) score += 15;

  // 3. Experience Depth
  const experienceCount = content.experience.filter(e => e.isVisible).length;
  checks.push({
    label: "Experience Trajectory",
    passed: experienceCount >= 2,
    impact: "high",
    tip: "Include at least 2 relevant professional roles to show career progression."
  });
  if (experienceCount >= 1) score += 10;
  if (experienceCount >= 2) score += 10;

  // 4. Skills Parsing
  const totalSkills = content.skills.flatMap(s => s.items).length;
  checks.push({
    label: "Key Competencies",
    passed: totalSkills >= 8,
    impact: "medium",
    tip: "Aim for 8-15 technical or soft skill keywords for better ATS indexing."
  });
  if (totalSkills >= 5) score += 10;
  if (totalSkills >= 10) score += 5;

  // 5. Educational Foundation
  const hasEdu = content.education.some(e => e.isVisible);
  checks.push({
    label: "Academic Validation",
    passed: hasEdu,
    impact: "high",
    tip: "Always include your highest degree or relevant certifications."
  });
  if (hasEdu) score += 15;

  // 6. Project/Cert Presence (Bonus)
  const hasExtras = content.projects.length > 0 || content.certifications.length > 0;
  if (hasExtras) score += 10;

  return {
    score: Math.min(100, score),
    checks
  };
}
