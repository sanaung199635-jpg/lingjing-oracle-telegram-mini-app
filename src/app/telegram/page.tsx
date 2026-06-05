"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, ShieldCheck } from "lucide-react";
import { initTelegramClient } from "@/lib/telegram/client";
import type { TelegramInitState } from "@/lib/telegram/types";

type SaveState =
  | { status: "idle"; message: string }
  | { status: "saving"; message: string }
  | { status: "saved"; message: string }
  | { status: "skipped"; message: string }
  | { status: "error"; message: string };

export default function TelegramPage() {
  const [state, setState] = useState<TelegramInitState | null>(null);
  const [saveState, setSaveState] = useState<SaveState>({
    status: "idle",
    message: "等待 Telegram 初始化"
  });

  useEffect(() => {
    let active = true;

    initTelegramClient().then((nextState) => {
      if (!active) return;
      setState(nextState);

      if (!nextState.initData) {
        setSaveState({
          status: "skipped",
          message: "普通网页测试模式，不保存 Telegram 用户"
        });
        return;
      }

      setSaveState({ status: "saving", message: "正在保存 Telegram 用户信息" });

      fetch("/api/telegram/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: nextState.initData })
      })
        .then(async (response) => {
          const payload = await response.json().catch(() => null);
          if (!response.ok) {
            throw new Error(payload?.error || "保存失败");
          }

          if (active) {
            const telegramUserId = payload?.user?.telegram_user_id;
            if (telegramUserId) {
              window.localStorage.setItem("telegram_user_id", String(telegramUserId));
            }
            setSaveState({ status: "saved", message: "登录成功，正在进入灵境 Oracle" });
            window.setTimeout(() => {
              if (active) {
                window.location.assign("/");
              }
            }, 1000);
          }
        })
        .catch((error) => {
          if (active) {
            setSaveState({
              status: "error",
              message: error instanceof Error ? error.message : "保存失败"
            });
          }
        });
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#050507] text-white">
      <section className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(24px+env(safe-area-inset-top))]">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md border border-primary/35 bg-primary/10">
            <Send className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">Telegram Mini App</h1>
            <p className="mt-1 text-sm text-white/50">灵境 Oracle 测试入口</p>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/30">
          <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-4 text-sm text-primary">
            <ShieldCheck className="h-4 w-4" />
            Telegram 环境检测
          </div>

          {!state ? (
            <div className="flex items-center gap-2 py-8 text-sm text-white/60">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              正在初始化 Telegram SDK
            </div>
          ) : (
            <div className="grid gap-3">
              <InfoRow label="是否在 Telegram 内打开" value={state.isTelegram ? "是" : "否"} />
              <InfoRow label="Telegram 用户 ID" value={formatValue(state.user.telegram_user_id)} />
              <InfoRow label="username" value={formatValue(state.user.username)} />
              <InfoRow label="first_name" value={formatValue(state.user.first_name)} />
              <InfoRow label="initData 是否存在" value={state.initData ? "是" : "否"} />
              <InfoRow label="Supabase 保存状态" value={saveState.message} tone={saveState.status} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function InfoRow({
  label,
  value,
  tone = "idle"
}: {
  label: string;
  value: string;
  tone?: SaveState["status"];
}) {
  const toneClass =
    tone === "saved"
      ? "border-emerald-400/25 bg-emerald-400/10"
      : tone === "error"
        ? "border-red-400/25 bg-red-400/10"
        : "border-white/10 bg-black/30";

  return (
    <div className={`rounded-md border p-3 ${toneClass}`}>
      <div className="mb-1 text-xs uppercase text-primary/70">{label}</div>
      <div className="break-words text-sm leading-6 text-white/82">{value}</div>
    </div>
  );
}

function formatValue(value: number | string | null) {
  if (value === null || value === "") return "-";
  return String(value);
}
