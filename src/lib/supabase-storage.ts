import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const STORAGE_BUCKET = "products";

let _client: SupabaseClient | null = null;

function validateSupabaseUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  // Doit commencer par https:// et contenir .supabase.co
  return url.startsWith("https://") && url.includes(".supabase.co");
}

function getClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  // Validation stricte
  if (!url) {
    const error = "SUPABASE_URL is not set in environment variables";
    console.error(`[Supabase] ERROR: ${error}`);
    throw new Error(error);
  }

  if (!validateSupabaseUrl(url)) {
    const error = `SUPABASE_URL is malformed. Expected format: https://xxxxx.supabase.co, got: ${url}`;
    console.error(`[Supabase] ERROR: ${error}`);
    throw new Error(error);
  }

  if (!key) {
    const error = "SUPABASE_SERVICE_ROLE_KEY is not set in environment variables";
    console.error(`[Supabase] ERROR: ${error}`);
    throw new Error(error);
  }

  if (!key.startsWith("eyJ")) {
    const error = `SUPABASE_SERVICE_ROLE_KEY appears invalid (doesn't start with 'eyJ'). Check that you copied the correct "service_role" secret.`;
    console.error(`[Supabase] ERROR: ${error}`);
    throw new Error(error);
  }

  try {
    console.log(`[Supabase] Initializing client with URL: ${url}`);
    _client = createClient(url, key, { auth: { persistSession: false } });
    console.log(`[Supabase] Client initialized successfully`);
    return _client;
  } catch (err: any) {
    console.error(`[Supabase] Failed to create client: ${err.message}`);
    throw err;
  }
}

export async function uploadToStorage(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  console.log(`[Supabase] Uploading file: ${filename} (${buffer.length} bytes, type: ${contentType})`);

  try {
    const client = getClient();

    // Upload
    const { error } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(filename, buffer, { contentType, upsert: false });

    if (error) {
      console.error(`[Supabase] Upload failed for ${filename}:`, error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    console.log(`[Supabase] Upload successful: ${filename}`);

    // Get public URL
    const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
    console.log(`[Supabase] Public URL: ${data.publicUrl}`);
    return data.publicUrl;
  } catch (err: any) {
    console.error(`[Supabase] Upload error for ${filename}:`, err);
    throw err;
  }
}
