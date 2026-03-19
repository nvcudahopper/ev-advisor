# 电动车决策系统升级规格 — 细节维度全面扩展

## 一、问卷新增/细化的问题维度

### 1. 智驾细化（拆分原来的 1-5 粗分）
目前只有 `smartDrivingImportance: 1-5`，太粗。新增：
- **`adsPriority`**: `"must_have" | "nice_to_have" | "dont_care"` — 智驾对你来说是必须还是加分项？
- **`adsUseCases`**: `("highway_noa" | "city_noa" | "memory_parking" | "auto_park" | "summon")[]` — 你最需要哪些智驾功能？(多选)
- **`adsCostTolerance`**: `"free_only" | "pay_upfront_ok" | "subscribe_ok" | "any"` — 你接受智驾额外付费吗？
  - 这很关键！特斯拉FSD买断6.4万/EAP买断3.2万，华为ADS Max买断3.6万或720元/月，小鹏Ultra加2万硬件费，而理想/小米/蔚来/比亚迪/领克等大部分品牌免费

### 2. 配置细节偏好（新增全部）
用户可勾选"特别在意"的配置（多选），不勾选则权重归零：
- **`configMustHaves`**: `string[]` 从以下选项中多选：
  - `"frunk"` — 前备箱（特斯拉有，国产多数无）
  - `"rear_screen"` — 后排娱乐屏（理想标配，特斯拉无，蔚来部分有）
  - `"rear_sunshade"` — 后排遮阳帘/电动遮阳帘（很多新能源没有，只有全景天幕）
  - `"air_suspension"` — 空气悬挂（影响舒适性和通过性）
  - `"ventilated_seats"` — 座椅通风（前排/前后排）
  - `"heated_seats"` — 座椅加热（基本都有，但后排不一定）
  - `"massage_seats"` — 座椅按摩
  - `"hud"` — HUD抬头显示
  - `"physical_buttons"` — 实体按键/旋钮（很多人讨厌全触摸）
  - `"wireless_charge"` — 手机无线充电
  - `"electric_tailgate"` — 电动/感应尾门
  - `"v2l"` — 外放电（车辆对外供电，露营神器）
  - `"audio_premium"` — 高端音响（哈曼卡顿/Bose/丹拿等）
  - `"frameless_door"` — 无框车门（有人喜欢，有人觉得隔音差）
  - `"power_door"` — 电吸门/电动门
  - `"dash_cam_360"` — 360全景影像/行车记录仪内置
  - `"nfc_key"` — NFC手机钥匙/UWB数字钥匙

### 3. 补能细化
- **`hasHomeCharger`**: `boolean` — 是否有家充桩？（对纯电体验影响巨大）
- **`chargingPreference`**: `"slow_home" | "fast_public" | "ultra_fast" | "battery_swap"` — 最常用的充电方式
- **`longTripFrequency`**: `"rarely" | "monthly" | "weekly"` — 长途出行频率（影响增程vs纯电决策）

### 4. 驾驶风格偏好（新增）
- **`driveStyle`**: `"comfort" | "sporty" | "balanced"` — 偏舒适/运动/均衡
- **`nvrImportance`**: `1-5` — NVH（噪音振动）重视度

## 二、车型数据 CarModel 新增字段

在 `shared/schema.ts` 的 CarModel 接口中新增：

```ts
// === 智驾费用相关 ===
adsLevel: "L2" | "L2+" | "L2++" | "L3_highway"; // 智驾等级
adsCostMode: "free" | "upfront" | "subscribe" | "both"; // 收费模式
adsCostUpfront?: number;   // 买断价格（万元），free则为0
adsCostMonthly?: number;   // 月订阅价格（元/月）
adsCostYearly?: number;    // 年订阅价格（元/年）
adsIncludedYears?: number; // 免费包含年数（如蔚来NAD 5年免费）
adsPlatform: string;       // 如 "FSD V13" "ADS 3.0" "XNGP/VLA" "AD Max" "HAD" "天神之眼"
autoSummon: boolean;       // 召唤功能
autoPark: number;          // 自动泊车评分 0-10

// === 细节配置 ===
hasFrunk: boolean;           // 前备箱
frunkVolume?: number;        // 前备箱容积（L）
hasRearScreen: boolean;      // 后排娱乐屏
hasRearSunshade: boolean;    // 后排遮阳帘
hasAirSuspension: boolean;   // 空气悬挂
hasVentilatedSeats: "none" | "front" | "front_rear"; // 座椅通风
hasHeatedSeats: "none" | "front" | "front_rear";     // 座椅加热
hasMassageSeats: "none" | "front" | "front_rear";    // 座椅按摩
hasHud: boolean;             // HUD
hasPhysicalButtons: boolean; // 实体按键（方向盘/中控）
hasWirelessCharge: boolean;  // 无线充电
hasElectricTailgate: boolean; // 电动/感应尾门
hasV2L: boolean;             // 外放电
audioBrand: string;          // 音响品牌 "哈曼卡顿" "Bose" "丹拿" "自研" etc
hasFramelessDoor: boolean;   // 无框车门
hasPowerDoor: boolean;       // 电吸门
has360Camera: boolean;       // 360全景
hasDigitalKey: boolean;      // 数字钥匙NFC/UWB

// === 补能细化 ===
maxChargePower: number;      // 最大充电功率kW（如800V的可达400kW+）
charge10to80min: number;     // 10-80%快充时间（分钟）
hasHomeChargerIncluded: boolean; // 是否随车送家充桩

// === NVH与驾驶感受 ===
nvhScore: number;            // NVH综合评分 0-10
sportinessScore: number;     // 运动性评分 0-10
zeroto100: number;           // 百公里加速（秒）
```

