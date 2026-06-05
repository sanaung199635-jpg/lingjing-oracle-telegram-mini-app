import { createClient } from "@/lib/supabase/server";

export type ReadingType = "fortune" | "tarot" | "past_life" | "daily";

export async function assertReadingAllowed() {
  const supabase = await createClient();
  if (!supabase) {
    return { allowed: true, userId: null };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: true, userId: null };
  }

  return { allowed: true, userId: user.id };
}

export async function saveReading(type: ReadingType, result: unknown) {
  const gate = await assertReadingAllowed();
  if (!gate.userId) return;

  const supabase = await createClient();
  await supabase?.from("readings").insert({
    user_id: gate.userId,
    type,
    result
  });
}

export async function saveSoulPortrait(result: { imageUrl?: string | null; [key: string]: unknown }) {
  const gate = await assertReadingAllowed();
  if (!gate.userId) return;

  const supabase = await createClient();
  await supabase?.from("soul_portraits").insert({
    user_id: gate.userId,
    image_url: result.imageUrl || null,
    analysis: result
  });
}

export async function saveCompatibility(result: unknown) {
  const gate = await assertReadingAllowed();
  if (!gate.userId) return;

  const supabase = await createClient();
  await supabase?.from("compatibility_reports").insert({
    user_id: gate.userId,
    report: result
  });
}
