import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");
    const tag = searchParams.get("tag");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let query = supabase.from("posts").select("*", { count: "exact" }).order("created_at", { ascending: false });

    if (published !== null) {
      query = query.eq("published", published === "true");
    }
    if (tag) {
      query = query.contains("tags", [tag]);
    }
    if (limit > 0) {
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({ posts: data, total: count || 0 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, error } = await supabase.from("posts").insert(body).select("id").single();
    if (error) throw error;
    return NextResponse.json({ id: data.id });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