## 三、12款车的新字段数据（根据搜索结果整理）

### 智驾费用数据（2026年最新）
| 品牌 | 智驾方案 | 收费模式 | 买断价 | 订阅价 |
|------|----------|----------|--------|--------|
| 特斯拉 | EAP(高速NOA) | 买断 | 3.2万 | - |
| 特斯拉 | FSD(城市NOA) | 买断 | 6.4万 | - |
| 小鹏 | XNGP MAX(城市NOA) | 免费 | 0 | - |
| 小鹏 | Ultra SE(二代VLA) | 硬件加价 | 1.2万 | - |
| 小鹏 | Ultra(二代VLA) | 硬件加价 | 2万 | - |
| 华为 | ADS SE(高速NOA) | 买断/订阅 | 0.5万 | 100元/月 |
| 华为 | ADS Max(城市NOA) | 买断/订阅 | 3.6万 | 720元/月 |
| 蔚来 | NAD(城市NOA) | 5年免费 | 0 | - |
| 理想 | AD Pro/Max(城市NOA) | 免费 | 0 | - |
| 小米 | HAD(城市NOA) | 免费 | 0 | - |
| 阿维塔 | ADS(华为方案) | 买断/订阅 | 3.6万 | 720元/月 |

### 配置数据（需要逐车型填充）
- 前备箱：特斯拉Model 3/Y有(约88L)，其他品牌基本无
- 后排屏：理想L7/L8/L9标配，蔚来ES6部分有，特斯拉/小鹏无
- 遮阳帘：理想有，蔚来有物理遮阳帘，小鹏G9无，特斯拉无
- 空气悬挂：蔚来ES6标配，小鹏G9标配，理想L9标配，理想L7/L8部分配，特斯拉Model Y无
- 座椅通风/按摩：理想全系标配前排通风加热按摩，特斯拉仅加热
- HUD：小鹏G6/G9有，理想有，特斯拉无
- 实体按键：蔚来方向盘有实体按键，特斯拉极简无实体
- V2L外放电：蔚来有，比亚迪有，特斯拉无

## 四、决策引擎权重调整逻辑

核心思想：**用户说什么最重要，什么就权重最高；没勾选的配置权重归零。**

1. 如果用户选 `adsPriority = "must_have"`，智驾相关权重翻倍
2. 如果用户选 `adsCostTolerance = "free_only"`，有额外收费的车型扣分
3. `configMustHaves` 中每个勾选项生成一个匹配分：车有=满分，车无=0分。这些分加权进总分。
4. 如果用户有家充 `hasHomeCharger = true`，纯电车不扣"充电不便"分
5. 如果长途多 `longTripFrequency = "weekly"`，增程车大幅加分

## 五、对比面板更新

ComparisonPanel 的 dimensions 数组需新增：
- 智驾费用对比（免费 vs 付费）
- 配置完整度对比（把 configMustHaves 里勾选的项逐项对比）
- NVH/运动性对比
- 充电速度对比

## 六、问卷UI分步调整

原来7步，新增/调整后建议重组为：
1. **使用场景**（保留，加 longTripFrequency、hasHomeCharger）
2. **家庭与空间**（保留）
3. **智驾需求**（拆分细化：adsPriority + adsUseCases + adsCostTolerance）
4. **配置偏好**（新增：configMustHaves 多选网格）
5. **补能偏好**（保留，加 chargingPreference）
6. **驾驶风格**（新增：driveStyle + nvrImportance）
7. **品牌态度**（保留）
8. **资金与风险**（保留）
9. **换车周期**（保留）
