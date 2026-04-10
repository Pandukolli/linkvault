import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/blogs/[id]
 * Server-side blog deletion that properly handles auth and returns real status.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // First verify the blog exists and belongs to the user
    const { data: blog, error: fetchError } = await supabase
      .from("blogs")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    if (blog.user_id !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this blog" },
        { status: 403 }
      );
    }

    // Perform the delete
    const { error: deleteError } = await supabase
      .from("blogs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Blog delete error:", deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    // Verify the blog was actually deleted
    const { data: stillExists } = await supabase
      .from("blogs")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (stillExists) {
      // The delete was silently blocked by RLS, so do it with raw SQL via rpc
      // Fallback: try using rpc if available
      return NextResponse.json(
        {
          error:
            "Delete was blocked by database policies. Please add a DELETE RLS policy for the blogs table in Supabase.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Blog delete unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
