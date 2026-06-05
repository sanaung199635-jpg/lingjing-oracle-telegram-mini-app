import { NextResponse } from "next/server";
import { generateJson, generateSoulPoster, safetySystemPrompt } from "@/lib/openai";
import { entertainmentNotice } from "@/lib/utils";
import { assertReadingAllowed, saveSoulPortrait } from "@/lib/usage";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    soulAttribute: { type: "string" },
    soulColor: { type: "string" },
    guardian: { type: "string" },
    story: { type: "string" },
    posterPrompt: { type: "string" },
    notice: { type: "string" }
  },
  required: ["soulAttribute", "soulColor", "guardian", "story", "posterPrompt", "notice"]
};

export async function POST(request: Request) {
  const gate = await assertReadingAllowed();
  if (!gate.allowed) {
    return NextResponse.json({ error: "当前请求暂时不可用，请稍后再试。" }, { status: 429 });
  }

  const body = await request.json();
  const name = String(body.name || "灵魂旅人");
  const hasPhoto = Boolean(body.photo);

  const fallback = {
    soulAttribute: "夜航者：擅长在不确定中捕捉微弱信号。",
    soulColor: "曜石黑与古金色",
    guardian: "持星盘的镜面守护者",
    story: "你的灵魂像一座夜里的观测站，外表安静，内部却有持续运转的星图。你会被深度、秩序与隐秘的美吸引，也常在别人尚未说出口之前感知到情绪的转向。近期适合把灵感整理成作品，而不是只停留在想象里。",
    posterPrompt:
      "A mysterious epic cinematic soul portrait poster, obsidian black and antique gold, cyber mystical oracle, high detail, dramatic lighting, celestial geometry, portrait composition, no text",
    notice: entertainmentNotice
  };

  const analysis = await generateJson({
    system: safetySystemPrompt,
    user: `为${name}生成灵魂画像分析。用户${hasPhoto ? "已上传照片，可用更具象但不要识别身份的描述" : "未上传照片"}。输出灵魂属性、灵魂颜色、灵魂守护者、灵魂故事，并给出英文图像生成提示词。`,
    schema,
    fallback
  });

  const imageUrl = await generateSoulPoster(`${analysis.posterPrompt}. Size 1024x1536. Mystical, epic, cinematic, high detail.`);

  const payload = { ...analysis, imageUrl };
  await saveSoulPortrait(payload);
  return NextResponse.json(payload);
}
