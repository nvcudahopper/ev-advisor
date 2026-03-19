import type { Express } from "express";
import { createServer, type Server } from "http";
import { surveySchema } from "../shared/schema.js";
import { evaluate } from "./decisionEngine";
import { carDatabase } from "./carData";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // 决策评估接口
  app.post("/api/eval", (req, res) => {
    const parsed = surveySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "问卷数据格式有误",
        details: parsed.error.flatten(),
      });
    }
    const result = evaluate(parsed.data);
    return res.json(result);
  });

  // 获取所有车型数据（便于前端展示/调试）
  app.get("/api/cars", (_req, res) => {
    return res.json(carDatabase);
  });

  return httpServer;
}
