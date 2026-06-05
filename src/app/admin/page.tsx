"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Crown,
  Database,
  Gem,
  HeartHandshake,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { AuthPanel } from "@/components/auth-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { entertainmentNotice } from "@/lib/utils";

type DashboardResponse = {
  configured?: boolean;
  reason?: string;
  error?: string;
  user?: { id: string; email?: string };
  totals?: {
    users: number;
    readings: number;
    soulPortraits: number;
    compatibilityReports: number;
    subscriptions: number;
    activeVip: number;
    todayReadings: number;
  };
  recent?: Record<string, AdminRow[]>;
};

type AdminRow = Record<string, unknown>;

const metricConfig = [
  { key: "users", label: "用户", icon: Users },
  { key: "readings", label: "占卜记录", icon: Sparkles },
  { key: "soulPortraits", label: "灵魂画像", icon: Gem },
  { key: "compatibilityReports", label: "契合报告", icon: HeartHandshake },
  { key: "subscriptions", label: "订阅记录", icon: Database },
  { key: "activeVip", label: "有效VIP", icon: Crown },
  { key: "todayReadings", label: "今日占卜", icon: Activity }
];

const tableConfig = [
  { key: "users", label: "最近用户", columns: ["name", "id", "created_at"] },
  { key: "readings", label: "最近占卜", columns: ["type", "user_id", "created_at", "result"] },
  { key: "soulPortraits", label: "灵魂画像", columns: ["user_id", "image_url", "created_at", "analysis"] },
  { key: "compatibilityReports", label: "契合度报告", columns: ["user_id", "created_at", "report"] },
  { key: "subscriptions", label: "订阅", columns: ["plan", "status", "user_id", "created_at"] }
];

export default function AdminPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState("readings");

  async function loadDashboard() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/overview", { cache: "no-store" });
      const payload = (await response.json()) as DashboardResponse;
      setData(payload);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const rows = useMemo(() => data?.recent?.[activeTable] || [], [activeTable, data]);
  const activeColumns = tableConfig.find((table) => table.key === activeTable)?.columns || [];

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="star-field" />
      <div className="energy-line" />
      <div className="oracle-grid pointer-events-none absolute inset-0 opacity-45" />

      <section className="container relative z-10 py-8">
        <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Button asChild variant="ghost" className="mb-4 px-0">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                返回首页
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </span>
              <div>
                <h1 className="text-3xl font-semibold tracking-normal md:text-5xl">灵境后台</h1>
                <p className="mt-2 text-sm text-white/55">数据概览、用户记录、占卜内容与订阅状态</p>
              </div>
            </div>
          </div>
          <Button onClick={loadDashboard} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            刷新数据
          </Button>
        </div>

        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm leading-6 text-primary/90">
          {entertainmentNotice} 后台数据读取仅面向管理员账号。
        </div>

        {loading && !data ? (
          <Card>
            <CardContent className="flex items-center gap-3 p-6 text-white/70">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              正在读取后台数据
            </CardContent>
          </Card>
        ) : data?.configured === false ? (
          <StateCard title="后台尚未配置" description={data.reason || "请补充 Supabase 与管理员环境变量。"} />
        ) : data?.error ? (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <StateCard title="需要管理员权限" description={data.error} />
            <AuthPanel />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {metricConfig.map((metric) => {
                const Icon = metric.icon;
                const value = data?.totals?.[metric.key as keyof NonNullable<DashboardResponse["totals"]>] || 0;
                return (
                  <Card key={metric.key} className="bg-white/[0.045]">
                    <CardHeader className="p-4">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md border border-primary/25 bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardDescription>{metric.label}</CardDescription>
                      <CardTitle className="text-3xl">{value}</CardTitle>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>数据表</CardTitle>
                    <CardDescription>查看 Supabase 里最近产生的数据，敏感操作不在此页面开放。</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tableConfig.map((table) => (
                      <Button
                        key={table.key}
                        variant={activeTable === table.key ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setActiveTable(table.key)}
                      >
                        {table.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-white/10">
                  <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                    <thead className="bg-white/[0.06] text-white/55">
                      <tr>
                        {activeColumns.map((column) => (
                          <th key={column} className="border-b border-white/10 px-4 py-3 font-medium">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td className="px-4 py-6 text-white/45" colSpan={activeColumns.length}>
                            暂无数据
                          </td>
                        </tr>
                      ) : (
                        rows.map((row) => (
                          <tr key={String(row.id)} className="border-b border-white/8 align-top last:border-0">
                            {activeColumns.map((column) => (
                              <td key={column} className="max-w-[340px] px-4 py-3 text-white/72">
                                <CellValue value={row[column]} />
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </main>
  );
}

function StateCard({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-white/58">
          需要在 `.env.local` 设置 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY` 和
          `ADMIN_EMAILS`。
        </p>
      </CardContent>
    </Card>
  );
}

function CellValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-white/30">-</span>;
  }

  if (typeof value === "object") {
    return (
      <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded-md bg-black/30 p-3 text-xs leading-5 text-white/66">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  const text = String(value);
  const isDate = /^\d{4}-\d{2}-\d{2}T/.test(text);
  return <span className="break-words">{isDate ? new Date(text).toLocaleString("zh-CN") : text}</span>;
}
