import OpenAI from "openai";
import { safeJsonParse } from "@/lib/utils";

const textModel = process.env.OPENAI_TEXT_MODEL || "gpt-5";
const imageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function generateJson<T>({
  system,
  user,
  schema,
  fallback
}: {
  system: string;
  user: string;
  schema: Record<string, unknown>;
  fallback: T;
}): Promise<T> {
  const client = getClient();
  if (!client) {
    return fallback;
  }

  const responsePayload = {
    model: textModel,
    input: [
      {
        role: "developer",
        content: [{ type: "input_text", text: system }]
      },
      {
        role: "user",
        content: [{ type: "input_text", text: user }]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "oracle_result",
        strict: true,
        schema
      }
    }
  } as unknown as Parameters<typeof client.responses.create>[0];

  const response = (await client.responses.create(responsePayload)) as { output_text?: string };

  return safeJsonParse<T>(response.output_text ?? "", fallback);
}

export async function generateSoulPoster(prompt: string) {
  const client = getClient();
  if (!client) {
    return null;
  }

  const imagePayload = {
    model: imageModel,
    prompt,
    size: "1024x1536",
    quality: "high",
    response_format: "b64_json"
  } as unknown as Parameters<typeof client.images.generate>[0];

  const image = (await client.images.generate(imagePayload)) as { data?: { b64_json?: string }[] };

  const data = image.data?.[0]?.b64_json;
  return data ? `data:image/png;base64,${data}` : null;
}

export const safetySystemPrompt = `
你是“灵境 Oracle”的娱乐型 AI 玄学叙事引擎。
必须遵守：
1. 所有输出都明确保持娱乐、自我探索、文学化表达。
2. 禁止医疗预测、疾病判断、死亡预测、投资建议、法律建议。
3. 不声称真实预测未来，不制造恐惧、依赖或绝对化判断。
4. 中文输出，语气高端、神秘、克制、电影感。
`;
