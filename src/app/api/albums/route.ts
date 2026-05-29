import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const adminClient = createClient(supabaseUrl, supabaseKey);

  const { data } = await adminClient
    .from("albums")
    .select("*, images:gallery_images(*)")
    .order("created_at", { ascending: false });

  return NextResponse.json({ success: true, data: data || [] });
}
