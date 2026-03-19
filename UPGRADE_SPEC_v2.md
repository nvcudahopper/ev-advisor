# 升级规格 v2：限行政策 + 车身尺寸

## 一、新增字段

### Survey 新增字段（schema.ts surveySchema 内部）

```ts
// 所在城市（限行政策）— 新增在问卷最前面（Step 1）
city: z.enum(["beijing", "shanghai", "shenzhen", "guangzhou", "hangzhou", "chengdu", "other"]),

// 停车难度 — 新增在 Step 2 家庭空间
parkingDifficulty: z.enum(["easy", "moderate", "tight"]),  // 宽松/一般/紧张
preferCompactSize: z.boolean(),  // 是否倾向紧凑车身
```

### CarModel 新增字段（schema.ts CarModel 接口）

```ts
// 车身尺寸
bodyLength: number;      // 车长 mm
bodyWidth: number;       // 车宽 mm
bodyHeight: number;      // 车高 mm
wheelbase: number;       // 轴距 mm

// 牌照政策
platePolicy: {
  beijing: "green_plate" | "restricted" | "no_plate";  // 北京：纯电绿牌不限行 / 增程限号 / 不能上牌
  shanghai: "free_green" | "bid_plate" | "no_green";   // 上海：免费绿牌 / 需竞拍 / 无绿牌
  shenzhen: "green_plate" | "restricted";
  guangzhou: "green_plate" | "restricted";
  hangzhou: "green_plate" | "restricted";
  chengdu: "green_plate" | "restricted";
};
```

## 二、车身尺寸数据（已搜索确认）

| 车型 | 长mm | 宽mm | 高mm | 轴距mm |
|------|------|------|------|--------|
| 理想 L7 | 5050 | 1995 | 1750 | 3005 |
| 理想 L8 | 5080 | 1995 | 1800 | 3005 |
| 理想 L9 | 5218 | 1998 | 1800 | 3105 |
| 蔚来 ES6 | 4854 | 1995 | 1703 | 2915 |
| 蔚来 ET5 | 4790 | 1960 | 1499 | 2888 |
| 小鹏 G6 | 4753 | 1920 | 1650 | 2890 |
| 小鹏 G9 | 4891 | 1937 | 1670 | 2998 |
| 特斯拉 Model 3 | 4720 | 1848 | 1442 | 2875 |
| 特斯拉 Model Y | 4750 | 1921 | 1624 | 2890 |
| 问界 M5 | 4785 | 1930 | 1620 | 2880 |
| 问界 M7 | 5020 | 1945 | 1760 | 2820 |
| 阿维塔 11 | 4880 | 1970 | 1601 | 2975 |

## 三、牌照政策规则

### 北京
- **纯电(bev)**: 新能源绿牌，不限行。  platePolicy.beijing = "green_plate"
- **增程(erev)/插混**: 按燃油车管理，尾号限行（工作日7-20时）。 platePolicy.beijing = "restricted"

### 上海
- **纯电(bev)**: 可申请免费专用牌照额度（绿牌）。 platePolicy.shanghai = "free_green"
- **增程(erev)/插混**: 2023年起不再发放免费绿牌，需竞拍沪牌（约10万元）。 platePolicy.shanghai = "bid_plate"

### 深圳
- **纯电(bev)**: 绿牌不限行。 platePolicy.shenzhen = "green_plate"
- **增程(erev)**: 可上绿牌但某些高峰时段受限。 platePolicy.shenzhen = "restricted"

### 广州
- **纯电(bev)**: 新能源绿牌。 platePolicy.guangzhou = "green_plate"
- **增程(erev)**: 可上绿牌，暂无限行。 platePolicy.guangzhou = "green_plate"

### 杭州/成都
- **所有新能源**: 暂无限行，绿牌即可。 platePolicy.hangzhou / chengdu = "green_plate"

## 四、决策引擎改动

### 1. 限行过滤/惩罚（在 scoreCar 中）
- 如果用户选了北京 + 车是增程 → 扣重分（直接减20分或者把powerType得分砍半）
- 如果用户选了上海 + 车是增程 → 扣分（需额外约10万拍牌费用，在价格维度中体现）
- 如果用户选了 "other" → 不做限行惩罚

### 2. 车身尺寸评分（新增权重维度 `sizeParking`）
权重基础: 0.04

- 用户选"停车紧张" → 权重上调至 0.08
  - 车长 <4800mm → 100分
  - 车长 4800-5000mm → 70分
  - 车长 >5000mm → 40分
  - 车宽 <1930mm → 额外+10
  - 车宽 >1990mm → 额外-10
  
- 用户选"停车一般" → 权重 0.04
  - 适当缩放

- 用户选"停车宽松" → 权重降至 0.01（基本不影响）

- preferCompactSize=true → sizeParking权重再+0.03

### 3. 新增computeWeights中的城市限行权重逻辑
不是独立权重，而是直接在 powerType 分数计算中：
```
if city=beijing && car.powerType=erev → powerScore *= 0.3 (严重惩罚)
if city=shanghai && car.powerType=erev → 在price维度减10分(竞拍成本)
```

## 五、问卷UI改动

### Step 1 使用场景 → 头部新增"所在城市"
- RadioGroup: 北京 / 上海 / 深圳 / 广州 / 杭州 / 成都 / 其他
- 如果选北京，出现提示："北京增程/插混按燃油车管理，工作日限行"
- 如果选上海，出现提示："上海增程/插混需竞拍沪牌（约10万元）"

### Step 2 家庭空间 → 新增停车相关
- "您平时停车难度如何？" RadioGroup: 宽松 / 一般 / 紧张
  - 紧张: 地库车位窄、经常路边停车
- "倾向紧凑车身？" Switch
  - 描述: "方便停车和城市驾驶"

## 六、对比面板改动（ComparisonPanel.tsx）

### 新增对比维度
```ts
{
  key: "bodySize",
  label: "车身尺寸",
  icon: <Ruler />,
  extract: (c) => {
    // 越小越好评分（针对停车）: 4700mm=100, 5200mm=0
    return Math.max(0, Math.min(100, ((5200 - c.bodyLength) / 500) * 100));
  },
  desc: "车身长度（越紧凑越易停车）"
}
```

### 关键参数对比表新增行
- 车身尺寸: 如 "5218×1998×1800mm"
- 限行政策: 如 "北京限行" / "不限行"

## 七、结果页改动（ResultPage.tsx）

### 新增标签
- 如果车长>5000mm → 显示"大尺寸"标签（黄色警告）
- 如果用户城市=北京 且 车=增程 → 显示"⚠️ 北京限行"红色标签
- 如果用户城市=上海 且 车=增程 → 显示"⚠️ 需竞拍沪牌"红色标签

## 八、确认页改动（ConfirmPage.tsx）
- 新增显示：所在城市、停车难度

## 九、defaultSurvey 初始值
```ts
city: "other",
parkingDifficulty: "moderate",
preferCompactSize: false,
```
