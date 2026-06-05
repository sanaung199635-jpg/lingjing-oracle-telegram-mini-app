import { NextResponse } from "next/server";
import { createAdminClient, getAdminEmails, isAdminEmail } from "@/lib/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type CountableTable =
  | "profiles"
  | "readings"
  | "soul_portraits"
  | "compatibility_reports"
  | "subscriptions";

export async function GET() {
  const publicClient = await createServerSupabaseClient();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({
      configured: false,
      reason: "缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY"
    });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      configured: false,
      reason: "缺少 SUPABASE_SERVICE_ROLE_KEY，后台无法读取全量数据"
    });
  }

  if (getAdminEmails().length === 0) {
    return NextResponse.json({
      configured: false,
      reason: "缺少 ADMIN_EMAILS，请配置允许访问后台的管理员邮箱"
    });
  }

  const {
    data: { user }
  } = publicClient ? await publicClient.auth.getUser() : { data: { user: null } };

  if (!user) {
    return NextResponse.json({ error: "请先登录管理员账号" }, { status: 401 });
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "当前账号不在 ADMIN_EMAILS 管理员白名单中" }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "后台服务客户端初始化失败" }, { status: 500 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    users,
    readings,
    soulPortraits,
    compatibility,
    subscriptions,
    activeVip,
    todayReadings,
    recentUsers,
    recentReadings,
    recentSoul,
    recentCompatibility,
    recentSubscriptions
  ] = await Promise.all([
    count(admin, "profiles"),
    count(admin, "readings"),
    count(admin, "soul_portraits"),
    count(admin, "compatibility_reports"),
    count(admin, "subscriptions"),
    admin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .neq("plan", "free")
      .eq("status", "active"),
    admin
      .from("readings")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDay.toISOString()),
    admin.from("profiles").select("id,name,avatar,created_at").order("created_at", { ascending: false }).limit(12),
    admin.from("readings").select("id,user_id,type,result,created_at").order("created_at", { ascending: false }).limit(12),
    admin.from("soul_portraits").select("id,user_id,image_url,analysis,created_at").order("created_at", { ascending: false }).limit(12),
    admin.from("compatibility_reports").select("id,user_id,report,created_at").order("created_at", { ascending: false }).limit(12),
    admin.from("subscriptions").select("id,user_id,plan,status,created_at").order("created_at", { ascending: false }).limit(12)
  ]);

  return NextResponse.json({
    configured: true,
    user: {
      id: user.id,
      email: user.email
    },
    totals: {
      users,
      readings,
      soulPortraits,
      compatibilityReports: compatibility,
      subscriptions,
      activeVip: activeVip.count || 0,
      todayReadings: todayReadings.count || 0
    },
    recent: {
      users: recentUsers.data || [],
      readings: recentReadings.data || [],
      soulPortraits: recentSoul.data || [],
      compatibilityReports: recentCompatibility.data || [],
      subscriptions: recentSubscriptions.data || []
    }
  });
}

async function count(admin: NonNullable<ReturnType<typeof createAdminClient>>, table: CountableTable) {
  const { count: value } = await admin.from(table).select("id", { count: "exact", head: true });
  return value || 0;
}
