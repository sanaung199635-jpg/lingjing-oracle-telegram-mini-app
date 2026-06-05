import { NextResponse } from "next/server";
import { generateJson, safetySystemPrompt } from "@/lib/openai";
import { entertainmentNotice } from "@/lib/utils";
import { assertReadingAllowed, saveReading } from "@/lib/usage";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    era: { type: "string" },
    career: { type: "string" },
    experience: { type: "string" },
    ending: { type: "string" },
    inheritedGift: { type: "string" },
    story: { type: "string" },
    notice: { type: "string" }
  },
  required: ["era", "career", "experience", "ending", "inheritedGift", "story", "notice"]
};

export async function POST(request: Request) {
  const gate = await assertReadingAllowed();
  if (!gate.allowed) {
    return NextResponse.json({ error: "当前请求暂时不可用，请稍后再试。" }, { status: 429 });
  }

  const body = await request.json();
  const name = String(body.name || "匿名旅人");

  const fallback = {
    era: "失落的海上黄金时代",
    career: "星象航海师",
    experience: "你曾用星图为船队寻找风暴间隙，也因此学会在压力下保持冷静。",
    ending: "最后一次远航后，你把全部航线刻进黄铜星盘，留给后来的人。",
    inheritedGift: "方向感、危机直觉、对复杂系统的理解力",
    story:
      "在那一世，你生活在海雾与铜灯交织的年代。港口每天都有商船抵达，带来香料、黑曜石、陌生语言和没有写进地图的传闻。你并不是船长，却常常决定船队能否活着穿过风暴。年轻时，你在天文塔做学徒，整夜记录星辰的位置，直到能从云层的缝隙里读出风向。后来，一场漫长的战争改变了海路，很多人选择停航，而你带着一只旧罗盘加入远行船队。你见过海面像镜子一样安静，也见过天空在一夜之间裂成紫色。最危险的一次航行中，所有人都相信前方只有沉没，你却在浪声里听见潮汐的节奏，带领船队绕过暗礁。那之后，人们称你为“夜潮的译者”。你的结局并不悲壮，而是安静：你在老去前回到天文塔，把一生的路线刻进黄铜星盘。今生遗留下来的天赋，是在混乱里辨认方向，是不急着相信表象，是当别人慌乱时仍能找到下一步。这不是现实预测，只是一面文学化的镜子，提醒你把直觉与经验一起使用。",
    notice: entertainmentNotice
  };

  const result = await generateJson({
    system: safetySystemPrompt,
    user: `为${name}随机生成前世身份分析。必须包含时代、职业、经历、结局、遗留天赋。故事不少于500字。`,
    schema,
    fallback
  });

  await saveReading("past_life", result);
  return NextResponse.json(result);
}
