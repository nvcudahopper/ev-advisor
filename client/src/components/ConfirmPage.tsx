import type { Survey } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Sparkles } from "lucide-react";

interface Props {
  data: Survey;
  onConfirm: () => void;
  onBack: () => void;
}

const scenarioLabels: Record<string, string> = {
  city_commute: "城市通勤",
  highway_business: "高速商务",
  family_trip: "家庭自驾游",
};

const mileageLabels: Record<string, string> = {
  lt10k: "< 1万公里/年",
  "10k_20k": "1-2万公里/年",
  "20k_30k": "2-3万公里/年",
  gt30k: "> 3万公里/年",
};

const cycleLabels: Record<string, string> = {
  "2_3_years": "2-3年一换",
  "3_5_years": "3-5年一换",
  as_long_as_possible: "能开就不换",
};

const adsPriorityLabels: Record<string, string> = {
  must_have: "必须有",
  nice_to_have: "加分项",
  dont_care: "不在意",
};

const adsCostToleranceLabels: Record<string, string> = {
  free_only: "只要免费",
  pay_upfront_ok: "可以买断",
  subscribe_ok: "可以月租",
  any: "都能接受",
};

const adsUseCaseLabels: Record<string, string> = {
  highway_noa: "高速NOA",
  city_noa: "城市NOA",
  memory_parking: "记忆泊车",
  auto_park: "自动泊车",
  summon: "智能召唤",
};

const chargingPrefLabels: Record<string, string> = {
  slow_home: "家充慢充",
  fast_public: "公共快充",
  ultra_fast: "超快充",
  battery_swap: "换电",
};

const driveStyleLabels: Record<string, string> = {
  comfort: "舒适为主",
  sporty: "运动为主",
  balanced: "均衡",
};

const longTripLabels: Record<string, string> = {
  rarely: "很少",
  monthly: "每月",
  weekly: "每周",
};

const configLabels: Record<string, string> = {
  frunk: "前备箱",
  rear_screen: "后排屏幕",
  rear_sunshade: "遮阳帘",
  air_suspension: "空气悬挂",
  ventilated_seats: "座椅通风",
  heated_seats: "座椅加热",
  massage_seats: "座椅按摩",
  hud: "HUD",
  physical_buttons: "实体按键",
  wireless_charge: "无线充电",
  electric_tailgate: "电动尾门",
  v2l: "外放电",
  audio_premium: "高端音响",
  frameless_door: "无框车门",
  power_door: "电吸门",
  dash_cam_360: "360全景",
  nfc_key: "数字钥匙",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right ml-4">{value}</span>
    </div>
  );
}

export default function ConfirmPage({ data, onConfirm, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">确认您的参数</h2>
        <p className="text-sm text-muted-foreground">
          请核对以下信息，确认后将为您生成个性化购车建议
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            使用场景
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Row
            label="场景"
            value={
              <div className="flex gap-1.5 flex-wrap justify-end">
                {data.usageScenarios.map((s) => (
                  <Badge key={s} variant="secondary">
                    {scenarioLabels[s]}
                  </Badge>
                ))}
              </div>
            }
          />
          <Row label="年行驶里程" value={mileageLabels[data.annualMileage]} />
          <Row label="有家充桩" value={data.hasHomeCharger ? "是" : "否"} />
          <Row label="长途频率" value={longTripLabels[data.longTripFrequency]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            家庭与空间
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="家庭人数" value={`${data.familySize} 人`} />
          <Row label="经常满载" value={data.oftenFullLoad ? "是" : "否"} />
          <Row
            label="大后备箱需求"
            value={data.needLargeTrunk ? "是" : "否"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            智驾需求
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Row
            label="智驾优先级"
            value={adsPriorityLabels[data.adsPriority]}
          />
          <Row
            label="关注功能"
            value={
              <div className="flex gap-1 flex-wrap justify-end">
                {data.adsUseCases.map((u) => (
                  <Badge key={u} variant="secondary" className="text-xs">
                    {adsUseCaseLabels[u]}
                  </Badge>
                ))}
              </div>
            }
          />
          <Row
            label="费用接受度"
            value={adsCostToleranceLabels[data.adsCostTolerance]}
          />
        </CardContent>
      </Card>

      {data.configMustHaves.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">
              在意的配置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1.5 flex-wrap">
              {data.configMustHaves.map((c) => (
                <Badge key={c} variant="secondary" className="text-xs">
                  {configLabels[c] || c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            补能偏好
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="接受纯电" value={data.acceptPureBev ? "是" : "否"} />
          <Row label="倾向增程" value={data.preferErev ? "是" : "否"} />
          <Row
            label="接受换电"
            value={data.acceptBatterySwap ? "是" : "否"}
          />
          <Row
            label="充电方式"
            value={chargingPrefLabels[data.chargingPreference]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            驾驶风格
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="驾驶风格" value={driveStyleLabels[data.driveStyle]} />
          <Row label="NVH重视度" value={`${data.nvrImportance} / 5`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            品牌 & 资金
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Row
            label="国产新势力接受度"
            value={`${data.domesticBrandAcceptance} / 5`}
          />
          <Row
            label="更看重全球品牌"
            value={data.preferGlobalBrand ? "是" : "否"}
          />
          <Row label="最大首付" value={`${data.maxDownPayment} 万元`} />
          <Row label="负债厌恶度" value={`${data.debtAversion} / 5`} />
          {data.hasInvestmentChannel && (
            <Row
              label="预期投资年化"
              value={`${data.expectedInvestmentReturn}%`}
            />
          )}
          <Row label="换车周期" value={cycleLabels[data.replacementCycle]} />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} data-testid="btn-back">
          <ChevronLeft className="w-4 h-4 mr-1" />
          返回修改
        </Button>
        <Button onClick={onConfirm} data-testid="btn-confirm">
          <Sparkles className="w-4 h-4 mr-1" />
          生成推荐
        </Button>
      </div>
    </div>
  );
}
