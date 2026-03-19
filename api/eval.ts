/**
 * Vercel Serverless Function — POST /api/eval
 * 接收用户问卷 JSON，返回决策结果
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { surveySchema } from "../shared/schema.js";
import { evaluate } from "../server/decisionEngine.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = surveySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "问卷数据格式有误",
      details: parsed.error.flatten(),
    });
  }

  const result = evaluate(parsed.data);
  return res.status(200).json(result);
}
