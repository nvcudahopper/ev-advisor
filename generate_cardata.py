#!/usr/bin/env python3
"""Generate carData.ts from JSON research data files + existing cars."""
import json

def get_plate_policy(power_type):
    if power_type == "bev":
        return {
            "beijing": "green_plate",
            "shanghai": "free_green",
            "shenzhen": "green_plate",
            "guangzhou": "green_plate",
            "hangzhou": "green_plate",
            "chengdu": "green_plate",
        }
    else:  # erev
        return {
            "beijing": "restricted",
            "shanghai": "bid_plate",
            "shenzhen": "restricted",
            "guangzhou": "green_plate",
            "hangzhou": "green_plate",
            "chengdu": "green_plate",
        }

def make_id(brand, model):
    brand_map = {
        "比亚迪": "byd", "腾势": "denza", "方程豹": "fangchengbao",
        "深蓝": "deepal", "极氪": "zeekr", "小米": "xiaomi",
        "零跑": "leapmotor", "乐道": "ledao", "智己": "zhiji",
        "智界": "zhijie", "岚图": "voyah", "昊铂": "hyper",
        "飞凡": "feifan", "极狐": "arcfox", "阿维塔": "avatr",
        "问界": "aito",
    }
    b = brand_map.get(brand, brand.lower())
    m = model.lower().replace(" ", "_").replace("-", "_")
    return f"{b}_{m}"

def format_value(val, key=None):
    """Format a Python value as TypeScript literal."""
    if val is None:
        return "0"
    if isinstance(val, bool):
        return "true" if val else "false"
    if isinstance(val, str):
        return f'"{val}"'
    if isinstance(val, list):
        if len(val) == 2 and all(isinstance(x, (int, float)) for x in val):
            return f"[{val[0]}, {val[1]}]"
        items = ", ".join(f'"{x}"' if isinstance(x, str) else str(x) for x in val)
        return f"[{items}]"
    if isinstance(val, dict):
        lines = []
        for k, v in val.items():
            lines.append(f'      {k}: {format_value(v)}')
        return "{\n" + ",\n".join(lines) + ",\n    }"
    return str(val)

