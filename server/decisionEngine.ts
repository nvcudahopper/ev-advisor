/**
 * 决策引擎
 * ===========================================
 * 核心算法：车型适配打分 + 资金策略模型 + 退出时点模型
 *
 * 可调参数全部集中在本文件顶部的 CONFIG 对象中，便于修改。
 */

import type {
  Survey,
  CarModel,
  CarRecommendation,
  PurchaseMethod,
  ExitStrategy,
  DecisionResult,
} from "../shared/schema";
import { carDatabase } from "./carData";

// ==================== 可配置参数 ====================
const CONFIG = {
  // 购置税率 (新能源免征，但保留字段以备调整)
  purchaseTaxRate: 0,
  // 保险费率 (占车价比例, 第一年)
  insuranceRate1st: 0.06,
  // 后续年保险费率
  insuranceRateSubsequent: 0.045,
  // 手续费 (上牌等)
  registrationFee: 0.5, // 万元
  // 分期年化利率
  installmentRate: 0.038,
  // 分期期数 (月)
  installmentMonths: 36,
  // 分期首付比例
  installmentDownPaymentRatio: 0.3,
  // 金融服务费 (万元)
  financeServiceFee: 0.3,
  // 二手车折扣 (1年车)
  usedCar1YearDiscount: 0.85,
  // 二手车折扣 (3年车)
  usedCar3YearDiscount: 0.70,
  // 二手车持有期 (月)
  usedCarHoldMonths: 24,
  // 长租月租金系数 (占车价比例)
  leaseMonthlyRatio: 0.015,
  // 长租月数
  leaseMonths: 36,
};

// ==================== configMustHave 到 CarModel 字段映射 ====================

function carHasConfig(car: CarModel, config: string): boolean {
  switch (config) {
    case "frunk": return car.hasFrunk;
    case "rear_screen": return car.hasRearScreen;
    case "rear_sunshade": return car.hasRearSunshade;
    case "air_suspension": return car.hasAirSuspension;
    case "ventilated_seats": return car.hasVentilatedSeats !== "none";
    case "heated_seats": return car.hasHeatedSeats !== "none";
    case "massage_seats": return car.hasMassageSeats !== "none";
    case "hud": return car.hasHud;
    case "physical_buttons": return car.hasPhysicalButtons;
    case "wireless_charge": return car.hasWirelessCharge;
    case "electric_tailgate": return car.hasElectricTailgate;
    case "v2l": return car.hasV2L;
    case "audio_premium": return !["自研", ""].includes(car.audioBrand);
    case "frameless_door": return car.hasFramelessDoor;
    case "power_door": return car.hasPowerDoor;
    case "dash_cam_360": return car.has360Camera;
    case "nfc_key": return car.hasDigitalKey;
    default: return false;
  }
}

// ==================== 1. 车型适配打分 ====================

