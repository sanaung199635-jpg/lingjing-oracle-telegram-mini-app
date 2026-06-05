import { NextResponse } from "next/server";
import { generateJson, safetySystemPrompt } from "@/lib/openai";
import { entertainmentNotice } from "@/lib/utils";
import { assertReadingAllowed, saveReading } from "@/lib/usage";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    love: { type: "number" },
    career: { type: "number" },
    wealth: { type: "number" },
    study: { type: "number" },
    social: { type: "number" },
    healthHabits: { type: "number" },
    summary: { type: "string" },
    notice: { type: "string" }
  },
  required: ["love", "career", "wealth", "study", "social", "healthHabits", "summary", "notice"]
};

export async function POST() {
  const gate = await assertReadingAllowed();
  if (!gate.allowed) {
    return NextResponse.json({ error: "当前请求暂时不可用，请稍后再试。" }, { status: 429 });
  }

  const fallback = {
    love: 4,
    career: 5,
    wealth: 3,
    study: 4,
    social: 4,
    healthHabits: 3,
    summary: "今天适合做一次清晰整理：把任务缩短，把沟通说透，把节奏放稳。",
    notice: entertainmentNotice
  };

  const result = await generateJson({
    system: safetySystemPrompt,
    user: "生成今日运势。维度：爱情、事业、财富、学习、社交、健康习惯。每项1到5星，并给一句总结。",
    schema,
    fallback
  });

  await saveReading("daily", result);
  return NextResponse.json(result);
}
