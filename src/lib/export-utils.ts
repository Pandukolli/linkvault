/**
 * Utility functions for exporting vaultOS data cleanly.
 * Formats: JSON, CSV, Markdown.
 */

export const generateMockData = () => {
  return [
    {
      id: "link-1",
      url: "https://nextjs.org/docs",
      title: "Next.js Documentation",
      description: "Learn Next.js features and API.",
      tags: ["react", "framework", "documentation"],
      created_at: new Date().toISOString(),
    },
    {
      id: "link-2",
      url: "https://supabase.com",
      title: "Supabase",
      description: "The open source Firebase alternative.",
      tags: ["database", "auth", "backend"],
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "link-3",
      url: "https://github.com",
      title: "GitHub",
      description: "Where the world builds software.",
      tags: ["git", "code", "hosting"],
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    }
  ];
};

const triggerDownload = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToJSON = async () => {
  const data = generateMockData();
  const json = JSON.stringify(data, null, 2);
  triggerDownload(json, `vaultos-export-${Date.now()}.json`, "application/json");
};

export const exportToCSV = async () => {
  const data = generateMockData();
  if (!data.length) return;
  
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(item => {
    return [
      item.id,
      `"${item.url}"`,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      `"${item.tags.join(";")}"`,
      item.created_at
    ].join(",");
  });
  
  const csv = [headers, ...rows].join("\n");
  triggerDownload(csv, `vaultos-export-${Date.now()}.csv`, "text/csv");
};

export const exportToMarkdown = async () => {
  const data = generateMockData();
  let md = "# vaultOS Bookmarks Export\n\n";
  
  data.forEach(item => {
    md += `### [${item.title}](${item.url})\n`;
    md += `> ${item.description}\n\n`;
    md += `**Tags**: ${item.tags.map(t => `\`#${t}\``).join(" ")}\n`;
    md += `*Saved*: ${new Date(item.created_at).toLocaleDateString()}\n\n`;
    md += `---\n\n`;
  });
  
  triggerDownload(md, `vaultos-export-${Date.now()}.md`, "text/markdown");
};