def car_to_ts(car):
    """Convert a car dict to TypeScript object literal."""
    brand = car["brand"]
    model = car["model"]
    car_id = make_id(brand, model)
    power_type = car.get("powerType", "bev")
    plate_policy = get_plate_policy(power_type)

    # Build special object
    special = {}
    if power_type == "erev":
        special["erevAdvantage"] = car.get("erevAdvantage", "增程无续航焦虑")
    if car.get("canSwapBattery"):
        special["batteryRentalMonthly"] = [728, 1128]
        special["swapCoverage"] = 6
    if "华为" in car.get("adsPlatform", "") or "ADS" in car.get("adsPlatform", ""):
        special["huaweiSmartDriving"] = True

    lines = []
    lines.append("  {")
    lines.append(f'    id: "{car_id}",')
    lines.append(f'    brand: "{brand}",')
    lines.append(f'    model: "{model}",')
    lines.append(f'    priceRange: [{car["priceRange"][0]}, {car["priceRange"][1]}],')
    lines.append(f'    bodyType: "{car.get("bodyType", "suv")}",')
    lines.append(f'    powerType: "{power_type}",')
    lines.append(f'    canSwapBattery: {format_value(car.get("canSwapBattery", False))},')
    lines.append(f'    cltcRange: {car.get("cltcRange", 600)},')
    lines.append(f'    realWorldRange: {car.get("realWorldRange", 480)},')
    lines.append(f'    supportsFastCharge: true,')
    lines.append(f'    supportsUltraCharge: {format_value(car.get("supportsUltraCharge", False))},')
    lines.append(f'    swapNetworkMaturity: {car.get("swapNetworkMaturity", 0)},')

    # Smart driving
    lines.append(f'    highwayNoa: {car.get("highwayNoa", 5)},')
    lines.append(f'    cityNoa: {car.get("cityNoa", 4)},')
    lines.append(f'    memoryParking: {car.get("memoryParking", 5)},')
    lines.append(f'    infotainmentScore: {car.get("infotainmentScore", 7)},')
    lines.append(f'    ecosystem: "{car.get("ecosystem", "自研")}",')

    # Comfort
    lines.append(f'    seatComfort: {car.get("seatComfort", 7)},')
    lines.append(f'    soundInsulation: {car.get("soundInsulation", 7)},')
    lines.append(f'    suspensionScore: {car.get("suspensionScore", 7)},')
    lines.append(f'    rearSpace: {car.get("rearSpace", 7)},')

    # Brand
    lines.append(f'    brandPremium: {car.get("brandPremium", 5)},')
    lines.append(f'    serviceNetwork: {car.get("serviceNetwork", 6)},')
    lines.append(f'    afterSalesScore: {car.get("afterSalesScore", 6)},')

    # Resale
    lines.append(f'    resaleRate1Year: {car.get("resaleRate1Year", 0.75)},')
    lines.append(f'    resaleRate3Year: {car.get("resaleRate3Year", 0.55)},')
    lines.append(f'    resaleRate5Year: {car.get("resaleRate5Year", 0.38)},')

    # Special
    if special:
        sp_lines = []
        for k, v in special.items():
            sp_lines.append(f"      {k}: {format_value(v)}")
        lines.append("    special: {")
        lines.append(",\n".join(sp_lines) + ",")
        lines.append("    },")
    else:
        lines.append("    special: {},")

    # Highlights/Risks
    hl = car.get("highlights", ["性价比高", "空间不错"])
    rk = car.get("risks", ["品牌力待提升", "保值率一般"])
    lines.append(f'    highlights: {format_value(hl)},')
    lines.append(f'    risks: {format_value(rk)},')

    # ADS
    lines.append(f'    adsLevel: "{car.get("adsLevel", "L2+")}",')
    lines.append(f'    adsCostMode: "{car.get("adsCostMode", "free")}",')
    lines.append(f'    adsCostUpfront: {car.get("adsCostUpfront", 0)},')
    if car.get("adsCostMonthly"):
        lines.append(f'    adsCostMonthly: {car["adsCostMonthly"]},')
    if car.get("adsCostYearly"):
        lines.append(f'    adsCostYearly: {car["adsCostYearly"]},')
    if car.get("adsIncludedYears"):
        lines.append(f'    adsIncludedYears: {car["adsIncludedYears"]},')
    lines.append(f'    adsPlatform: "{car.get("adsPlatform", "自研")}",')
    lines.append(f'    autoSummon: {format_value(car.get("autoSummon", False))},')
    lines.append(f'    autoPark: {car.get("autoPark", 5)},')

    # Config
    lines.append(f'    hasFrunk: {format_value(car.get("hasFrunk", False))},')
    if car.get("hasFrunk") and car.get("frunkVolume"):
        lines.append(f'    frunkVolume: {car["frunkVolume"]},')
    lines.append(f'    hasRearScreen: {format_value(car.get("hasRearScreen", False))},')
    lines.append(f'    hasRearSunshade: {format_value(car.get("hasRearSunshade", False))},')
    lines.append(f'    hasAirSuspension: {format_value(car.get("hasAirSuspension", False))},')
    lines.append(f'    hasVentilatedSeats: "{car.get("hasVentilatedSeats", "none")}",')
    lines.append(f'    hasHeatedSeats: "{car.get("hasHeatedSeats", "front")}",')
    lines.append(f'    hasMassageSeats: "{car.get("hasMassageSeats", "none")}",')
    lines.append(f'    hasHud: {format_value(car.get("hasHud", False))},')
    lines.append(f'    hasPhysicalButtons: {format_value(car.get("hasPhysicalButtons", False))},')
    lines.append(f'    hasWirelessCharge: {format_value(car.get("hasWirelessCharge", True))},')
    lines.append(f'    hasElectricTailgate: {format_value(car.get("hasElectricTailgate", True))},')
    lines.append(f'    hasV2L: {format_value(car.get("hasV2L", False))},')
    lines.append(f'    audioBrand: "{car.get("audioBrand", "自研")}",')
    lines.append(f'    hasFramelessDoor: {format_value(car.get("hasFramelessDoor", False))},')
    lines.append(f'    hasPowerDoor: {format_value(car.get("hasPowerDoor", False))},')
    lines.append(f'    has360Camera: {format_value(car.get("has360Camera", True))},')
    lines.append(f'    hasDigitalKey: {format_value(car.get("hasDigitalKey", True))},')

    # Charging
    lines.append(f'    maxChargePower: {car.get("maxChargePower", 150)},')
    lines.append(f'    charge10to80min: {car.get("charge10to80min", 35)},')
    lines.append(f'    hasHomeChargerIncluded: {format_value(car.get("hasHomeChargerIncluded", True))},')

    # NVH/Driving
    lines.append(f'    nvhScore: {car.get("nvhScore", 7)},')
    lines.append(f'    sportinessScore: {car.get("sportinessScore", 5)},')
    lines.append(f'    zeroto100: {car.get("zeroto100", 6.0)},')

    # Body
    lines.append(f'    bodyLength: {car.get("bodyLength", 4800)},')
    lines.append(f'    bodyWidth: {car.get("bodyWidth", 1900)},')
    lines.append(f'    bodyHeight: {car.get("bodyHeight", 1650)},')
    lines.append(f'    wheelbase: {car.get("wheelbase", 2900)},')

    # Plate policy
    lines.append("    platePolicy: {")
    for city, policy in plate_policy.items():
        lines.append(f'      {city}: "{policy}",')
    lines.append("    },")

    lines.append("  }")
    return "\n".join(lines)