function computeWeights(survey: Survey) {
  const w = {
    range: 0.08,
    powerType: 0.12,
    space: 0.08,
    comfort: 0.08,
    smartDriving: 0.08,
    infotainment: 0.04,
    brandPremium: 0.08,
    service: 0.04,
    resaleRate: 0.08,
    price: 0.12,
    adsCost: 0.06,
    configMatch: 0.06,
    charging: 0.04,
    driveStyle: 0.04,
    nvh: 0.04,
  };

  // 根据场景和里程调权重
  if (survey.usageScenarios.includes("highway_business")) {
    w.range += 0.05;
    w.comfort += 0.05;
    w.space -= 0.03;
    w.nvh += 0.02;
  }
  if (survey.usageScenarios.includes("family_trip")) {
    w.space += 0.05;
    w.range += 0.03;
    w.smartDriving -= 0.02;
    w.configMatch += 0.02;
  }
  if (survey.usageScenarios.includes("city_commute")) {
    w.smartDriving += 0.03;
    w.range -= 0.02;
    w.charging += 0.02;
  }

  // 根据智驾优先级调权重
  if (survey.adsPriority === "must_have") {
    w.smartDriving += 0.08;
    w.adsCost += 0.04;
  } else if (survey.adsPriority === "nice_to_have") {
    w.smartDriving += 0.03;
    w.adsCost += 0.02;
  } else {
    // dont_care: 减少智驾权重
    w.smartDriving -= 0.04;
    w.adsCost -= 0.03;
    w.comfort += 0.03;
  }

  // 根据智驾费用容忍度调权重
  if (survey.adsCostTolerance === "free_only") {
    w.adsCost += 0.04;
  }

  // 配置偏好：勾选越多，configMatch权重越大
  if (survey.configMustHaves.length > 5) {
    w.configMatch += 0.04;
  } else if (survey.configMustHaves.length > 2) {
    w.configMatch += 0.02;
  }

  // 长途频率高 → 续航权重增加
  if (survey.longTripFrequency === "weekly") {
    w.range += 0.05;
    w.powerType += 0.03;
  } else if (survey.longTripFrequency === "monthly") {
    w.range += 0.02;
  }

  // 有家充 → 充电便利性权重下降，续航权重也稍降
  if (survey.hasHomeCharger) {
    w.charging -= 0.02;
  } else {
    w.charging += 0.03;
  }

  // 驾驶风格
  if (survey.driveStyle === "sporty") {
    w.driveStyle += 0.04;
    w.comfort -= 0.02;
  } else if (survey.driveStyle === "comfort") {
    w.comfort += 0.04;
    w.nvh += 0.02;
    w.driveStyle -= 0.02;
  }

  // NVH重视度
  w.nvh += (survey.nvrImportance - 3) * 0.015;

  // 家庭空间
  if (survey.familySize >= 5 || survey.oftenFullLoad) {
    w.space += 0.05;
    w.price -= 0.03;
  }

  // Clamp negatives to small positive
  for (const k of Object.keys(w) as Array<keyof typeof w>) {
    if (w[k] < 0.01) w[k] = 0.01;
  }

  // 归一化
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  for (const k of Object.keys(w) as Array<keyof typeof w>) {
    w[k] = w[k] / total;
  }

  return w;
}

