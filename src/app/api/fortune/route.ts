import { NextResponse } from "next/server";
import { generateJson, safetySystemPrompt } from "@/lib/openai";
import { entertainmentNotice } from "@/lib/utils";
import { assertReadingAllowed, saveReading } from "@/lib/usage";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    soulAttribute: { type: "string" },
    guardianElement: { type: "string" },
    guardianStar: { type: "string" },
    lifeKeywords: { type: "array", items: { type: "string" } },
    advice: { type: "string" },
    notice: { type: "string" }
  },
  required: ["title", "soulAttribute", "guardianElement", "guardianStar", "lifeKeywords", "advice", "notice"]
};

export async function POST(request: Request) {
  const gate = await assertReadingAllowed();
  if (!gate.allowed) {
    return NextResponse.json({ error: "免费用户每日最多3次占卜，请升级VIP。" }, { status: 429 });
  }

  const body = await request.json();
  const name = String(body.name || "匿名旅人");
  const birthday = String(body.birthday || "未知生日");

  const fallback = {
    title: "星轨之间的解码者",
    soulAttribute: "直觉敏锐，外冷内热，适合在混沌中提炼秩序。",
    guardianElement: "暗金之火",
    guardianStar: "天狼星",
    lifeKeywords: ["觉察", "重启", "边界", "创造"],
    advice: "把焦虑交给行动，把答案留给时间。近期适合收束分散的承诺。",
    notice: entertainmentNotice
  };

  const result = await generateJson({
    system: safetySystemPrompt,
    user: `为用户生成 AI命运解析。姓名：${name}。生日：${birthday}。输出包含命运称号、灵魂属性、守护元素、守护星、人生关键词、神秘忠告。`,
    schema,
    fallback
  });

  await saveReading("fortune", result);
  return NextResponse.json(result);
}
