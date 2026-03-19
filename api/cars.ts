/**
 * Vercel Serverless Function — GET /api/cars
 * 返回所有车型数据
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { carDatabase } from "../server/carData";

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    return res.status(200).json(carDatabase);
  } catch (err: any) {
    return res.status(500).json({
      error: "Internal error",
      message: err?.message || String(err),
      stack: err?.stack,
    });
  }
}
