"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  BrainCircuit,
  CalendarDays,
  Gem,
  HeartHandshake,
  History,
  Loader2,
  Maximize2,
  MoonStar,
  Sparkles,
  Stars,
  UserCircle,
  WandSparkles,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { entertainmentNotice } from "@/lib/utils";

type ApiState = Record<string, unknown> | null;
type TarotVisual = { number: string; symbol: string; subtitle: string; art: TarotArtKind; image?: string };
type TarotPreview = { card: string; index: number; visual: TarotVisual };
type TelegramProfile = {
  id: string;
  telegram_user_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
  language_code: string | null;
  created_at: string;
  updated_at: string;
};

const featureNav = [
  { id: "fortune", label: "命运解析", icon: BrainCircuit },
  { id: "tarot", label: "AI塔罗", icon: Sparkles },
  { id: "soul", label: "灵魂画像", icon: Gem },
  { id: "past", label: "前世身份", icon: MoonStar },
  { id: "compatibility", label: "双人契合", icon: HeartHandshake },
  { id: "daily", label: "今日运势", icon: CalendarDays }
];

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<T>;
}

function postOracle(url: string, body: unknown) {
  return postJson<ApiState>(url, body);
}

const tarotVisuals: Record<string, TarotVisual> = {
  愚者: { number: "00", symbol: "✦", subtitle: "未知之门", art: "fool", image: "/tarot/fool.png" },
  魔术师: { number: "01", symbol: "∞", subtitle: "意志显化", art: "magician", image: "/tarot/magician.png" },
  女祭司: { number: "02", symbol: "☾", subtitle: "深层直觉", art: "priestess", image: "/tarot/priestess.png" },
  皇帝: { number: "04", symbol: "♔", subtitle: "秩序与权柄", art: "emperor", image: "/tarot/emperor.png" },
  恋人: { number: "06", symbol: "♡", subtitle: "选择与连结", art: "lovers", image: "/tarot/lovers.png" },
  战车: { number: "07", symbol: "◆", subtitle: "推进之力", art: "chariot", image: "/tarot/chariot.png" },
  力量: { number: "08", symbol: "☼", subtitle: "温柔掌控", art: "strength", image: "/tarot/strength.png" },
  隐者: { number: "09", symbol: "✧", subtitle: "内在灯塔", art: "hermit", image: "/tarot/hermit.png" },
  命运之轮: { number: "10", symbol: "◉", subtitle: "周期转动", art: "wheel", image: "/tarot/wheel.png" },
  正义: { number: "11", symbol: "⚖", subtitle: "平衡法则", art: "justice", image: "/tarot/justice.png" },
  倒吊人: { number: "12", symbol: "▽", subtitle: "视角翻转", art: "hanged", image: "/tarot/hanged.png" },
  死神: { number: "13", symbol: "✕", subtitle: "旧我蜕变", art: "death", image: "/tarot/death.png" },
  节制: { number: "14", symbol: "♢", subtitle: "调和之泉", art: "temperance", image: "/tarot/temperance.png" },
  恶魔: { number: "15", symbol: "♆", subtitle: "欲望锁链", art: "devil", image: "/tarot/devil.png" },
  高塔: { number: "16", symbol: "⚡", subtitle: "结构震荡", art: "tower", image: "/tarot/tower.png" },
  星星: { number: "17", symbol: "✶", subtitle: "希望之光", art: "star", image: "/tarot/star.png" },
  月亮: { number: "18", symbol: "☽", subtitle: "潜意识迷雾", art: "moon", image: "/tarot/moon.png" },
  太阳: { number: "19", symbol: "☀", subtitle: "生命显现", art: "sun", image: "/tarot/sun.png" },
  审判: { number: "20", symbol: "✺", subtitle: "灵魂召唤", art: "judgement", image: "/tarot/judgement.png" },
  世界: { number: "21", symbol: "◎", subtitle: "完成之环", art: "world", image: "/tarot/world.png" }
};

type TarotArtKind =
  | "fool"
  | "magician"
  | "priestess"
  | "emperor"
  | "lovers"
  | "chariot"
  | "strength"
  | "hermit"
  | "wheel"
  | "justice"
  | "hanged"
  | "death"
  | "temperance"
  | "devil"
  | "tower"
  | "star"
  | "moon"
  | "sun"
  | "judgement"
  | "world";

