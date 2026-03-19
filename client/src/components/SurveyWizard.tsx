import { useState } from "react";
import type { Survey } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Cpu,
  Battery,
  Award,
  Wallet,
  Clock,
} from "lucide-react";

const TOTAL_STEPS = 7;

const defaultSurvey: Survey = {
  usageScenarios: ["city_commute"],
  annualMileage: "10k_20k",
  familySize: 3,
  oftenFullLoad: false,
  needLargeTrunk: false,
  smartDrivingImportance: 3,
  infotainmentImportance: 3,
  acceptPureBev: true,
  preferErev: false,
  acceptBatterySwap: false,
  domesticBrandAcceptance: 4,
  preferGlobalBrand: false,
  maxDownPayment: 30,
  debtAversion: 3,
  hasInvestmentChannel: false,
  expectedInvestmentReturn: 5,
  replacementCycle: "3_5_years",
};

interface Props {
  initialData: Survey | null;
  onComplete: (data: Survey) => void;
}

export default function SurveyWizard({ initialData, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Survey>(initialData ?? defaultSurvey);

  const update = <K extends keyof Survey>(key: K, val: Survey[K]) =>
    setData((prev) => ({ ...prev, [key]: val }));

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinish = () => onComplete(data);

  const toggleScenario = (val: string) => {
    const current = data.usageScenarios as string[];
    if (current.includes(val)) {
      if (current.length > 1) {
        update(
          "usageScenarios",
          current.filter((v) => v !== val) as Survey["usageScenarios"]
        );
      }
    } else {
      update("usageScenarios", [...current, val] as Survey["usageScenarios"]);
    }
  };

  const stepIcons = [MapPin, Users, Cpu, Battery, Award, Wallet, Clock];
  const stepNames = [
    "使用场景",
    "家庭空间",
    "智驾偏好",
    "补能偏好",
    "品牌态度",
    "资金偏好",
    "换车周期",
  ];

  const StepIcon = stepIcons[step - 1];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <StepIcon className="w-3.5 h-3.5" />
            {stepNames[step - 1]}
          </span>
          <span>
            {step} / {TOTAL_STEPS}
          </span>
        </div>
        <Progress value={(step / TOTAL_STEPS) * 100} className="h-1.5" />
      </div>

      {/* Step Content */}
      <Card data-testid="survey-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{stepNames[step - 1]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {step === 1 && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  主要使用场景（可多选）
                </Label>
                {(
                  [
                    ["city_commute", "城市通勤为主"],
                    ["highway_business", "高速商务为主"],
                    ["family_trip", "家庭自驾游为主"],
                  ] as const
                ).map(([val, label]) => (
                  <label
                    key={val}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      data-testid={`scenario-${val}`}
                      checked={data.usageScenarios.includes(val)}
                      onCheckedChange={() => toggleScenario(val)}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">预估年行驶里程</Label>
                <RadioGroup
                  value={data.annualMileage}
                  onValueChange={(v) =>
                    update("annualMileage", v as Survey["annualMileage"])
                  }
                  className="grid grid-cols-2 gap-2"
                >
                  {(
                    [
                      ["lt10k", "< 1万公里"],
                      ["10k_20k", "1-2万公里"],
                      ["20k_30k", "2-3万公里"],
                      ["gt30k", "> 3万公里"],
                    ] as const
                  ).map(([val, label]) => (
                    <label
                      key={val}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <RadioGroupItem
                        value={val}
                        data-testid={`mileage-${val}`}
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  家庭人数（含孩子）
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    data-testid="slider-family-size"
                    value={[data.familySize]}
                    onValueChange={([v]) => update("familySize", v)}
                    min={1}
                    max={8}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold w-8 text-center">
                    {data.familySize}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <Label className="text-sm">经常满载出行</Label>
                <Switch
                  data-testid="switch-full-load"
                  checked={data.oftenFullLoad}
                  onCheckedChange={(v) => update("oftenFullLoad", v)}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <Label className="text-sm">需要大后备箱</Label>
                <Switch
                  data-testid="switch-large-trunk"
                  checked={data.needLargeTrunk}
                  onCheckedChange={(v) => update("needLargeTrunk", v)}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  智驾重视度（城市NOA / 高速NOA / 泊车）
                </Label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-12">
                    不在意
                  </span>
                  <Slider
                    data-testid="slider-smart-driving"
                    value={[data.smartDrivingImportance]}
                    onValueChange={([v]) =>
                      update("smartDrivingImportance", v)
                    }
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    非常看重
                  </span>
                  <span className="text-lg font-semibold w-6 text-center">
                    {data.smartDrivingImportance}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  车机 / 车内娱乐重视度
                </Label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-12">
                    不在意
                  </span>
                  <Slider
                    data-testid="slider-infotainment"
                    value={[data.infotainmentImportance]}
                    onValueChange={([v]) =>
                      update("infotainmentImportance", v)
                    }
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    非常看重
                  </span>
                  <span className="text-lg font-semibold w-6 text-center">
                    {data.infotainmentImportance}
                  </span>
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <Label className="text-sm font-medium">接受纯电</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    主要在一二线城市使用
                  </p>
                </div>
                <Switch
                  data-testid="switch-accept-bev"
                  checked={data.acceptPureBev}
                  onCheckedChange={(v) => update("acceptPureBev", v)}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <Label className="text-sm font-medium">更倾向增程</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    不想有续航焦虑
                  </p>
                </div>
                <Switch
                  data-testid="switch-prefer-erev"
                  checked={data.preferErev}
                  onCheckedChange={(v) => update("preferErev", v)}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <Label className="text-sm font-medium">
                    接受换电模式
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    蔚来/乐道换电，车电分离合同
                  </p>
                </div>
                <Switch
                  data-testid="switch-accept-swap"
                  checked={data.acceptBatterySwap}
                  onCheckedChange={(v) => update("acceptBatterySwap", v)}
                />
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  对国产新势力的接受度
                </Label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-12">
                    抗拒
                  </span>
                  <Slider
                    data-testid="slider-domestic"
                    value={[data.domesticBrandAcceptance]}
                    onValueChange={([v]) =>
                      update("domesticBrandAcceptance", v)
                    }
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    非常接受
                  </span>
                  <span className="text-lg font-semibold w-6 text-center">
                    {data.domesticBrandAcceptance}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <Label className="text-sm font-medium">
                    更看重全球品牌
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    如特斯拉
                  </p>
                </div>
                <Switch
                  data-testid="switch-prefer-global"
                  checked={data.preferGlobalBrand}
                  onCheckedChange={(v) => update("preferGlobalBrand", v)}
                />
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  可接受最大首付款（万元）
                </Label>
                <Input
                  data-testid="input-down-payment"
                  type="number"
                  value={data.maxDownPayment}
                  onChange={(e) =>
                    update("maxDownPayment", Number(e.target.value) || 0)
                  }
                  min={0}
                  max={200}
                  className="w-full"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  负债厌恶度
                </Label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-12">
                    无所谓
                  </span>
                  <Slider
                    data-testid="slider-debt-aversion"
                    value={[data.debtAversion]}
                    onValueChange={([v]) => update("debtAversion", v)}
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    非常抗拒
                  </span>
                  <span className="text-lg font-semibold w-6 text-center">
                    {data.debtAversion}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <Label className="text-sm">有其他投资渠道</Label>
                <Switch
                  data-testid="switch-investment"
                  checked={data.hasInvestmentChannel}
                  onCheckedChange={(v) => update("hasInvestmentChannel", v)}
                />
              </div>
              {data.hasInvestmentChannel && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    预期年化收益（%）
                  </Label>
                  <Input
                    data-testid="input-investment-return"
                    type="number"
                    value={data.expectedInvestmentReturn}
                    onChange={(e) =>
                      update(
                        "expectedInvestmentReturn",
                        Number(e.target.value) || 0
                      )
                    }
                    min={0}
                    max={100}
                    className="w-full"
                  />
                </div>
              )}
            </>
          )}

          {step === 7 && (
            <>
              <Label className="text-sm font-medium">换车周期偏好</Label>
              <RadioGroup
                value={data.replacementCycle}
                onValueChange={(v) =>
                  update("replacementCycle", v as Survey["replacementCycle"])
                }
                className="space-y-2"
              >
                {(
                  [
                    ["2_3_years", "2-3年一换", "喜欢尝鲜，追求最新技术"],
                    [
                      "3_5_years",
                      "3-5年一换",
                      "平衡折旧和使用，比较理性",
                    ],
                    [
                      "as_long_as_possible",
                      "能开就不换",
                      "实用主义，开到不能开为止",
                    ],
                  ] as const
                ).map(([val, label, desc]) => (
                  <label
                    key={val}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem
                      value={val}
                      className="mt-0.5"
                      data-testid={`cycle-${val}`}
                    />
                    <div>
                      <span className="text-sm font-medium">{label}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {desc}
                      </p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prev}
          disabled={step === 1}
          data-testid="btn-prev"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          上一步
        </Button>
        {step < TOTAL_STEPS ? (
          <Button onClick={next} data-testid="btn-next">
            下一步
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleFinish} data-testid="btn-finish">
            确认提交
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