function scoreCar(car: CarModel, survey: Survey, weights: ReturnType<typeof computeWeights>): number {
  let score = 0;
  const midPrice = (car.priceRange[0] + car.priceRange[1]) / 2;

  // 续航评分 (纯电实际续航/700, 增程/1200)
  const maxRange = car.powerType === "erev" ? 1200 : 700;
  const rangeScore = Math.min(car.realWorldRange / maxRange, 1) * 100;
  score += rangeScore * weights.range;

  // 动力类型匹配
  let powerScore = 50;
  if (car.powerType === "erev" && survey.preferErev) powerScore = 100;
  if (car.powerType === "bev" && survey.acceptPureBev) powerScore = 80;
  if (car.powerType === "bev" && !survey.acceptPureBev) powerScore = 20;
  if (car.canSwapBattery && survey.acceptBatterySwap) powerScore += 20;
  // 长途频率高 + 增程 = 加分
  if (car.powerType === "erev" && survey.longTripFrequency === "weekly") powerScore += 15;
  if (car.powerType === "erev" && survey.longTripFrequency === "monthly") powerScore += 8;
  powerScore = Math.min(powerScore, 100);
  score += powerScore * weights.powerType;

  // 空间
  const spaceScore = (car.rearSpace / 10) * 100;
  score += spaceScore * weights.space;

  // 舒适
  const comfortScore = ((car.seatComfort + car.soundInsulation + car.suspensionScore) / 30) * 100;
  score += comfortScore * weights.comfort;

  // 智驾
  let sdScore = ((car.highwayNoa + car.cityNoa + car.memoryParking) / 30) * 100;
  // 根据用户关注的智驾功能给额外加分
  if (survey.adsUseCases.includes("auto_park")) {
    sdScore += (car.autoPark / 10) * 10;
  }
  if (survey.adsUseCases.includes("summon") && car.autoSummon) {
    sdScore += 8;
  }
  sdScore = Math.min(sdScore, 100);
  score += sdScore * weights.smartDriving;

  // 车机
  const infoScore = (car.infotainmentScore / 10) * 100;
  score += infoScore * weights.infotainment;

  // 品牌
  let brandScore = (car.brandPremium / 10) * 100;
  if (survey.preferGlobalBrand && car.brand === "特斯拉") brandScore += 20;
  if (survey.domesticBrandAcceptance >= 4 && car.brand !== "特斯拉") brandScore += 10;
  if (survey.domesticBrandAcceptance <= 2 && car.brand !== "特斯拉") brandScore -= 20;
  brandScore = Math.max(0, Math.min(100, brandScore));
  score += brandScore * weights.brandPremium;

  // 服务
  const serviceScore = ((car.serviceNetwork + car.afterSalesScore) / 20) * 100;
  score += serviceScore * weights.service;

  // 保值率
  const resaleScore = car.resaleRate3Year * 100;
  score += resaleScore * weights.resaleRate;

  // 价格匹配 (离用户首付越近分越高)
  const maxBudget = survey.maxDownPayment / (survey.debtAversion >= 4 ? 1 : CONFIG.installmentDownPaymentRatio);
  let priceScore = 0;
  if (midPrice <= maxBudget) {
    priceScore = 100 - Math.abs(midPrice - maxBudget * 0.8) / maxBudget * 50;
  } else {
    priceScore = Math.max(0, 50 - ((midPrice - maxBudget) / maxBudget) * 100);
  }
  priceScore = Math.max(0, Math.min(100, priceScore));
  score += priceScore * weights.price;

  // === 新增：智驾费用匹配 ===
  let adsCostScore = 50;
  if (survey.adsCostTolerance === "free_only") {
    if (car.adsCostMode === "free") {
      adsCostScore = 100;
    } else {
      // 需要付费的车扣分，越贵扣越多
      const upfrontCost = car.adsCostUpfront ?? 0;
      adsCostScore = Math.max(0, 30 - upfrontCost * 5);
    }
  } else if (survey.adsCostTolerance === "pay_upfront_ok") {
    if (car.adsCostMode === "free") {
      adsCostScore = 90;
    } else {
      adsCostScore = 70;
    }
  } else if (survey.adsCostTolerance === "subscribe_ok") {
    if (car.adsCostMode === "free") {
      adsCostScore = 90;
    } else if (car.adsCostMode === "subscribe" || car.adsCostMode === "both") {
      adsCostScore = 75;
    } else {
      adsCostScore = 55;
    }
  } else {
    // "any" — 不在意费用
    adsCostScore = 70;
    if (car.adsCostMode === "free") adsCostScore = 80;
  }
  score += adsCostScore * weights.adsCost;

  // === 新增：配置匹配 ===
  let configScore = 50;
  if (survey.configMustHaves.length > 0) {
    let matched = 0;
    for (const cfg of survey.configMustHaves) {
      if (carHasConfig(car, cfg)) matched++;
    }
    configScore = (matched / survey.configMustHaves.length) * 100;
  }
  score += configScore * weights.configMatch;

  // === 新增：充电匹配 ===
  let chargingScore = 50;
  if (survey.chargingPreference === "ultra_fast") {
    // 用户偏好超快充
    chargingScore = car.supportsUltraCharge ? 100 : (car.supportsFastCharge ? 50 : 20);
    // 充电速度越快得分越高
    chargingScore = Math.min(100, chargingScore + Math.max(0, (40 - car.charge10to80min)) * 1.5);
  } else if (survey.chargingPreference === "fast_public") {
    chargingScore = car.supportsFastCharge ? 80 : 30;
  } else if (survey.chargingPreference === "battery_swap") {
    chargingScore = car.canSwapBattery ? 100 : 20;
  } else {
    // slow_home — 有家充基本都行
    chargingScore = 70;
    if (car.hasHomeChargerIncluded) chargingScore = 85;
  }
  // 有家充+纯电不扣"充电不便"分
  if (survey.hasHomeCharger && car.powerType === "bev") {
    chargingScore = Math.max(chargingScore, 70);
  }
  score += chargingScore * weights.charging;

  // === 新增：驾驶风格匹配 ===
  let driveScore = 50;
  if (survey.driveStyle === "sporty") {
    driveScore = (car.sportinessScore / 10) * 100;
  } else if (survey.driveStyle === "comfort") {
    // 舒适风格看悬挂+座椅+NVH
    driveScore = ((car.suspensionScore + car.seatComfort + car.nvhScore) / 30) * 100;
  } else {
    // balanced
    driveScore = ((car.sportinessScore + car.nvhScore) / 20) * 100;
  }
  score += driveScore * weights.driveStyle;

  // === 新增：NVH匹配 ===
  const nvhMatchScore = (car.nvhScore / 10) * 100;
  score += nvhMatchScore * weights.nvh;

  return Math.round(Math.max(0, Math.min(100, score)));
}

