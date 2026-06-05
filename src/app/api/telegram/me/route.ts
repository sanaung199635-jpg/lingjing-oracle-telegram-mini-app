import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const querySchema = z.object({
  telegram_user_id: z.string().regex(/^\d+$/)
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = querySchema.safeParse({
    telegram_user_id: url.searchParams.get("telegram_user_id") || ""
  });

  if (!query.success) {
    return NextResponse.json({ error: "telegram_user_id is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("telegram_users")
    .select("id,telegram_user_id,username,first_name,last_name,photo_url,language_code,created_at,updated_at")
    .eq("telegram_user_id", query.data.telegram_user_id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Telegram user not found" }, { status: 404 });
  }

  return NextResponse.json({ user: data });
}
