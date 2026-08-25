import { extname } from "path";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-api";
import { uploadToStorage } from "@/lib/supabase-storage";
import { enforceApiRateLimit } from "@/lib/api-security";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

export async function POST(request: NextRequest) {
  const rateLimitResponse = await enforceApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { authorized } = await requireAdmin();
  if (!authorized) {
    console.warn("[Upload] Unauthorized upload attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.warn("[Upload] No file provided");
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      console.warn(`[Upload] Invalid file type: ${file.type}`);
      return NextResponse.json({ error: "Le fichier doit être une image" }, { status: 400 });
    }

    const ext = extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      console.warn(`[Upload] File extension not allowed: ${ext}`);
      return NextResponse.json(
        { error: "Format non supporté. Utilisez JPG, PNG, GIF ou WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      console.warn(`[Upload] File too large: ${file.size} bytes (max ${MAX_SIZE})`);
      return NextResponse.json({ error: "Image trop grande (max 5 Mo)" }, { status: 400 });
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `${timestamp}-${randomStr}${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const publicUrl = await uploadToStorage(filename, buffer, file.type);

    return NextResponse.json({ success: true, url: publicUrl, filename });
  } catch (error: any) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}
