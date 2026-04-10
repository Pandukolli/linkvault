import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback handler.
 * Supabase redirects here after Google OAuth — exchanges code for session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if profile exists, if not create one
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!profile) {
          await supabase.from("profiles").insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            avatar_url: user.user_metadata?.avatar_url || null,
          });
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
