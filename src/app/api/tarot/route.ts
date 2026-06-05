import { NextResponse } from "next/server";
import { generateJson, safetySystemPrompt } from "@/lib/openai";
import { drawTarotCards } from "@/lib/tarot";
import { entertainmentNotice } from "@/lib/utils";
import { assertReadingAllowed, saveReading } from "@/lib/usage";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    cards: { type: "array", items: { type: "string" } },
    past: { type: "string" },
    present: { type: "string" },
    future: { type: "string" },
    overview: { type: "string" },
    challenge: { type: "string" },
    action: { type: "string" },
    notice: { type: "string" }
  },
  required: ["cards", "past", "present", "future", "overview", "challenge", "action", "notice"]
};

export async function POST(request: Request) {
  const gate = await assertReadingAllowed();
  if (!gate.allowed) {
    return NextResponse.json({ error: "当前请求暂时不可用，请稍后再试。" }, { status: 429 });
  }

  const body = await request.json();
  const question = String(body.question || "我近期需要看见什么答案？");
  const cards = drawTarotCards(3);

  const fallback = {
    cards,
    past: `${cards[0]}提示你曾经在未知里练习信任。`,
    present: `${cards[1]}显示当下需要把直觉落到具体选择。`,
    future: `${cards[2]}象征新的秩序正在形成。`,
    overview: "过去、现在与未来正在把你推向一次更清醒的自我确认。",
    challenge: "不要把短暂的情绪误认为最终答案。",
    action: "选一个最小行动，在48小时内完成它。",
    notice: entertainmentNotice
  };

  const result = await generateJson({
    system: safetySystemPrompt,
    user: `用户问题：${question}。三张牌：${cards.join("、")}。请生成过去、现在、未来、综合解读、近期挑战、行动建议。`,
    schema,
    fallback
  });

  const payload = { ...result, cards };
  await saveReading("tarot", payload);
  return NextResponse.json(payload);
}
