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
  Brain,
  Settings2,
  Battery,
  Gauge,
  Award,
  Wallet,
  Clock,
  Box,
  Monitor,
  Sun,
  Wind,
  Thermometer,
  Armchair,
  Eye,
  Disc3,
  Smartphone,
  BatteryCharging,
  Plug,
  Speaker,
  DoorOpen,
  Camera,
  Key,
  Zap,
} from "lucide-react";

const TOTAL_STEPS = 9;

const defaultSurvey: Survey = {
  usageScenarios: ["city_commute"],
  annualMileage: "10k_20k",
  hasHomeCharger: false,
  longTripFrequency: "rarely",
  familySize: 3,
  oftenFullLoad: false,
  needLargeTrunk: false,
  adsPriority: "nice_to_have",
  adsUseCases: ["highway_noa"],
  adsCostTolerance: "any",
  configMustHaves: [],
  acceptPureBev: true,
  preferErev: false,
  acceptBatterySwap: false,
  chargingPreference: "fast_public",
  driveStyle: "balanced",
  nvrImportance: 3,
  domesticBrandAcceptance: 4,
  preferGlobalBrand: false,
  maxDownPayment: 30,
  debtAversion: 3,
  hasInvestmentChannel: false,
  expectedInvestmentReturn: 5,
  replacementCycle: "3_5_years",
};