function rankCars(survey: Survey): CarRecommendation[] {
  const weights = computeWeights(survey);
  const scored = carDatabase.map((car) => ({
    car,
    score: scoreCar(car, survey, weights),
    topAdvantages: car.highlights.slice(0, 3),
    topRisks: car.risks.slice(0, 2),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored; // 返回所有（含分数），供对比功能使用
}

// ==================== 2. 资金策略模型 ====================

function computePurchaseMethods(car: CarModel, survey: Survey): PurchaseMethod[] {
  const midPrice = (car.priceRange[0] + car.priceRange[1]) / 2;
  const insurance1st = midPrice * CONFIG.insuranceRate1st;
  const insuranceSub = midPrice * CONFIG.insuranceRateSubsequent;
  const registrationFee = CONFIG.registrationFee;
  const purchaseTax = midPrice * CONFIG.purchaseTaxRate;
  const residual3Year = midPrice * car.resaleRate3Year;

  // 1) 全款新车
  const fullPayTotal = midPrice + purchaseTax + insurance1st + insuranceSub * 2 + registrationFee;
  const fullPayDepreciation3Y = fullPayTotal - residual3Year;
  const fullPayMonthly = fullPayDepreciation3Y / 36;

  // 2) 分期新车
  const downPayment = midPrice * CONFIG.installmentDownPaymentRatio;
  const loanAmount = midPrice - downPayment;
  const monthlyRate = CONFIG.installmentRate / 12;
  const monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, CONFIG.installmentMonths)
    / (Math.pow(1 + monthlyRate, CONFIG.installmentMonths) - 1);
  const totalLoanPayment = monthlyPayment * CONFIG.installmentMonths;
  const totalInterest = totalLoanPayment - loanAmount;
  const installmentTotal = downPayment + totalLoanPayment + purchaseTax + insurance1st + insuranceSub * 2
    + registrationFee + CONFIG.financeServiceFee;
  const installmentDepreciation = installmentTotal - residual3Year;
  const installmentMonthly = installmentDepreciation / 36;

  // 3) 官方认证二手 (1年车)
  const usedPrice = midPrice * CONFIG.usedCar1YearDiscount;
  const usedResidual = midPrice * CONFIG.usedCar3YearDiscount; // 到手后再开2年 = 总共3年车龄
  const usedInsurance = usedPrice * CONFIG.insuranceRateSubsequent * 2;
  const usedTotal = usedPrice + usedInsurance + registrationFee;
  const usedDepreciation = usedTotal - usedResidual;
  const usedMonthly = usedDepreciation / CONFIG.usedCarHoldMonths;

  // 4) 长租/以租代买
  const leaseMonthlyPayment = midPrice * CONFIG.leaseMonthlyRatio;
  const leaseTotal = leaseMonthlyPayment * CONFIG.leaseMonths;

  // 推荐逻辑
  let fullPayStars = 3;
  let installmentStars = 3;
  let usedStars = 3;
  let leaseStars = 2;

  // 负债厌恶度高 → 推荐全款
  if (survey.debtAversion >= 4) {
    fullPayStars = 5;
    installmentStars = 2;
  }

  // 有投资渠道且收益 > 贷款利率 → 推荐分期
  if (survey.hasInvestmentChannel && survey.expectedInvestmentReturn > CONFIG.installmentRate * 100) {
    installmentStars = Math.max(installmentStars, 4);
    fullPayStars = Math.min(fullPayStars, 3);
  }

  // 首付不够全款 → 分期更合适
  if (survey.maxDownPayment < midPrice) {
    installmentStars = Math.max(installmentStars, 4);
    if (survey.maxDownPayment < midPrice * 0.5) {
      fullPayStars = 1;
    }
  }

  // 换车周期短 → 二手/长租更划算
  if (survey.replacementCycle === "2_3_years") {
    usedStars = Math.max(usedStars, 4);
    leaseStars = Math.max(leaseStars, 3);
  }

  const methods: PurchaseMethod[] = [
    {
      method: "full_payment",
      label: "全款新车",
      totalCost3Year: Math.round(fullPayDepreciation3Y * 100) / 100,
      monthlyCost: Math.round(fullPayMonthly * 100) / 100,
      advantage: "无利息负担，手续简单，心理无压力",
      disadvantage: "大额资金一次性锁定，丧失投资机会成本",
      recommendation: fullPayStars,
    },
    {
      method: "installment",
      label: "分期新车",
      totalCost3Year: Math.round(installmentDepreciation * 100) / 100,
      monthlyCost: Math.round(installmentMonthly * 100) / 100,
      advantage: `低首付${Math.round(downPayment)}万起，保留现金流做投资`,
      disadvantage: `3年利息约${Math.round(totalInterest * 100) / 100}万，含金融服务费`,
      recommendation: installmentStars,
    },
    {
      method: "certified_used",
      label: "官方认证二手",
      totalCost3Year: Math.round(usedDepreciation * 100) / 100,
      monthlyCost: Math.round(usedMonthly * 100) / 100,
      advantage: "入手价低，首年大额折旧由前车主承担",
      disadvantage: "车况不确定，可选配置有限，质保期较短",
      recommendation: usedStars,
    },
    {
      method: "lease",
      label: "长租 / 以租代买",
      totalCost3Year: Math.round(leaseTotal * 100) / 100,
      monthlyCost: Math.round(leaseMonthlyPayment * 100) / 100,
      advantage: "无需大额首付，灵活换车，不用操心残值",
      disadvantage: "总成本最高，无车辆所有权，里程限制",
      recommendation: leaseStars,
    },
  ];

  return methods;
}

// ==================== 3. 退出时点模型 ====================

function computeExitStrategy(car: CarModel, survey: Survey): ExitStrategy {
  const midPrice = (car.priceRange[0] + car.priceRange[1]) / 2;
  const totalAcquisition = midPrice * (1 + CONFIG.insuranceRate1st) + CONFIG.registrationFee;

  // 按年计算折旧
  const value1Y = midPrice * car.resaleRate1Year;
  const value3Y = midPrice * car.resaleRate3Year;
  const value5Y = midPrice * car.resaleRate5Year;

  const dep1Y = (totalAcquisition - value1Y) / 12;
  const dep3Y = (totalAcquisition - value3Y) / 36;
  const dep5Y = (totalAcquisition - value5Y) / 60;

  // 最经济持有期通常在月均折旧最低点
  // 一般第2-3年月均折旧趋于平缓
  let holdMin = 30;
  let holdMax = 42;
  let explanation = "";
  let monthlyDep = dep3Y;
  let residualLow = value3Y * 0.95;
  let residualHigh = value3Y * 1.05;

  if (survey.replacementCycle === "2_3_years") {
    holdMin = 24;
    holdMax = 36;
    monthlyDep = dep3Y;
    residualLow = value3Y * 0.95;
    residualHigh = value1Y * 1.02;
    explanation = `您偏好短周期换车。${car.brand} ${car.model} 建议在第2-3年出手，此时月均折旧约${Math.round(dep3Y * 1000) / 100}万元/月。头1-2年折旧最快（月均${Math.round(dep1Y * 1000) / 100}万），第3年开始趋缓。`;
  } else if (survey.replacementCycle === "3_5_years") {
    holdMin = 36;
    holdMax = 48;
    monthlyDep = (dep3Y + dep5Y) / 2;
    residualLow = value5Y;
    residualHigh = value3Y;
    explanation = `您偏好中等持有周期。${car.brand} ${car.model} 建议持有3-4年，月均折旧约${Math.round(monthlyDep * 1000) / 100}万元/月。3年后技术迭代风险增加（智驾硬件升级、纯电平台换代），但折旧速率已明显放缓。`;
  } else {
    holdMin = 48;
    holdMax = 60;
    monthlyDep = dep5Y;
    residualLow = value5Y * 0.9;
    residualHigh = value5Y * 1.1;
    explanation = `您倾向长期持有。${car.brand} ${car.model} 可考虑开4-5年，月均折旧约${Math.round(dep5Y * 1000) / 100}万元/月，是最经济的方案。但需注意：5年后电池衰减、智驾硬件过时和平台换代可能导致残值加速下跌。`;
  }

  return {
    holdingPeriodMonths: [holdMin, holdMax],
    estimatedResidualValue: [
      Math.round(residualLow * 100) / 100,
      Math.round(residualHigh * 100) / 100,
    ],
    monthlyDepreciation: Math.round(monthlyDep * 10000) / 10000,
    explanation,
  };
}

// ==================== 主入口 ====================

export function evaluate(survey: Survey): DecisionResult {
  const topCars = rankCars(survey);
  const selectedCar = topCars[0].car;
  const purchaseMethods = computePurchaseMethods(selectedCar, survey);
  const exitStrategy = computeExitStrategy(selectedCar, survey);

  return {
    topCars,
    purchaseMethods,
    exitStrategy,
    selectedCarForFinance: selectedCar,
  };
}
