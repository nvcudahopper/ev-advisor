# Car Data Schema Reference

Each car needs these fields for carData.ts:

## Required Fields
- id, brand, model
- priceRange: [low, high] in 万元
- bodyType: "suv" | "sedan"
- powerType: "bev" | "erev"
- canSwapBattery: boolean
- cltcRange (km), realWorldRange (km)
- supportsFastCharge, supportsUltraCharge: boolean
- swapNetworkMaturity: 0-10
- highwayNoa, cityNoa, memoryParking: 0-10
- infotainmentScore: 0-10, ecosystem: string
- seatComfort, soundInsulation, suspensionScore, rearSpace: 0-10
- brandPremium, serviceNetwork, afterSalesScore: 0-10
- resaleRate1Year, resaleRate3Year, resaleRate5Year: 0-1
- bodyLength, bodyWidth, bodyHeight, wheelbase: mm
- platePolicy: { beijing, shanghai, shenzhen, guangzhou, hangzhou, chengdu }
  - bev: all "green_plate" / shanghai "free_green"
  - erev: beijing "restricted", shanghai "bid_plate", shenzhen "restricted", rest "green_plate"
- special: {} (optional fields)
- highlights: string[], risks: string[]
- adsLevel, adsCostMode, adsCostUpfront, adsPlatform, autoSummon, autoPark
- hasFrunk, hasRearScreen, hasRearSunshade, hasAirSuspension
- hasVentilatedSeats, hasHeatedSeats, hasMassageSeats: "none"|"front"|"front_rear"
- hasHud, hasPhysicalButtons, hasWirelessCharge, hasElectricTailgate
- hasV2L, audioBrand, hasFramelessDoor, hasPowerDoor, has360Camera, hasDigitalKey
- maxChargePower (kW), charge10to80min (min), hasHomeChargerIncluded
- nvhScore, sportinessScore: 0-10, zeroto100: seconds
</content>
</invoke>