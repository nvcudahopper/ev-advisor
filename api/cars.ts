/**
 * Vercel Serverless Function — GET /api/cars
 * 返回所有车型数据
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { carDatabase } from "../server/carData";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json(carDatabase);
}
