import { Post } from "@/types";
import { supabase } from "./supabase";

// ===== Posts =====
export async function getPosts(options?: {
  published?: boolean;
  limit?: number;
  page?: number;
  tag?: string;
}): Promise<{ posts: Post[]; total: number }> {
  let query = supabase
    .from("posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options?.published !== undefined) {
    query = query.eq("published", options.published);
  }
  if (options?.tag) {
    query = query.contains("tags", [options.tag]);
  }
  if (options?.limit) {
    const from = ((options.page || 1) - 1) * options.limit;
    query = query.range(from, from + options.limit - 1);
  }

  const { data, count, error } = await query;
  if (error) throw error;
  return { posts: (data as Post[]) || [], total: count || 0 };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Post;
}

export async function getPostById(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Post;
}

export async function createPost(
  post: Omit<Post, "id" | "created_at" | "updated_at" | "views">
): Promise<string> {
  const { data, error } = await supabase
    .from("posts")
    .insert(post)
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function updatePost(
  id: string,
  updates: Partial<Post>
): Promise<void> {
  const { error } = await supabase
    .from("posts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

// ===== Albums =====
export async function getAlbums() {
  const { data, error } = await supabase
    .from("albums")
    .select("*, images:gallery_images(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAlbumById(id: string) {
  const { data, error } = await supabase
    .from("albums")
    .select("*, images:gallery_images(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

// ===== Videos =====
export async function getVideos() {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getVideoById(id: string) {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

// ===== Site Settings =====
export async function getSiteSettings() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .single();

  if (error) {
    // Return defaults if not set
    return {
      site_name: "Hermes Diary",
      site_description: "A personal diary",
      author_name: "Author",
      author_bio: "",
      avatar_url: null,
    };
  }
  return data;
}
