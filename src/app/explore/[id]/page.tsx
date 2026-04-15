import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Link2, Globe, ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Public collection page — beautiful read-only view.
 * No authentication required. Only shows public collections.
 */
export default async function PublicCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the collection (must be public)
  const { data: collection, error: collError } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (collError || !collection) {
    notFound();
  }

  // Fetch links in this collection
  const { data: collLinks } = await supabase
    .from("collection_links")
    .select("link_id, links(*)")
    .eq("collection_id", id);

  const links = (collLinks || []).map((cl: any) => cl.links).filter(Boolean);

  // Fetch the owner's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("user_id", collection.user_id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold gradient-text">vaultOS</span>
          </Link>
          <Link href="/login">
            <Button size="sm" variant="outline" className="text-xs">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Collection Header */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>

        <div className="mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">Public Collection</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">{collection.name}</h1>
        {collection.description && (
          <p className="text-muted-foreground">{collection.description}</p>
        )}

        {profile && (
          <p className="text-sm text-muted-foreground mt-3">
            Curated by <span className="font-medium text-foreground">{profile.full_name}</span>
          </p>
        )}

        <Badge variant="secondary" className="mt-3 text-xs">
          {links.length} links
        </Badge>
      </div>

      {/* Links */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="space-y-3">
          {links.map((link: any, i: number) => (
            <a
              key={String(link.id || i)}
              href={String(link.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {link.favicon ? (
                  <Image src={String(link.favicon)} alt="" width={20} height={20} className="rounded" unoptimized />
                ) : (
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {String(link.title || link.url)}
                </h3>
                {link.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {String(link.description)}
                  </p>
                )}
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </a>
          ))}
        </div>

        {links.length === 0 && (
          <div className="text-center py-16">
            <Link2 className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">This collection is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}
