import { NextResponse } from "next/server";
import { getSupabaseAdmin, AVATAR_BUCKET } from "@/lib/supabase";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/session";

export const runtime = "nodejs";

// Uploads an avatar image to Supabase Storage and returns its public URL.
// Works during registration (no session) and from the profile page (session).
export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Image storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY." },
        { status: 503 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 2MB" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const session = await auth();
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const prefix = session?.user?.id || "registration";
    const path = `${prefix}/${prefix}-${file.size}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    // Ensure the bucket exists (idempotent).
    await supabase.storage.createBucket(AVATAR_BUCKET, { public: true }).catch(() => {});
    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    return handleApiError(error);
  }
}