// Config items for step 4
const configOptions: { key: string; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: "frunk", label: "前备箱", icon: <Box className="w-5 h-5" />, desc: "额外储物空间" },
  { key: "rear_screen", label: "后排屏幕", icon: <Monitor className="w-5 h-5" />, desc: "后排娱乐屏" },
  { key: "rear_sunshade", label: "遮阳帘", icon: <Sun className="w-5 h-5" />, desc: "后排电动遮阳帘" },
  { key: "air_suspension", label: "空气悬挂", icon: <Wind className="w-5 h-5" />, desc: "自适应舒适底盘" },
  { key: "ventilated_seats", label: "座椅通风", icon: <Wind className="w-5 h-5" />, desc: "前排/全车通风" },
  { key: "heated_seats", label: "座椅加热", icon: <Thermometer className="w-5 h-5" />, desc: "前后排加热" },
  { key: "massage_seats", label: "座椅按摩", icon: <Armchair className="w-5 h-5" />, desc: "前排/全车按摩" },
  { key: "hud", label: "HUD抬头显示", icon: <Eye className="w-5 h-5" />, desc: "投射到挡风玻璃" },
  { key: "physical_buttons", label: "实体按键", icon: <Disc3 className="w-5 h-5" />, desc: "方向盘/中控旋钮" },
  { key: "wireless_charge", label: "无线充电", icon: <Smartphone className="w-5 h-5" />, desc: "手机无线充电板" },
  { key: "electric_tailgate", label: "电动尾门", icon: <DoorOpen className="w-5 h-5" />, desc: "感应/电动开启" },
  { key: "v2l", label: "外放电V2L", icon: <BatteryCharging className="w-5 h-5" />, desc: "露营/应急供电" },
  { key: "audio_premium", label: "高端音响", icon: <Speaker className="w-5 h-5" />, desc: "哈曼/Bose/丹拿等" },
  { key: "frameless_door", label: "无框车门", icon: <DoorOpen className="w-5 h-5" />, desc: "运动美观" },
  { key: "power_door", label: "电吸门", icon: <DoorOpen className="w-5 h-5" />, desc: "轻推自动关门" },
  { key: "dash_cam_360", label: "360全景影像", icon: <Camera className="w-5 h-5" />, desc: "行车记录+全景" },
  { key: "nfc_key", label: "数字钥匙", icon: <Key className="w-5 h-5" />, desc: "NFC/UWB手机钥匙" },
];

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

  const toggleAdsUseCase = (val: string) => {
    const current = data.adsUseCases as string[];
    if (current.includes(val)) {
      update(
        "adsUseCases",
        current.filter((v) => v !== val) as Survey["adsUseCases"]
      );
    } else {
      update("adsUseCases", [...current, val] as Survey["adsUseCases"]);
    }
  };

  const toggleConfig = (key: string) => {
    const current = data.configMustHaves;
    if (current.includes(key)) {
      update("configMustHaves", current.filter((v) => v !== key));
    } else {
      update("configMustHaves", [...current, key]);
    }
  };

  const stepIcons = [MapPin, Users, Brain, Settings2, Battery, Gauge, Award, Wallet, Clock];
  const stepNames = [
    "使用场景",
    "家庭空间",
    "智驾需求",
    "配置偏好",
    "补能偏好",
    "驾驶风格",
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
          {/* Step 1: 使用场景 */}
          {step === 1 && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">所在城市</Label>
                <RadioGroup
                  value={data.city}
                  onValueChange={(v) => update("city", v as Survey["city"])}
                  className="grid grid-cols-2 gap-2"
                >
                  {(
                    [
                      ["beijing", "北京"],
                      ["shanghai", "上海"],
                      ["shenzhen", "深圳"],
                      ["guangzhou", "广州"],
                      ["hangzhou", "杭州"],
                      ["chengdu", "成都"],
                      ["other", "其他城市"],
                    ] as const
                  ).map(([val, label]) => (
                    <label
                      key={val}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <RadioGroupItem value={val} />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </RadioGroup>
                {data.city === "beijing" && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-700 dark:text-red-300">
                      ⚠️ 北京增程/插混按燃油车管理，工作日限行
                    </p>
                  </div>
                )}
                {data.city === "shanghai" && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      ⚠️ 上海增程/插混需竞拍沪牌（约10万元）
                    </p>
                  </div>
                )}
              </div>
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
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <Label className="text-sm font-medium">有家用充电桩</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    自有车位且已安装充电桩
                  </p>
                </div>
                <Switch
                  data-testid="switch-home-charger"
                  checked={data.hasHomeCharger}
                  onCheckedChange={(v) => update("hasHomeCharger", v)}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">长途出行频率</Label>
                <RadioGroup
                  value={data.longTripFrequency}
                  onValueChange={(v) =>
                    update("longTripFrequency", v as Survey["longTripFrequency"])
                  }
                  className="grid grid-cols-3 gap-2"
                >
                  {(
                    [
                      ["rarely", "很少"],
                      ["monthly", "每月"],
                      ["weekly", "每周"],
                    ] as const
                  ).map(([val, label]) => (
                    <label
                      key={val}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <RadioGroupItem value={val} />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </>
          )}

          {/* Step 2: 家庭与空间 */}
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
              <div className="space-y-3">
                <Label className="text-sm font-medium">停车难度</Label>
                <RadioGroup
                  value={data.parkingDifficulty}
                  onValueChange={(v) => update("parkingDifficulty", v as Survey["parkingDifficulty"])}
                  className="space-y-2"
                >
                  {(
                    [
                      ["easy", "宽松", "自有车位，停车方便"],
                      ["moderate", "一般", "偶尔需要找车位"],
                      ["tight", "紧张", "地库车位窄、经常路边停车"],
                    ] as const
                  ).map(([val, label, desc]) => (
                    <label
                      key={val}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <RadioGroupItem value={val} className="mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">{label}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <Label className="text-sm font-medium">倾向紧凑车身</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">方便停车和城市驾驶</p>
                </div>
                <Switch
                  checked={data.preferCompactSize}
                  onCheckedChange={(v) => update("preferCompactSize", v)}
                />
              </div>
            </>
          )}

          {/* Step 3: 智驾需求（细化） */}
          {step === 3 && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  智驾对你来说是？
                </Label>
                <RadioGroup
                  value={data.adsPriority}
                  onValueChange={(v) =>
                    update("adsPriority", v as Survey["adsPriority"])
                  }
                  className="space-y-2"
                >
                  {(
                    [
                      ["must_have", "必须有", "没有好智驾不考虑这台车"],
                      ["nice_to_have", "加分项", "有最好，没有也不是一票否决"],
                      ["dont_care", "不在意", "更看重其他方面"],
                    ] as const
                  ).map(([val, label, desc]) => (
                    <label
                      key={val}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <RadioGroupItem value={val} className="mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">{label}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  你最需要哪些智驾功能？（多选）
                </Label>
                {(
                  [
                    ["highway_noa", "高速NOA", "高速自动导航辅助"],
                    ["city_noa", "城市NOA", "城区自动导航辅助"],
                    ["memory_parking", "记忆泊车", "记忆常用车位自动停车"],
                    ["auto_park", "自动泊车", "一键自动寻位停车"],
                    ["summon", "智能召唤", "远程召唤车辆到身边"],
                  ] as const
                ).map(([val, label, desc]) => (
                  <label
                    key={val}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={data.adsUseCases.includes(val)}
                      onCheckedChange={() => toggleAdsUseCase(val)}
                    />
                    <div>
                      <span className="text-sm font-medium">{label}</span>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  你接受智驾额外付费吗？
                </Label>
                <p className="text-xs text-muted-foreground -mt-1">
                  特斯拉FSD买断6.4万/EAP 3.2万，华为ADS买断3.6万/月付720元，理想/蔚来/小米免费
                </p>
                <RadioGroup
                  value={data.adsCostTolerance}
                  onValueChange={(v) =>
                    update("adsCostTolerance", v as Survey["adsCostTolerance"])
                  }
                  className="grid grid-cols-2 gap-2"
                >
                  {(
                    [
                      ["free_only", "只要免费的"],
                      ["pay_upfront_ok", "可以买断"],
                      ["subscribe_ok", "可以月租"],
                      ["any", "都能接受"],
                    ] as const
                  ).map(([val, label]) => (
                    <label
                      key={val}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <RadioGroupItem value={val} />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </>
          )}

          {/* Step 4: 配置偏好（新增） */}
          {step === 4 && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  选择你特别在意的配置（不选则不作为加分项）
                </Label>
                <p className="text-xs text-muted-foreground -mt-1">
                  点击卡片切换选中状态
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {configOptions.map((opt) => {
                    const isSelected = data.configMustHaves.includes(opt.key);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => toggleConfig(opt.key)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:bg-accent/50 text-muted-foreground"
                        }`}
                      >
                        {opt.icon}
                        <span className="text-xs font-medium leading-tight">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {data.configMustHaves.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    已选 {data.configMustHaves.length} 项
                  </p>
                )}
              </div>
            </>
          )}

          {/* Step 5: 补能偏好 */}
          {step === 5 && (
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
              <div className="space-y-3">
                <Label className="text-sm font-medium">最常用的充电方式</Label>
                <RadioGroup
                  value={data.chargingPreference}
                  onValueChange={(v) =>
                    update("chargingPreference", v as Survey["chargingPreference"])
                  }
                  className="space-y-2"
                >
                  {(
                    [
                      ["slow_home", "家充慢充为主", "每天回家插上，早起满电"],
                      ["fast_public", "公共快充为主", "快充站充30-60分钟"],
                      ["ultra_fast", "超快充为主", "800V超充15-20分钟"],
                      ["battery_swap", "换电为主", "换电站3分钟满电"],
                    ] as const
                  ).map(([val, label, desc]) => (
                    <label
                      key={val}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <RadioGroupItem value={val} className="mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">{label}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </>
          )}

          {/* Step 6: 驾驶风格（新增） */}
          {step === 6 && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  你的驾驶风格偏好
                </Label>
                <RadioGroup
                  value={data.driveStyle}
                  onValueChange={(v) =>
                    update("driveStyle", v as Survey["driveStyle"])
                  }
                  className="space-y-2"
                >
                  {(
                    [
                      ["comfort", "舒适为主", "追求安静平顺，底盘柔软舒适"],
                      ["sporty", "运动为主", "追求加速推背感，悬挂硬朗"],
                      ["balanced", "均衡", "两者都要，不走极端"],
                    ] as const
                  ).map(([val, label, desc]) => (
                    <label
                      key={val}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <RadioGroupItem value={val} className="mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">{label}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  NVH（噪音振动舒适性）重视度
                </Label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-12">
                    不在意
                  </span>
                  <Slider
                    data-testid="slider-nvr"
                    value={[data.nvrImportance]}
                    onValueChange={([v]) => update("nvrImportance", v)}
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    非常看重
                  </span>
                  <span className="text-lg font-semibold w-6 text-center">
                    {data.nvrImportance}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Step 7: 品牌态度 */}
          {step === 7 && (
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

          {/* Step 8: 资金与风险 */}
          {step === 8 && (
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

          {/* Step 9: 换车周期 */}
          {step === 9 && (
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
