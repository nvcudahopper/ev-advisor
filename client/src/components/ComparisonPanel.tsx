import { useState, useMemo } from "react";
import { carDatabase } from "@server/carData";
import type { CarModel, CarRecommendation, Survey } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HelpCircle,
  Search,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  X,
  Zap,
  Fuel,
  Shield,
  Brain,
  Sofa,
  Banknote,
  Star,
  TrendingDown,
  ChevronUp,
  ChevronDown,
  Minus,
  Gauge,
  Volume2,
  Timer,
  CreditCard,
  Ruler,
} from "lucide-react";

interface Props {
  topCar: CarRecommendation;
  allRanked: CarRecommendation[];
  surveyData: Survey;
}

// Dimension config for radar-style comparison
interface Dimension {
  key: string;
  label: string;
  icon: React.ReactNode;
  extract: (car: CarModel) => number; // 0-100 normalized
  desc: string;
}

function getAdsCostLabel(car: CarModel): string {
  if (car.adsCostMode === "free") return "免费";
  if (car.adsCostMode === "upfront") return `买断${car.adsCostUpfront}万`;
  if (car.adsCostMode === "subscribe") return `${car.adsCostMonthly}元/月`;
  if (car.adsCostMode === "both") return `买断${car.adsCostUpfront}万或${car.adsCostMonthly}元/月`;
  return "未知";
}

const dimensions: Dimension[] = [
  {
    key: "range",
    label: "续航实力",
    icon: <Zap className="w-3.5 h-3.5" />,
    extract: (c) => Math.min((c.realWorldRange / 1200) * 100, 100),
    desc: "实际续航里程",
  },
  {
    key: "smartDriving",
    label: "智驾能力",
    icon: <Brain className="w-3.5 h-3.5" />,
    extract: (c) =>
      ((c.highwayNoa + c.cityNoa + c.memoryParking) / 30) * 100,
    desc: "高速NOA + 城市NOA + 记忆泊车",
  },
  {
    key: "adsCost",
    label: "智驾费用",
    icon: <CreditCard className="w-3.5 h-3.5" />,
    extract: (c) => {
      // Free = 100, cheaper = higher
      if (c.adsCostMode === "free") return 100;
      const cost = c.adsCostUpfront ?? 0;
      return Math.max(0, 100 - cost * 12);
    },
    desc: "智驾费用（越低越优）",
  },
  {
    key: "comfort",
    label: "舒适性",
    icon: <Sofa className="w-3.5 h-3.5" />,
    extract: (c) =>
      ((c.seatComfort + c.soundInsulation + c.suspensionScore) / 30) * 100,
    desc: "座椅 + 隔音 + 底盘",
  },
  {
    key: "nvh",
    label: "NVH静谧性",
    icon: <Volume2 className="w-3.5 h-3.5" />,
    extract: (c) => (c.nvhScore / 10) * 100,
    desc: "噪音振动舒适性",
  },
  {
    key: "sportiness",
    label: "运动性",
    icon: <Gauge className="w-3.5 h-3.5" />,
    extract: (c) => (c.sportinessScore / 10) * 100,
    desc: "加速和操控表现",
  },
  {
    key: "charging",
    label: "充电速度",
    icon: <Timer className="w-3.5 h-3.5" />,
    extract: (c) => {
      // 18min = 100, 45min = 10
      return Math.max(0, Math.min(100, ((45 - c.charge10to80min) / 27) * 100));
    },
    desc: "10-80%快充时间（越快越优）",
  },
  {
    key: "space",
    label: "空间",
    icon: <Sofa className="w-3.5 h-3.5" />,
    extract: (c) => (c.rearSpace / 10) * 100,
    desc: "后排空间评分",
  },
  {
    key: "bodySize",
    label: "车身尺寸",
    icon: <Ruler className="w-3.5 h-3.5" />,
    extract: (c) => Math.max(0, Math.min(100, ((5200 - c.bodyLength) / 500) * 100)),
    desc: "车身紧凑度（越小越好停车）",
  },
  {
    key: "brand",
    label: "品牌溢价",
    icon: <Star className="w-3.5 h-3.5" />,
    extract: (c) => (c.brandPremium / 10) * 100,
    desc: "品牌影响力和服务",
  },
  {
    key: "service",
    label: "售后服务",
    icon: <Shield className="w-3.5 h-3.5" />,
    extract: (c) => ((c.serviceNetwork + c.afterSalesScore) / 20) * 100,
    desc: "服务网络 + 售后评分",
  },
  {
    key: "resale",
    label: "保值率",
    icon: <TrendingDown className="w-3.5 h-3.5" />,
    extract: (c) => c.resaleRate3Year * 100,
    desc: "3年保值率",
  },
  {
    key: "price",
    label: "价格",
    icon: <Banknote className="w-3.5 h-3.5" />,
    extract: (c) => {
      const mid = (c.priceRange[0] + c.priceRange[1]) / 2;
      // Lower price = higher score (inverse). Range: 20-50万 mapped to 100-0
      return Math.max(0, Math.min(100, ((50 - mid) / 30) * 100));
    },
    desc: "指导价中位（越低越优）",
  },
];