function VisualResult({
  type,
  result,
  revealedTarot = [],
  onRevealTarot,
  onOpenTarot
}: {
  type: string;
  result: ApiState;
  revealedTarot?: boolean[];
  onRevealTarot?: (index: number) => void;
  onOpenTarot?: (preview: TarotPreview) => void;
}) {
  if (!result) {
    return (
      <div className="oracle-poster flex min-h-[220px] items-center justify-center p-6 text-center">
        <div>
          <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary/80" />
          <p className="text-sm leading-6 text-white/52">生成后会以图片卡片形式呈现，不需要额外准备素材。</p>
        </div>
      </div>
    );
  }

  if (type === "tarot") {
    const cards = Array.isArray(result.cards) ? result.cards.map(String) : [];
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {cards.map((card, index) => {
            const visual = tarotVisuals[card] || { number: "??", symbol: "✦", subtitle: "神秘启示", art: "star" as TarotArtKind };
            const isRevealed = Boolean(revealedTarot[index]);

            return (
              <button
                key={`${card}-${index}`}
                type="button"
                className={`tarot-flip ${isRevealed ? "is-revealed" : ""}`}
                onClick={() => {
                  if (isRevealed) {
                    onOpenTarot?.({ card, index, visual });
                    return;
                  }
                  onRevealTarot?.(index);
                }}
                aria-label={`翻开${card}`}
              >
                <span className="tarot-flip-inner">
                  <span className="tarot-card tarot-card-back">
                    <span className="tarot-back-star">✦</span>
                    <span className="tarot-back-title">LINGJING ORACLE</span>
                    <span className="tarot-back-hint">点击翻牌</span>
                  </span>
                  <span className="tarot-card tarot-card-front">
                    {visual.image ? (
                      <span className="tarot-image-wrap">
                        <img src={visual.image} alt={`${card}塔罗牌面`} className="tarot-image" />
                      </span>
                    ) : (
                      <>
                        <span className="tarot-card-foil" />
                        <span className="tarot-card-frame" />
                        <span className="tarot-card-sigil">{visual.symbol}</span>
                      </>
                    )}
                    <span className="relative z-10 flex h-full flex-col justify-between text-center">
                      <span className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-primary/70">
                        <span>{visual.number}</span>
                        <span>{["PAST", "NOW", "FUTURE"][index]}</span>
                      </span>
                      {!visual.image && <TarotFigureArt kind={visual.art} symbol={visual.symbol} />}
                      <span>
                        <span className="text-xs text-primary/70">{["过去", "现在", "未来"][index]}</span>
                        <strong className="mt-1 block text-2xl font-semibold leading-tight text-white">{card}</strong>
                        <span className="mt-2 block text-xs tracking-[0.18em] text-white/44">{visual.subtitle}</span>
                        {visual.image && isRevealed && (
                          <span className="mt-3 inline-flex items-center justify-center gap-1 rounded-full border border-primary/25 bg-black/35 px-3 py-1 text-[11px] text-primary/80">
                            <Maximize2 className="h-3 w-3" />
                            放大查看
                          </span>
                        )}
                      </span>
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {!revealedTarot.some(Boolean) && (
          <div className="rounded-md border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary/80">
            点击牌背翻开塔罗牌。
          </div>
        )}
        {revealedTarot.some(Boolean) && (
          <PosterSummary
            title="塔罗解读"
            eyebrow="THREE CARD SPREAD"
            result={result}
            fields={["past", "present", "future", "overview", "challenge", "action"]}
          />
        )}
      </div>
    );
  }

function TarotFigureArt({ kind, symbol }: { kind: TarotArtKind; symbol: string }) {
  const isStar = kind === "star";
  const isMagician = kind === "magician";
  const isFool = kind === "fool";
  const isDeath = kind === "death";
  const isTower = kind === "tower";
  const isSun = kind === "sun";
  const isMoon = kind === "moon";

  return (
    <svg className="tarot-art" viewBox="0 0 180 220" role="img" aria-label="塔罗人物插画">
      <defs>
        <radialGradient id={`aura-${kind}`} cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.42" />
          <stop offset="62%" stopColor="#7B61FF" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#050507" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`robe-${kind}`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor={isDeath ? "#d6d6d6" : "#D4AF37"} stopOpacity="0.9" />
          <stop offset="1" stopColor={isMagician ? "#7B61FF" : "#131018"} stopOpacity="0.92" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="164" height="204" rx="82" fill={`url(#aura-${kind})`} />
      <path d="M28 178 C54 154 126 154 152 178" stroke="#D4AF37" strokeOpacity="0.34" strokeWidth="2" fill="none" />
      {isTower ? (
        <>
          <path d="M72 58 L120 46 L112 170 L60 170 Z" fill="#111018" stroke="#D4AF37" strokeWidth="2" />
          <path d="M96 24 L78 80 H99 L82 128 L122 64 H100 Z" fill="#D4AF37" />
          <path d="M65 98 H110" stroke="#7B61FF" strokeWidth="2" />
        </>
      ) : (
        <>
          <circle cx="90" cy="58" r="18" fill="#151116" stroke="#D4AF37" strokeWidth="2.5" />
          <path
            d="M58 176 C60 124 70 82 90 82 C110 82 120 124 122 176 Z"
            fill={`url(#robe-${kind})`}
            stroke="#D4AF37"
            strokeOpacity="0.7"
            strokeWidth="2"
          />
          <path d="M72 104 C50 112 42 132 38 156" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
          <path d="M108 104 C130 112 138 132 142 156" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      {isStar && (
        <>
          <path d="M90 22 L98 46 L123 46 L103 61 L110 84 L90 70 L70 84 L77 61 L57 46 L82 46 Z" fill="#D4AF37" />
          <path d="M62 154 C78 142 100 142 118 154" stroke="#7B61FF" strokeWidth="3" fill="none" />
        </>
      )}
      {isMagician && (
        <>
          <path d="M90 22 C112 22 112 45 90 45 C68 45 68 22 90 22 Z" fill="none" stroke="#D4AF37" strokeWidth="3" />
          <path d="M52 88 L82 42" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
          <path d="M128 88 L98 42" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
          <rect x="55" y="156" width="70" height="12" rx="2" fill="#D4AF37" fillOpacity="0.45" />
        </>
      )}
      {isFool && (
        <>
          <path d="M72 118 L40 154" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
          <path d="M108 118 L140 154" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
          <path d="M44 184 H122 L150 204 H28 Z" fill="#D4AF37" fillOpacity="0.2" />
          <circle cx="124" cy="42" r="5" fill="#D4AF37" />
        </>
      )}
      {isDeath && (
        <>
          <path d="M66 54 C78 30 112 30 124 54 C112 46 78 46 66 54 Z" fill="#D4AF37" fillOpacity="0.18" />
          <path d="M46 80 L138 176" stroke="#E8E2D0" strokeWidth="3" strokeLinecap="round" />
          <path d="M125 160 L150 170 L127 180" stroke="#E8E2D0" strokeWidth="3" fill="none" />
        </>
      )}
      {isSun && <circle cx="90" cy="34" r="22" fill="#D4AF37" fillOpacity="0.9" />}
      {isMoon && <path d="M108 24 C82 32 78 66 104 82 C64 76 58 30 108 24 Z" fill="#D4AF37" />}
      {!isStar && !isMagician && !isFool && !isDeath && !isTower && !isSun && !isMoon && (
        <text x="90" y="44" textAnchor="middle" fill="#D4AF37" fontSize="34" fontWeight="700">
          {symbol}
        </text>
      )}
      <path d="M52 190 C70 202 110 202 128 190" stroke="#D4AF37" strokeOpacity="0.4" strokeWidth="2" fill="none" />
    </svg>
  );
}
  if (type === "soul") {
    return (
      <div className="grid gap-4 md:grid-cols-[0.82fr_1.18fr]">
        {"imageUrl" in result && typeof result.imageUrl === "string" && result.imageUrl ? (
          <img
            src={result.imageUrl}
            alt="神秘灵魂海报"
            className="aspect-[2/3] w-full rounded-lg border border-primary/25 object-cover shadow-gold"
          />
        ) : (
          <div className="oracle-poster aspect-[2/3] min-h-[320px]">
            <div className="poster-orbit" />
            <div className="relative z-10 flex h-full flex-col items-center justify-center p-6 text-center">
              <Gem className="mb-5 h-14 w-14 text-primary" />
              <p className="text-xs uppercase tracking-[0.32em] text-primary/70">Soul Poster</p>
              <h3 className="mt-3 text-2xl font-semibold">灵魂海报</h3>
              <p className="mt-4 text-sm leading-6 text-white/55">配置 OPENAI_API_KEY 后会生成真实 1024x1536 海报。</p>
            </div>
          </div>
        )}
        <PosterSummary
          title="灵魂画像"
          eyebrow="SOUL PROFILE"
          result={result}
          fields={["soulAttribute", "soulColor", "guardian", "story", "notice"]}
        />
      </div>
    );
  }

  if (type === "daily") {
    return (
      <PosterSummary
        title="今日星盘"
        eyebrow="DAILY ORACLE"
        result={result}
        fields={["summary", "notice"]}
      />
    );
  }

  const presets: Record<string, { title: string; eyebrow: string; fields: string[]; icon: "brain" | "heart" | "moon" }> = {
    fortune: {
      title: String(result.title || "命运解析"),
      eyebrow: "DESTINY CERTIFICATE",
      fields: ["soulAttribute", "guardianElement", "guardianStar", "lifeKeywords", "advice", "notice"],
      icon: "brain"
    },
    past: {
      title: String(result.era || "前世身份"),
      eyebrow: "PAST LIFE ARCHIVE",
      fields: ["career", "experience", "ending", "inheritedGift", "story", "notice"],
      icon: "moon"
    },
    compatibility: {
      title: `${String(result.score || "--")}% 灵魂契合`,
      eyebrow: "SOUL MATCH",
      fields: ["relation", "strengths", "challenges", "growthAdvice", "notice"],
      icon: "heart"
    }
  };

  const preset = presets[type] || {
    title: "灵境结果",
    eyebrow: "ORACLE RESULT",
    fields: Object.keys(result),
    icon: "brain" as const
  };

  return <PosterSummary title={preset.title} eyebrow={preset.eyebrow} result={result} fields={preset.fields} icon={preset.icon} />;
}

function PosterSummary({
  title,
  eyebrow,
  result,
  fields,
  icon = "brain"
}: {
  title: string;
  eyebrow: string;
  result: Record<string, unknown>;
  fields: string[];
  icon?: "brain" | "heart" | "moon";
}) {
  const Icon = icon === "heart" ? HeartHandshake : icon === "moon" ? MoonStar : BrainCircuit;

  return (
    <div className="oracle-poster p-5">
      <div className="poster-orbit" />
      <div className="relative z-10">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-primary/20 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-primary/70">{eyebrow}</p>
            <h3 className="mt-2 text-2xl font-semibold leading-tight text-white">{title}</h3>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </span>
        </div>
        <div className="grid gap-3">
          {fields
            .filter((field) => result[field] !== undefined && field !== "imageUrl" && field !== "posterPrompt")
            .map((field) => (
              <div key={field} className="rounded-md border border-white/10 bg-black/30 p-3">
                <div className="mb-1 text-xs uppercase text-primary/70">{field}</div>
                <div className="line-clamp-[8] text-sm leading-6 text-white/82">{formatValue(result[field])}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function formatValue(value: unknown) {
  if (Array.isArray(value)) return value.join(" · ");
  if (typeof value === "object" && value) return JSON.stringify(value, null, 2);
  return String(value);
}

function StarsRating({ value }: { value: unknown }) {
  const count = Math.max(1, Math.min(5, Number(value) || 3));
  return (
    <div className="flex gap-1 text-primary">
      {Array.from({ length: 5 }).map((_, index) => (
        <Stars key={index} className={`h-4 w-4 ${index < count ? "fill-primary" : "opacity-25"}`} />
      ))}
    </div>
  );
}

function formatProfileDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN");
}

function TelegramProfilePanel({ profile }: { profile: TelegramProfile | null }) {
  return (
    <Card id="profile">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>我的</CardTitle>
            <CardDescription>Telegram Mini App 用户资料来自 public.telegram_users。</CardDescription>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
            <UserCircle className="h-6 w-6 text-primary" />
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {profile ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.82fr]">
            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileField label="Telegram 用户名" value={`@${profile.username || profile.first_name || "未设置"}`} />
              <ProfileField label="用户 ID" value={String(profile.telegram_user_id)} />
              <ProfileField label="首次进入时间" value={formatProfileDate(profile.created_at)} />
              <ProfileField label="最近使用时间" value={formatProfileDate(profile.updated_at)} />
            </div>
            <div className="rounded-lg border border-white/10 bg-black/24 p-4">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <History className="h-4 w-4" />
                <span className="text-sm">占卜历史</span>
              </div>
              <p className="text-sm leading-6 text-white/58">历史记录入口已预留，后续可接入 readings 与 telegram_users 的关联记录。</p>
              <Button className="mt-4" variant="secondary" disabled>
                即将开放
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-black/24 p-4">
            <p className="text-sm leading-6 text-white/62">从 Telegram Mini App 打开后，这里会显示当前用户的 username 与 telegram_user_id。</p>
            <Button asChild className="mt-4" variant="secondary">
              <a href="/telegram">重新初始化 Telegram 登录</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/30 p-3">
      <div className="mb-1 text-xs uppercase text-primary/70">{label}</div>
      <div className="break-words text-sm leading-6 text-white/82">{value}</div>
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState<string | null>(null);
  const [fortune, setFortune] = useState<ApiState>(null);
  const [tarot, setTarot] = useState<ApiState>(null);
  const [revealedTarot, setRevealedTarot] = useState<boolean[]>([]);
  const [tarotPreview, setTarotPreview] = useState<TarotPreview | null>(null);
  const [soul, setSoul] = useState<ApiState>(null);
  const [past, setPast] = useState<ApiState>(null);
  const [compatibility, setCompatibility] = useState<ApiState>(null);
  const [daily, setDaily] = useState<ApiState>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [telegramProfile, setTelegramProfile] = useState<TelegramProfile | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const telegramUserId = window.localStorage.getItem("telegram_user_id");
    if (!telegramUserId) return;

    fetch(`/api/telegram/me?telegram_user_id=${encodeURIComponent(telegramUserId)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || "无法读取 Telegram 用户");
        }
        setTelegramProfile(payload.user as TelegramProfile);
      })
      .catch(() => {
        setTelegramProfile(null);
      });
  }, []);

  async function run(key: string, action: () => Promise<ApiState>, setter: (value: ApiState) => void) {
    setLoading(key);
    try {
      const result = await action();
      setter(result);
    } finally {
      setLoading(null);
    }
  }

  function readPhoto(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="star-field" />
      <div className="energy-line" />
      <div className="oracle-grid pointer-events-none absolute inset-0 opacity-55" />

      <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/8 bg-black/45 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/35 bg-primary/10">
              <WandSparkles className="h-5 w-5 text-primary" />
            </span>
            <span className="font-semibold">灵境 Oracle</span>
          </a>
          <nav className="hidden items-center gap-1 lg:flex">
            {featureNav.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="rounded-md px-3 py-2 text-sm text-white/60 transition hover:bg-white/8 hover:text-white">
                {item.label}
              </a>
            ))}
            <a href="/admin" className="rounded-md px-3 py-2 text-sm text-primary/75 transition hover:bg-primary/10 hover:text-primary">
              后台
            </a>
            <a href="#profile" className="rounded-md px-3 py-2 text-sm text-white/60 transition hover:bg-white/8 hover:text-white">
              我的
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {telegramProfile && (
              <a href="#profile" className="hidden rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary/90 sm:block">
                @{telegramProfile.username || telegramProfile.first_name || "Telegram"} · {telegramProfile.telegram_user_id}
              </a>
            )}
            <Button asChild size="sm">
              <a href="#fortune">开始</a>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative flex min-h-screen items-center pb-20 pt-24">
        <div className="container grid gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              赛博玄学大师 · AI塔罗 · 灵魂画像
            </div>
            <h1 className="font-display text-6xl font-semibold leading-[0.96] tracking-normal text-white md:text-8xl">
              灵境 Oracle
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-white/68 md:text-2xl">探索命运深处的答案</p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/52">{entertainmentNotice}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#fortune">
                  开始占卜
                  <ArrowDown className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="#tarot">进入塔罗</a>
              </Button>
              <Button asChild size="lg" variant="violet">
                <a href="#soul">生成灵魂画像</a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.8 }}
            className="relative mx-auto aspect-square w-full max-w-[520px]"
          >
            <div className="absolute inset-0 rounded-full border border-primary/20 shadow-gold" />
            <div className="absolute inset-[9%] rounded-full border border-accent/22 shadow-violet" />
            <div className="absolute inset-[20%] rounded-full border border-primary/30" />
            <div className="absolute left-1/2 top-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-primary/28 bg-black/22 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-40 w-40 items-center justify-center rounded-full border border-primary/35 bg-[#090908] shadow-gold">
                <Sparkles className="h-16 w-16 text-primary" />
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 w-[82%] -translate-x-1/2 rounded-lg border border-white/10 bg-black/54 p-4 text-center text-sm text-white/70 backdrop-blur-xl">
              AI以象征、叙事与视觉生成回应你的问题
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative border-y border-white/8 bg-black/28 py-8">
        <div className="container grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {featureNav.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="glass-panel flex items-center gap-3 rounded-lg px-4 py-4 text-sm text-white/74 transition hover:border-primary/35 hover:text-white"
              >
                <Icon className="h-5 w-5 text-primary" />
                {item.label}
              </a>
            );
          })}
        </div>
      </section>

      <section className="container pt-12">
        <TelegramProfilePanel profile={telegramProfile} />
      </section>

      <section className="container grid gap-6 py-20 lg:grid-cols-2">
        <Card id="fortune">
          <CardHeader>
            <CardTitle>AI命运解析</CardTitle>
            <CardDescription>输入姓名与生日，生成命运称号、灵魂属性、守护元素与神秘忠告。</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                run("fortune", () => postOracle("/api/fortune", Object.fromEntries(form)), setFortune);
              }}
            >
              <Input name="name" placeholder="姓名" />
              <Input name="birthday" type="date" />
              <Button disabled={loading === "fortune"}>
                {loading === "fortune" && <Loader2 className="h-4 w-4 animate-spin" />}
                生成命运解析
              </Button>
            </form>
            <div className="mt-5">
              <VisualResult type="fortune" result={fortune} />
            </div>
          </CardContent>
        </Card>

        <Card id="tarot">
          <CardHeader>
            <CardTitle>AI塔罗</CardTitle>
            <CardDescription>随机抽取三张牌，生成过去、现在、未来与行动建议。</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                run("tarot", () => postOracle("/api/tarot", Object.fromEntries(form)), (value) => {
                  setTarot(value);
                  setRevealedTarot([false, false, false]);
                  setTarotPreview(null);
                });
              }}
            >
              <Textarea name="question" placeholder="写下你想询问的主题" />
              <Button disabled={loading === "tarot"} variant="violet">
                {loading === "tarot" && <Loader2 className="h-4 w-4 animate-spin" />}
                抽三张牌
              </Button>
            </form>
            <div className="mt-5">
              <VisualResult
                type="tarot"
                result={tarot}
                revealedTarot={revealedTarot}
                onRevealTarot={(index) =>
                  setRevealedTarot((current) => current.map((value, currentIndex) => (currentIndex === index ? true : value)))
                }
                onOpenTarot={setTarotPreview}
              />
            </div>
          </CardContent>
        </Card>

        <Card id="soul">
          <CardHeader>
            <CardTitle>灵魂画像</CardTitle>
            <CardDescription>上传照片后生成灵魂属性、灵魂颜色、守护者与神秘灵魂海报。</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                run("soul", () => postOracle("/api/soul-portrait", { ...Object.fromEntries(form), photo: photoPreview }), setSoul);
              }}
            >
              <Input name="name" placeholder="姓名" />
              <Input type="file" accept="image/*" onChange={(event) => readPhoto(event.target.files?.[0])} />
              {photoPreview && <img src={photoPreview} alt="上传预览" className="h-36 w-28 rounded-lg border border-white/10 object-cover" />}
              <Button disabled={loading === "soul"}>
                {loading === "soul" && <Loader2 className="h-4 w-4 animate-spin" />}
                生成灵魂画像
              </Button>
            </form>
            <div className="mt-5">
              <VisualResult type="soul" result={soul} />
            </div>
          </CardContent>
        </Card>

        <Card id="past">
          <CardHeader>
            <CardTitle>前世身份</CardTitle>
            <CardDescription>随机生成时代、职业、经历、结局与遗留天赋，故事不少于500字。</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                run("past", () => postOracle("/api/past-life", Object.fromEntries(form)), setPast);
              }}
            >
              <Input name="name" placeholder="姓名" />
              <Button disabled={loading === "past"} variant="secondary">
                {loading === "past" && <Loader2 className="h-4 w-4 animate-spin" />}
                开启前世档案
              </Button>
            </form>
            <div className="mt-5">
              <VisualResult type="past" result={past} />
            </div>
          </CardContent>
        </Card>

        <Card id="compatibility">
          <CardHeader>
            <CardTitle>双人灵魂契合度</CardTitle>
            <CardDescription>输入两个人的姓名，生成契合度、灵魂关系、优势、挑战与成长建议。</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                run("compatibility", () => postOracle("/api/compatibility", Object.fromEntries(form)), setCompatibility);
              }}
            >
              <Input name="aName" placeholder="A姓名" />
              <Input name="bName" placeholder="B姓名" />
              <Button disabled={loading === "compatibility"}>
                {loading === "compatibility" && <Loader2 className="h-4 w-4 animate-spin" />}
                计算契合度
              </Button>
            </form>
            <div className="mt-5">
              <VisualResult type="compatibility" result={compatibility} />
            </div>
          </CardContent>
        </Card>

        <Card id="daily">
          <CardHeader>
            <CardTitle>今日运势</CardTitle>
            <CardDescription>爱情、事业、财富、学习、社交、健康习惯，以星级形式展示。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              disabled={loading === "daily"}
              variant="violet"
              onClick={() => run("daily", () => postOracle("/api/daily", {}), setDaily)}
            >
              {loading === "daily" && <Loader2 className="h-4 w-4 animate-spin" />}
              生成今日运势
            </Button>
            <div className="mt-5 space-y-3">
              {daily ? (
                <>
                  {[
                    ["爱情", daily.love],
                    ["事业", daily.career],
                    ["财富", daily.wealth],
                    ["学习", daily.study],
                    ["社交", daily.social],
                    ["健康习惯", daily.healthHabits]
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex items-center justify-between rounded-md border border-white/10 bg-black/24 p-3">
                      <span className="text-sm text-white/72">{label as string}</span>
                      <StarsRating value={value} />
                    </div>
                  ))}
                  <VisualResult type="daily" result={{ summary: daily.summary, notice: daily.notice }} />
                </>
              ) : (
                <VisualResult type="daily" result={null} />
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="container py-10 text-sm text-white/45">
        <div className="flex flex-col gap-3 border-t border-white/8 pt-6 md:flex-row md:items-center md:justify-between">
          <span>© 2026 灵境 Oracle</span>
          <span>{entertainmentNotice} 禁止医疗、死亡、投资、法律等现实预测或建议。</span>
        </div>
      </footer>

      {tarotPreview?.visual.image && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-4 backdrop-blur-xl" onClick={() => setTarotPreview(null)}>
          <div className="relative max-h-[92vh] w-full max-w-[560px]" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white transition hover:border-primary/50 hover:text-primary"
              onClick={() => setTarotPreview(null)}
              aria-label="关闭塔罗牌放大预览"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="tarot-zoom-card">
              <img src={tarotPreview.visual.image} alt={`${tarotPreview.card}放大牌面`} className="h-full w-full object-cover" />
              <div className="tarot-zoom-overlay">
                <div className="flex items-center justify-between text-primary/80">
                  <span className="text-2xl font-semibold">{tarotPreview.visual.number}</span>
                  <span className="text-xl tracking-[0.26em]">{["PAST", "NOW", "FUTURE"][tarotPreview.index]}</span>
                </div>
                <div className="text-center">
                  <p className="text-sm text-primary/80">{["过去", "现在", "未来"][tarotPreview.index]}</p>
                  <h3 className="mt-2 text-5xl font-semibold tracking-normal text-white drop-shadow-[0_0_18px_rgba(212,175,55,0.38)]">
                    {tarotPreview.card}
                  </h3>
                  <p className="mt-4 text-xl text-white/78">{tarotPreview.visual.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
