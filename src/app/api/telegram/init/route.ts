import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, getSupabaseAdminUrlForLog } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const TELEGRAM_USERS_TABLE = "telegram_users";

const bodySchema = z.object({
  initData: z.string().min(1)
});

type TelegramInitUser = {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  language_code?: string;
};

export async function POST(request: Request) {
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "initData is required" }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN is not configured" }, { status: 500 });
  }

  const parsed = parseTelegramInitData(body.data.initData);
  if (!parsed.user?.id || !parsed.hash) {
    return NextResponse.json({ error: "Invalid Telegram initData payload" }, { status: 400 });
  }

  if (!validateTelegramInitData(body.data.initData, botToken)) {
    return NextResponse.json({ error: "Telegram initData validation failed" }, { status: 401 });
  }

  let requestUrl = "";
  const supabaseUrl = getSupabaseAdminUrlForLog();

  console.log("SUPABASE_URL=", supabaseUrl);
  console.log("TABLE=", TELEGRAM_USERS_TABLE);

  const supabase = createAdminClient({
    onRequest(request) {
      requestUrl = request.url;
      console.log("REQUEST=", request);
    }
  });

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from(TELEGRAM_USERS_TABLE)
    .upsert(
      {
        telegram_user_id: parsed.user.id,
        username: parsed.user.username || null,
        first_name: parsed.user.first_name || null,
        last_name: parsed.user.last_name || null,
        photo_url: parsed.user.photo_url || null,
        language_code: parsed.user.language_code || null,
        init_data_hash: parsed.hash
      },
      { onConflict: "telegram_user_id" }
    )
    .select("id,telegram_user_id,username,first_name,last_name,photo_url,language_code,created_at,updated_at")
    .single();

  if (error) {
    console.log("ERROR=", error);
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        requestUrl,
        table: TELEGRAM_USERS_TABLE,
        schema: "public"
      },
      { status: 500 }
    );
  }

  console.log("ERROR=", null);

  return NextResponse.json({
    ok: true,
    user: data,
    requestUrl,
    table: TELEGRAM_USERS_TABLE,
    schema: "public"
  });
}

function parseTelegramInitData(initData: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  const rawUser = params.get("user");
  let user: TelegramInitUser | null = null;

  if (rawUser) {
    try {
      user = JSON.parse(rawUser) as TelegramInitUser;
    } catch {
      user = null;
    }
  }

  return { hash, user };
}

function validateTelegramInitData(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return false;

  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculatedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  const received = Buffer.from(hash, "hex");
  const calculated = Buffer.from(calculatedHash, "hex");

  if (received.length !== calculated.length) return false;
  return timingSafeEqual(received, calculated);
}
