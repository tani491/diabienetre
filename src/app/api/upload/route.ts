import { randomUUID } from "crypto";
import { extname } from "path";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { enforceApiRateLimit } from "@/lib/api-security";

const STORAGE_BUCKET = "products";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(step: string, error: string, status = 500, details?: unknown) {
  console.error(`[Upload:${step}] ${error}`, details ?? "");

  return NextResponse.json(
    {
      success: false,
      step,
      error,
      details,
    },
    { status }
  );
}

function getSupabaseEnv() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl) {
    return {
      error: "SUPABASE_URL is missing. Add it in Vercel Project Settings > Environment Variables.",
    };
  }

  if (!serviceRoleKey) {
    return {
      error:
        "SUPABASE_SERVICE_ROLE_KEY is missing. Add the service_role key in Vercel Project Settings > Environment Variables.",
    };
  }

  try {
    const parsedUrl = new URL(supabaseUrl);

    if (!["https:", "http:"].includes(parsedUrl.protocol)) {
      return { error: `SUPABASE_URL must start with https://. Current protocol: ${parsedUrl.protocol}` };
    }
  } catch {
    return { error: `SUPABASE_URL is not a valid URL. Current value starts with: ${supabaseUrl.slice(0, 24)}` };
  }

  if (!serviceRoleKey.startsWith("eyJ")) {
    return {
      error:
        "SUPABASE_SERVICE_ROLE_KEY does not look like a Supabase JWT. Copy the service_role key, not the anon key.",
    };
  }

  return { supabaseUrl, serviceRoleKey };
}

function getSafeExtension(file: File) {
  const extension = extname(file.name || "").toLowerCase();

  if (extension) {
    return extension;
  }

  if (file.type === "image/jpeg") return ".jpg";
  if (file.type === "image/png") return ".png";
  if (file.type === "image/gif") return ".gif";
  if (file.type === "image/webp") return ".webp";

  return "";
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  console.log(`[Upload:${requestId}] POST /api/upload started`);

  try {
    const rateLimitResponse = await enforceApiRateLimit(request);
    if (rateLimitResponse) {
      console.warn(`[Upload:${requestId}] Rate limit rejected the request`);
      return rateLimitResponse;
    }
  } catch (error) {
    return jsonError("rate-limit", "Rate-limit check failed before upload.", 500, String(error));
  }

  const env = getSupabaseEnv();
  if ("error" in env) {
    return jsonError("env", env.error, 400);
  }

  console.log(`[Upload:${requestId}] Supabase env loaded`, {
    supabaseUrl: env.supabaseUrl,
    serviceRoleKeyPrefix: env.serviceRoleKey.slice(0, 8),
    bucket: STORAGE_BUCKET,
  });

  try {
    const { requireAdmin } = await import("@/lib/auth-api");
    const { authorized } = await requireAdmin();

    if (!authorized) {
      console.warn(`[Upload:${requestId}] Unauthorized upload attempt`);
      return NextResponse.json(
        { success: false, step: "auth", error: "Unauthorized" },
        { status: 401 }
      );
    }
  } catch (error) {
    return jsonError("auth", "Admin authentication check failed.", 500, String(error));
  }

  let file: File;

  try {
    console.log(`[Upload:${requestId}] Reading formData`);
    const formData = await request.formData();
    const maybeFile = formData.get("file");

    if (!(maybeFile instanceof File)) {
      return jsonError("form-data", "No file found in formData field named 'file'.", 400);
    }

    file = maybeFile;
    console.log(`[Upload:${requestId}] File received`, {
      name: file.name,
      type: file.type,
      size: file.size,
    });
  } catch (error) {
    return jsonError("form-data", "Unable to read multipart formData.", 400, String(error));
  }

  const extension = getSafeExtension(file);
  const contentType = file.type || "application/octet-stream";

  if (!contentType.startsWith("image/") || !ALLOWED_MIME_TYPES.has(contentType)) {
    return jsonError(
      "file-validation",
      `Invalid image MIME type: ${contentType}. Allowed: JPG, PNG, GIF, WebP.`,
      400
    );
  }

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return jsonError(
      "file-validation",
      `Invalid file extension: ${extension || "(none)"}. Allowed: .jpg, .jpeg, .png, .gif, .webp.`,
      400
    );
  }

  if (file.size <= 0) {
    return jsonError("file-validation", "The uploaded file is empty.", 400);
  }

  if (file.size > MAX_SIZE) {
    return jsonError("file-validation", "Image trop grande. Taille maximale: 5 Mo.", 400, {
      size: file.size,
      maxSize: MAX_SIZE,
    });
  }

  let fileBody: Uint8Array;

  try {
    console.log(`[Upload:${requestId}] Converting file to Uint8Array`);
    const arrayBuffer = await file.arrayBuffer();
    fileBody = new Uint8Array(arrayBuffer);
  } catch (error) {
    return jsonError("file-buffer", "Unable to read uploaded file bytes.", 500, String(error));
  }

  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  console.log(`[Upload:${requestId}] Uploading to Supabase Storage`, {
    bucket: STORAGE_BUCKET,
    filename,
    contentType,
    size: fileBody.byteLength,
  });

  try {
    const supabase = createClient(env.supabaseUrl, env.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          "X-Client-Info": "diabienetre-admin-upload",
        },
      },
    });

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, fileBody, {
        contentType,
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      const storageStatus =
        typeof (error as { statusCode?: unknown }).statusCode === "number"
          ? (error as { statusCode: number }).statusCode
          : 500;

      return jsonError("supabase-upload", `Supabase Storage upload failed: ${error.message}`, storageStatus, {
        name: error.name,
        message: error.message,
        statusCode: (error as { statusCode?: unknown }).statusCode,
      });
    }

    const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);

    if (!publicUrlData?.publicUrl) {
      return jsonError("public-url", "Upload succeeded, but Supabase did not return a public URL.", 500, data);
    }

    console.log(`[Upload:${requestId}] Upload succeeded`, {
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
    });

    return NextResponse.json({
      success: true,
      step: "complete",
      url: publicUrlData.publicUrl,
      filename,
      path: data.path,
    });
  } catch (error) {
    return jsonError("supabase-upload", "Unexpected exception while uploading to Supabase Storage.", 500, {
      message: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === "production" ? undefined : error instanceof Error ? error.stack : undefined,
    });
  }
}
