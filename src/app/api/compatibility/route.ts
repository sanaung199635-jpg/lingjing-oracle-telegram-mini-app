import { NextResponse } from "next/server";
import { generateJson, safetySystemPrompt } from "@/lib/openai";
import { entertainmentNotice } from "@/lib/utils";
import { assertReadingAllowed, saveCompatibility } from "@/lib/usage";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    score: { type: "number" },
    relation: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    challenges: { type: "array", items: { type: "string" } },
    growthAdvice: { type: "string" },
    notice: { type: "string" }
  },
  required: ["score", "relation", "strengths", "challenges", "growthAdvice", "notice"]
};

export async function POST(request: Request) {
  const gate = await assertReadingAllowed();
  if (!gate.allowed) {
    return NextResponse.json({ error: "当前请求暂时不可用，请稍后再试。" }, { status: 429 });
  }

  const body = await request.json();
  const aName = String(body.aName || "A");
  const bName = String(body.bName || "B");
  const seed = [...aName, ...bName].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const score = 62 + (seed % 34);

  const fallback = {
    score,
    relation: "镜像型同行者",
    strengths: ["能激发彼此表达真实感受", "在目标明确时协作效率很高", "对审美与仪式感有共同感知"],
    challenges: ["都可能在压力下沉默", "需要避免把猜测当作事实"],
    growthAdvice: "把重要需求说具体，把浪漫留给行动后的余韵。",
    notice: entertainmentNotice
  };

  const result = await generateJson({
    system: safetySystemPrompt,
    user: `分析双人灵魂契合度。A姓名：${aName}。B姓名：${bName}。输出契合度百分比、灵魂关系、优势、挑战、共同成长建议。`,
    schema,
    fallback
  });

  const payload = { ...result, score: Math.min(99, Math.max(1, Math.round(result.score || score))) };
  await saveCompatibility(payload);
  return NextResponse.json(payload);
}