# Load existing cars (keep the manually curated ones)
# Load new cars from research
with open("batch1_data.json") as f:
    batch1 = json.load(f)
with open("batch2_data.json") as f:
    batch2 = json.load(f)

new_cars = batch1 + batch2

# Read existing carData.ts to extract existing car entries
with open("server/carData.ts") as f:
    existing_content = f.read()

# Generate new entries
new_entries = []
for car in new_cars:
    new_entries.append(car_to_ts(car))

# Build final file
header = '''/**
 * 车型知识库 — 硬编码典型数据
 * ===========================================
 * 修改说明：直接编辑本文件中的 carDatabase 数组即可新增/修改车型。
 * 每个字段含义参见 shared/schema.ts 中的 CarModel 接口。
 * 评分类字段统一使用 0-10 分制，保值率使用 0-1 小数。
 *
 * 车型总数：{count} 台
 * 覆盖品牌：理想、蔚来、小鹏、特斯拉、问界、阿维塔、比亚迪、腾势、
 *           极氪、小米、零跑、方程豹、深蓝、乐道、智己、智界、岚图
 * 最后更新：2026-03-19
 */

import type {{ CarModel }} from "../shared/schema";

export const carDatabase: CarModel[] = [
'''

# Extract existing entries (between the [ and final ])
import re
# Find the array content
match = re.search(r'export const carDatabase: CarModel\[\] = \[\n(.*?)\n\];', existing_content, re.DOTALL)
if match:
    existing_entries_str = match.group(1)
else:
    existing_entries_str = ""

# Count total
existing_count = existing_content.count("id: \"")
total = existing_count + len(new_cars)

footer = "\n];\n"

final = header.format(count=total)
final += existing_entries_str
final += "\n\n  // ==================== 新增车型 — 2026-03-19 批量采集 ====================\n\n"

# Group new cars by brand
brand_groups = {}
for i, car in enumerate(new_cars):
    b = car["brand"]
    if b not in brand_groups:
        brand_groups[b] = []
    brand_groups[b].append((car, new_entries[i]))

for brand, cars in brand_groups.items():
    final += f"  // ==================== {brand} ====================\n"
    for car, ts in cars:
        final += ts + ",\n"
    final += "\n"

final += footer

with open("server/carData.ts", "w") as f:
    f.write(final)

print(f"Generated carData.ts with {total} cars ({existing_count} existing + {len(new_cars)} new)")
print(f"Brands covered: {', '.join(brand_groups.keys())}")
