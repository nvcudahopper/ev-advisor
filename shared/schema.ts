import { z } from "zod";

// ==================== 用户问卷 Schema ====================

export const surveySchema = z.object({
  // 所在城市（限行政策）
  city: z.enum(["beijing", "shanghai", "shenzhen", "guangzhou", "hangzhou", "chengdu", "other"]),

  // 使用场景
  usageScenarios: z.array(z.enum(["city_commute", "highway_business", "family_trip"])).min(1),
  annualMileage: z.enum(["lt10k", "10k_20k", "20k_30k", "gt30k"]),
  hasHomeCharger: z.boolean(),
  longTripFrequency: z.enum(["rarely", "monthly", "weekly"]),

  // 家庭与空间
  familySize: z.number().min(1).max(10),
  oftenFullLoad: z.boolean(),
  needLargeTrunk: z.boolean(),

  // 停车相关
  parkingDifficulty: z.enum(["easy", "moderate", "tight"]),
  preferCompactSize: z.boolean(),

  // 智驾需求（细化）
  adsPriority: z.enum(["must_have", "nice_to_have", "dont_care"]),
  adsUseCases: z.array(z.enum(["highway_noa", "city_noa", "memory_parking", "auto_park", "summon"])),
  adsCostTolerance: z.enum(["free_only", "pay_upfront_ok", "subscribe_ok", "any"]),

  // 配置偏好
  configMustHaves: z.array(z.string()),

  // 补能偏好
  acceptPureBev: z.boolean(),
  preferErev: z.boolean(),
  acceptBatterySwap: z.boolean(),
  chargingPreference: z.enum(["slow_home", "fast_public", "ultra_fast", "battery_swap"]),

  // 驾驶风格
  driveStyle: z.enum(["comfort", "sporty", "balanced"]),
  nvrImportance: z.number().min(1).max(5),

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

  // 车身尺寸
  bodyLength: number;      // 车长 mm
  bodyWidth: number;       // 车宽 mm
  bodyHeight: number;      // 车高 mm
  wheelbase: number;       // 轴距 mm

  // 牌照政策
  platePolicy: {
    beijing: "green_plate" | "restricted";
    shanghai: "free_green" | "bid_plate";
    shenzhen: "green_plate" | "restricted";
    guangzhou: "green_plate" | "restricted";
    hangzhou: "green_plate" | "restricted";
    chengdu: "green_plate" | "restricted";
  };

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

  // === 智驾费用相关 ===
  adsLevel: "L2" | "L2+" | "L2++" | "L3_highway";
  adsCostMode: "free" | "upfront" | "subscribe" | "both";
  adsCostUpfront?: number;   // 买断价格（万元），free则为0
  adsCostMonthly?: number;   // 月订阅价格（元/月）
  adsCostYearly?: number;    // 年订阅价格（元/年）
  adsIncludedYears?: number; // 免费包含年数
  adsPlatform: string;       // 如 "FSD V13" "ADS 3.0" "XNGP/VLA" "AD Max" "HAD" "天神之眼"
  autoSummon: boolean;       // 召唤功能
  autoPark: number;          // 自动泊车评分 0-10

  // === 细节配置 ===
  hasFrunk: boolean;
  frunkVolume?: number;        // 前备箱容积（L）
  hasRearScreen: boolean;
  hasRearSunshade: boolean;
  hasAirSuspension: boolean;
  hasVentilatedSeats: "none" | "front" | "front_rear";
  hasHeatedSeats: "none" | "front" | "front_rear";
  hasMassageSeats: "none" | "front" | "front_rear";
  hasHud: boolean;
  hasPhysicalButtons: boolean;
  hasWirelessCharge: boolean;
  hasElectricTailgate: boolean;
  hasV2L: boolean;
  audioBrand: string;
  hasFramelessDoor: boolean;
  hasPowerDoor: boolean;
  has360Camera: boolean;
  hasDigitalKey: boolean;

  // === 补能细化 ===
  maxChargePower: number;      // 最大充电功率kW
  charge10to80min: number;     // 10-80%快充时间（分钟）
  hasHomeChargerIncluded: boolean;

  // === NVH与驾驶感受 ===
  nvhScore: number;            // NVH综合评分 0-10
  sportinessScore: number;     // 运动性评分 0-10
  zeroto100: number;           // 百公里加速（秒）
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