function DiffIndicator({ diff }: { diff: number }) {
  if (Math.abs(diff) < 3) {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
        <Minus className="w-3 h-3" /> 持平
      </span>
    );
  }
  if (diff > 0) {
    return (
      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-0.5 font-medium">
        <ChevronUp className="w-3 h-3" /> +{Math.round(diff)}
      </span>
    );
  }
  return (
    <span className="text-xs text-red-500 flex items-center gap-0.5 font-medium">
      <ChevronDown className="w-3 h-3" /> {Math.round(diff)}
    </span>
  );
}

function generateVerdict(
  topCar: CarModel,
  topScore: number,
  challenger: CarModel,
  challengerScore: number
): string {
  const scoreDiff = topScore - challengerScore;
  const topName = `${topCar.brand} ${topCar.model}`;
  const challName = `${challenger.brand} ${challenger.model}`;

  // Find dimensions where challenger beats top
  const challWins: string[] = [];
  const topWins: string[] = [];

  for (const dim of dimensions) {
    const topVal = dim.extract(topCar);
    const challVal = dim.extract(challenger);
    const diff = challVal - topVal;
    if (diff > 8) challWins.push(dim.label);
    if (diff < -8) topWins.push(dim.label);
  }

  // ADS cost difference mention
  let adsCostNote = "";
  if (topCar.adsCostMode !== challenger.adsCostMode) {
    const topCostLabel = getAdsCostLabel(topCar);
    const challCostLabel = getAdsCostLabel(challenger);
    adsCostNote = `智驾费用方面，${topName}为${topCostLabel}，${challName}为${challCostLabel}。`;
  }

  let verdict = "";

  if (scoreDiff <= 0) {
    verdict = `${challName} 在您的需求下其实和 ${topName} 不相上下`;
    if (challWins.length > 0) {
      verdict += `，甚至在${challWins.join("、")}方面更有优势`;
    }
    verdict += "。两者都是非常适合您的选择。";
  } else if (scoreDiff <= 10) {
    verdict = `${challName} 整体表现和 ${topName} 差距不大（仅${scoreDiff}分之差）`;
    if (challWins.length > 0) {
      verdict += `。${challName} 在${challWins.join("、")}方面甚至更好`;
    }
    if (topWins.length > 0) {
      verdict += `，但 ${topName} 在${topWins.join("、")}上更匹配您的需求`;
    }
    verdict += "。如果您对" + (challWins[0] || "这款车") + "有特别偏好，它也是个好选择。";
  } else {
    verdict = `${topName} 比 ${challName} 更匹配您的需求（高出${scoreDiff}分）`;
    if (topWins.length > 0) {
      verdict += `，主要胜在${topWins.join("、")}`;
    }
    if (challWins.length > 0) {
      verdict += `。不过 ${challName} 在${challWins.join("、")}方面确实更强`;
    }
    verdict +=
      "。如果这些优势对您很重要，可以考虑调整问卷权重后重新评估。";
  }

  if (adsCostNote) {
    verdict += " " + adsCostNote;
  }

  return verdict;
}

