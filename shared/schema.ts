import { z } from "zod";

// ==================== 用户问卷 Schema ====================

export const surveySchema = z.object({
  // 使用场景
  usageScenarios: z.array(z.enum(["city_commute", "highway_business", "family_trip"])).min(1),
  annualMileage: z.enum(["lt10k", "10k_20k", "20k_30k", "gt30k"]),

  // 家庭与空间
  familySize: z.number().min(1).max(10),
  oftenFullLoad: z.boolean(),
  needLargeTrunk: z.boolean(),

  // 智驾 & 车机偏好 (1-5)
  smartDrivingImportance: z.number().min(1).max(5),
  infotainmentImportance: z.number().min(1).max(5),

  // 补能偏好
  acceptPureBev: z.boolean(),
  preferErev: z.boolean(),
  acceptBatterySwap: z.boolean(),

  // 品牌态度
  domesticBrandAcceptance: z.number().min(1).max(5),
  preferGlobalBrand: z.boolean(),

  // 资金与风险偏好
  maxDownPayment: z.number().min(0),
  debtAversion: z.number().min(1).max(5),
  hasInvestmentChannel: z.boolean(),
  expectedInvestmentReturn: z.number().min(0).max(100),

  // 换车周期偏好
  replacementCycle: z.enum(["2_3_years", "3_5_years", "as_long_as_possible"]),
});

export type Survey = z.infer<typeof surveySchema>;

// ==================== 车型数据结构 ====================

export interface CarModel {
  id: string;
  brand: string;
  model: string;
  priceRange: [number, number]; // 万元
  bodyType: "suv" | "sedan";
  powerType: "bev" | "erev"; // 纯电 / 增程
  canSwapBattery: boolean;

  // 续航
  cltcRange: number; // km
  realWorldRange: number; // km

  // 补能
  supportsFastCharge: boolean;
  supportsUltraCharge: boolean;
  swapNetworkMaturity: number; // 0-10

  // 智驾能力 (0-10)
  highwayNoa: number;
  cityNoa: number;
  memoryParking: number;

  // 车机/生态 (0-10)
  infotainmentScore: number;
  ecosystem: string;

  // 舒适与空间 (0-10)
  seatComfort: number;
  soundInsulation: number;
  suspensionScore: number;
  rearSpace: number;

  // 品牌与服务
  brandPremium: number; // 0-10
  serviceNetwork: number; // 0-10
  afterSalesScore: number; // 0-10

  // 保值率预估
  resaleRate1Year: number; // e.g. 0.80
  resaleRate3Year: number;
  resaleRate5Year: number;

  // 特殊模式
  special?: {
    batteryRentalMonthly?: [number, number]; // 月租区间
    swapCoverage?: number; // 换电站覆盖度 0-10
    erevAdvantage?: string;
    futureBevPlan?: boolean;
    huaweiSmartDriving?: boolean;
  };

  // 标签 (用于决策描述)
  highlights: string[];
  risks: string[];
}

// ==================== 决策结果结构 ====================

export interface CarRecommendation {
  car: CarModel;
  score: number; // 0-100
  topAdvantages: string[];
  topRisks: string[];
}

export interface PurchaseMethod {
  method: "full_payment" | "installment" | "certified_used" | "lease";
  label: string;
  totalCost3Year: number; // 万元
  monthlyCost: number; // 万元
  advantage: string;
  disadvantage: string;
  recommendation: number; // 1-5 stars
}

export interface ExitStrategy {
  holdingPeriodMonths: [number, number];
  estimatedResidualValue: [number, number]; // 万元
  monthlyDepreciation: number; // 万元
  explanation: string;
}

export interface DecisionResult {
  topCars: CarRecommendation[];
  purchaseMethods: PurchaseMethod[];
  exitStrategy: ExitStrategy;
  selectedCarForFinance: CarModel;
}

// Dummy user types to keep template happy
export interface User {
  id: string;
  username: string;
  password: string;
}

export interface InsertUser {
  username: string;
  password: string;
}
