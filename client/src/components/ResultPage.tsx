import type { DecisionResult } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  RotateCcw,
  Trophy,
  CreditCard,
  CalendarClock,
  Star,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Fuel,
} from "lucide-react";

interface Props {
  result: DecisionResult;
  onRestart: () => void;
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < count
              ? "text-yellow-500 fill-yellow-500"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export default function ResultPage({ result, onRestart }: Props) {
  const { topCars, purchaseMethods, exitStrategy, selectedCarForFinance } =
    result;

  return (
    <div className="space-y-8">
      {/* Section 1: Top Cars */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">最适合您的车型</h2>
        </div>

        <div className="space-y-3">
          {topCars.slice(0, 3).map((rec, idx) => (
            <Card
              key={rec.car.id}
              data-testid={`car-card-${idx}`}
              className={
                idx === 0
                  ? "border-primary/30 bg-primary/[0.03]"
                  : ""
              }
            >
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {idx === 0 && (
                      <Badge className="bg-primary text-primary-foreground">
                        最佳匹配
                      </Badge>
                    )}
                    <div>
                      <h3 className="text-base font-semibold">
                        {rec.car.brand} {rec.car.model}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rec.car.priceRange[0]}-{rec.car.priceRange[1]}万 ·{" "}
                        {rec.car.bodyType === "suv" ? "SUV" : "轿车"} ·{" "}
                        {rec.car.powerType === "bev" ? "纯电" : "增程"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {rec.score}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      适配分
                    </span>
                  </div>
                </div>

                <Progress value={rec.score} className="h-1.5 mb-4" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      关键优点
                    </div>
                    {rec.topAdvantages.map((adv, i) => (
                      <p
                        key={i}
                        className="text-xs text-muted-foreground pl-5"
                      >
                        {adv}
                      </p>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      关键风险
                    </div>
                    {rec.topRisks.map((risk, i) => (
                      <p
                        key={i}
                        className="text-xs text-muted-foreground pl-5"
                      >
                        {risk}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Quick specs */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                  <Badge variant="outline" className="text-xs gap-1">
                    {rec.car.powerType === "bev" ? (
                      <Zap className="w-3 h-3" />
                    ) : (
                      <Fuel className="w-3 h-3" />
                    )}
                    {rec.car.powerType === "bev" ? "纯电" : "增程"}{" "}
                    {rec.car.realWorldRange}km
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    智驾 {rec.car.cityNoa}/10
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    3年保值率{" "}
                    {Math.round(rec.car.resaleRate3Year * 100)}%
                  </Badge>
                  {rec.car.canSwapBattery && (
                    <Badge variant="outline" className="text-xs">
                      支持换电
                    </Badge>
                  )}
                  {rec.car.special?.huaweiSmartDriving && (
                    <Badge variant="outline" className="text-xs">
                      华为智驾
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Remaining cars in compact table */}
        {topCars.length > 3 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">
                其他候选车型
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>车型</TableHead>
                    <TableHead className="text-center">适配分</TableHead>
                    <TableHead className="text-center">动力</TableHead>
                    <TableHead className="text-center">价格区间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCars.slice(3).map((rec) => (
                    <TableRow key={rec.car.id}>
                      <TableCell className="text-sm font-medium">
                        {rec.car.brand} {rec.car.model}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {rec.score}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {rec.car.powerType === "bev" ? "纯电" : "增程"}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {rec.car.priceRange[0]}-{rec.car.priceRange[1]}万
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Section 2: Purchase Methods */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">购车方式对比</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          以 {selectedCarForFinance.brand} {selectedCarForFinance.model}
          （指导价中位{" "}
          {(
            (selectedCarForFinance.priceRange[0] +
              selectedCarForFinance.priceRange[1]) /
            2
          ).toFixed(1)}
          万元）为例
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {purchaseMethods.map((pm) => (
            <Card key={pm.method} data-testid={`purchase-${pm.method}`}>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{pm.label}</h3>
                  <Stars count={pm.recommendation} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-md bg-muted/50">
                    <p className="text-xs text-muted-foreground">
                      3年总折旧
                    </p>
                    <p className="text-base font-bold">
                      {pm.totalCost3Year.toFixed(1)}
                      <span className="text-xs font-normal">万</span>
                    </p>
                  </div>
                  <div className="p-2 rounded-md bg-muted/50">
                    <p className="text-xs text-muted-foreground">
                      月均成本
                    </p>
                    <p className="text-base font-bold">
                      {(pm.monthlyCost * 10000).toFixed(0)}
                      <span className="text-xs font-normal">元/月</span>
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-start gap-1">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                    {pm.advantage}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    {pm.disadvantage}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 3: Exit Strategy */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">退出策略</h2>
        </div>

        <Card data-testid="exit-strategy-card">
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-primary/[0.05] text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  建议持有期限
                </p>
                <p className="text-lg font-bold text-primary">
                  {exitStrategy.holdingPeriodMonths[0]}-
                  {exitStrategy.holdingPeriodMonths[1]}
                </p>
                <p className="text-xs text-muted-foreground">个月</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  预估残值
                </p>
                <p className="text-lg font-bold">
                  {exitStrategy.estimatedResidualValue[0].toFixed(1)}-
                  {exitStrategy.estimatedResidualValue[1].toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">万元</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  月均折旧
                </p>
                <p className="text-lg font-bold">
                  {(exitStrategy.monthlyDepreciation * 10000).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">元/月</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm leading-relaxed">
                {exitStrategy.explanation}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  提醒：新能源车技术迭代快，智驾硬件升级、纯电平台换代、电池技术革新等因素都可能影响二手车残值。以上为基于当前市场的估算，实际情况可能有所不同。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Restart */}
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          onClick={onRestart}
          data-testid="btn-restart"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          重新填写问卷
        </Button>
      </div>
    </div>
  );
}
