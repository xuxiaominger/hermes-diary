import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a mock client when env vars aren't available (e.g., during build)
function createSafeClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client for build-time
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error("Supabase not configured") }),
            order: () => ({
              limit: () => ({
                range: () => Promise.resolve({ data: [], count: 0, error: null }),
              }),
              async: () => Promise.resolve({ data: [], error: null }),
              then: (resolve: any) => resolve({ data: [], error: null }),
            }),
          }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], count: 0, error: null }),
            single: async () => ({ data: null, error: new Error("Not found") }),
            then: (resolve: any) => resolve({ data: [], error: null }),
          }),
          single: async () => ({ data: null, error: new Error("Not found") }),
          limit: () => Promise.resolve({ data: [], error: null }),
          then: (resolve: any) => resolve({ data: [], error: null }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: new Error("Not configured") }),
          }),
          then: async () => ({ data: null, error: null }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
        upsert: () => Promise.resolve({ error: null }),
      }),
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: new Error("Not configured") }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
          list: async () => ({ data: [], error: null }),
          remove: async () => ({ error: null }),
        }),
      },
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signInWithPassword: async () => ({ error: new Error("Not configured") }),
        signOut: async () => {},
      },
    } as any;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export const supabase = createSafeClient();

// ===== Helper: Upload file to Supabase Storage =====
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// ===== Helper: Delete file from storage =====
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

// ===== Check if Supabase is configured =====
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