export default function ComparisonPanel({
  topCar,
  allRanked,
  surveyData,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCar, setSelectedCar] = useState<CarModel | null>(null);

  // Fuzzy search in carDatabase
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return carDatabase.filter((car) => {
      const full = `${car.brand} ${car.model}`.toLowerCase();
      return full.includes(q) || car.id.toLowerCase().includes(q);
    });
  }, [query]);

  // Find the challenger's score from allRanked, or calculate approximate
  const challengerRec = useMemo(() => {
    if (!selectedCar) return null;
    return allRanked.find((r) => r.car.id === selectedCar.id) || null;
  }, [selectedCar, allRanked]);

  const challengerScore = challengerRec?.score ?? 0;

  const handleSelect = (car: CarModel) => {
    setSelectedCar(car);
    setQuery("");
  };

  const handleReset = () => {
    setSelectedCar(null);
    setQuery("");
  };

  const topCarData = topCar.car;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <HelpCircle className="w-4 h-4" />
          为什么不是别的车？
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            车型对比 — 为什么推荐这辆车
          </DialogTitle>
        </DialogHeader>

        {/* Search bar */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            输入您心仪的车型名称，系统将与当前推荐的
            <span className="font-medium text-foreground">
              {" "}{topCarData.brand} {topCarData.model}{" "}
            </span>
            进行全方位对比
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索车型（如：特斯拉、Model Y、蔚来...）"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (selectedCar) setSelectedCar(null);
              }}
              className="pl-10"
            />
          </div>

          {/* Search results dropdown */}
          {query && !selectedCar && (
            <div className="border rounded-lg divide-y">
              {searchResults.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  未找到匹配的车型，请尝试其他关键词
                </div>
              ) : (
                searchResults.map((car) => {
                  const isTopCar = car.id === topCarData.id;
                  return (
                    <button
                      key={car.id}
                      onClick={() => !isTopCar && handleSelect(car)}
                      disabled={isTopCar}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                        isTopCar
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-muted/50 cursor-pointer"
                      }`}
                    >
                      <div>
                        <span className="text-sm font-medium">
                          {car.brand} {car.model}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {car.priceRange[0]}-{car.priceRange[1]}万 ·{" "}
                          {car.powerType === "bev" ? "纯电" : "增程"}
                        </span>
                      </div>
                      {isTopCar ? (
                        <Badge variant="secondary" className="text-xs">
                          当前推荐
                        </Badge>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Comparison result */}
        {selectedCar && (
          <div className="space-y-5 pt-2">
            {/* Header: vs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <Badge className="bg-primary text-primary-foreground mb-1">
                    推荐
                  </Badge>
                  <p className="text-sm font-semibold">
                    {topCarData.brand} {topCarData.model}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    适配分 {topCar.score}
                  </p>
                </div>
                <span className="text-lg font-bold text-muted-foreground">
                  VS
                </span>
                <div className="text-center">
                  <Badge variant="outline" className="mb-1">
                    对比
                  </Badge>
                  <p className="text-sm font-semibold">
                    {selectedCar.brand} {selectedCar.model}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    适配分 {challengerScore}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="w-4 h-4 mr-1" /> 换一辆
              </Button>
            </div>

            {/* Score bars comparison */}
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{topCarData.brand} {topCarData.model}</span>
                  <span className="text-primary font-bold">{topCar.score}</span>
                </div>
                <Progress value={topCar.score} className="h-2" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{selectedCar.brand} {selectedCar.model}</span>
                  <span className="font-bold">{challengerScore}</span>
                </div>
                <Progress value={challengerScore} className="h-2" />
              </div>
            </div>

            {/* Dimension-by-dimension comparison */}
            <Card>
              <CardContent className="pt-5 space-y-1">
                <h4 className="text-sm font-semibold mb-3">分项对比</h4>
                {dimensions.map((dim) => {
                  const topVal = dim.extract(topCarData);
                  const challVal = dim.extract(selectedCar);
                  const diff = topVal - challVal; // positive = top is better
                  return (
                    <div
                      key={dim.key}
                      className="flex items-center py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-2 w-24 shrink-0">
                        {dim.icon}
                        <span className="text-xs font-medium">
                          {dim.label}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="w-16 text-right">
                          <span
                            className={`text-xs font-bold ${
                              diff > 3
                                ? "text-green-600 dark:text-green-400"
                                : diff < -3
                                ? "text-red-500"
                                : "text-foreground"
                            }`}
                          >
                            {Math.round(topVal)}
                          </span>
                        </div>
                        <div className="flex-1 flex h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="bg-primary rounded-full transition-all"
                            style={{ width: `${topVal}%` }}
                          />
                        </div>
                        <div className="flex-1 flex h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="bg-foreground/40 rounded-full transition-all"
                            style={{ width: `${challVal}%` }}
                          />
                        </div>
                        <div className="w-16">
                          <span
                            className={`text-xs font-bold ${
                              diff < -3
                                ? "text-green-600 dark:text-green-400"
                                : diff > 3
                                ? "text-red-500"
                                : "text-foreground"
                            }`}
                          >
                            {Math.round(challVal)}
                          </span>
                        </div>
                      </div>
                      <div className="w-16 text-right">
                        <DiffIndicator diff={-diff} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Pros/Cons side by side */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="pt-4 space-y-2">
                  <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {topCarData.brand} {topCarData.model} 优势
                  </h4>
                  {topCar.topAdvantages.map((a, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      · {a}
                    </p>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 space-y-2">
                  <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedCar.brand} {selectedCar.model} 优势
                  </h4>
                  {selectedCar.highlights.map((a, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      · {a}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick specs comparison */}
            <Card>
              <CardContent className="pt-5">
                <h4 className="text-sm font-semibold mb-3">关键参数对比</h4>
                <div className="space-y-0">
                  {[
                    {
                      label: "价格区间",
                      top: `${topCarData.priceRange[0]}-${topCarData.priceRange[1]}万`,
                      chall: `${selectedCar.priceRange[0]}-${selectedCar.priceRange[1]}万`,
                    },
                    {
                      label: "动力类型",
                      top: topCarData.powerType === "bev" ? "纯电" : "增程",
                      chall:
                        selectedCar.powerType === "bev" ? "纯电" : "增程",
                    },
                    {
                      label: "实际续航",
                      top: `${topCarData.realWorldRange}km`,
                      chall: `${selectedCar.realWorldRange}km`,
                    },
                    {
                      label: "城市智驾",
                      top: `${topCarData.cityNoa}/10`,
                      chall: `${selectedCar.cityNoa}/10`,
                    },
                    {
                      label: "智驾费用",
                      top: getAdsCostLabel(topCarData),
                      chall: getAdsCostLabel(selectedCar),
                    },
                    {
                      label: "快充10-80%",
                      top: `${topCarData.charge10to80min}分钟`,
                      chall: `${selectedCar.charge10to80min}分钟`,
                    },
                    {
                      label: "NVH评分",
                      top: `${topCarData.nvhScore}/10`,
                      chall: `${selectedCar.nvhScore}/10`,
                    },
                    {
                      label: "百公里加速",
                      top: `${topCarData.zeroto100}秒`,
                      chall: `${selectedCar.zeroto100}秒`,
                    },
                    {
                      label: "3年保值率",
                      top: `${Math.round(topCarData.resaleRate3Year * 100)}%`,
                      chall: `${Math.round(
                        selectedCar.resaleRate3Year * 100
                      )}%`,
                    },
                    {
                      label: "支持换电",
                      top: topCarData.canSwapBattery ? "是" : "否",
                      chall: selectedCar.canSwapBattery ? "是" : "否",
                    },
                    {
                      label: "车身尺寸",
                      top: `${topCarData.bodyLength}×${topCarData.bodyWidth}×${topCarData.bodyHeight}mm`,
                      chall: `${selectedCar.bodyLength}×${selectedCar.bodyWidth}×${selectedCar.bodyHeight}mm`,
                    },
                    ...(surveyData.city === "beijing" ? [{
                      label: "限行(北京)",
                      top: topCarData.platePolicy.beijing === "restricted" ? "限行" : "不限行",
                      chall: selectedCar.platePolicy.beijing === "restricted" ? "限行" : "不限行",
                    }] : []),
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-3 py-2 border-b border-border last:border-0 text-xs"
                    >
                      <span className="text-muted-foreground">
                        {row.label}
                      </span>
                      <span className="font-medium text-center">
                        {row.top}
                      </span>
                      <span className="font-medium text-center">
                        {row.chall}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Verdict */}
            <Card className="border-primary/20 bg-primary/[0.03]">
              <CardContent className="pt-5">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  综合分析
                </h4>
                <p className="text-sm leading-relaxed">
                  {generateVerdict(
                    topCarData,
                    topCar.score,
                    selectedCar,
                    challengerScore
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
