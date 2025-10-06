    // src/lib/aqi.ts
    export type AQIBreakdown = { aqi: number; category: string; byPollutant: { pm25?: number; o3?: number; no2?: number } };

    type Bp = { Clow: number; Chigh: number; Ilow: number; Ihigh: number };

    const PM25_BP: Bp[] = [
    { Clow: 0.0,   Chigh: 12.0,  Ilow: 0,   Ihigh: 50 },
    { Clow: 12.1,  Chigh: 35.4,  Ilow: 51,  Ihigh: 100 },
    { Clow: 35.5,  Chigh: 55.4,  Ilow: 101, Ihigh: 150 },
    { Clow: 55.5,  Chigh: 150.4, Ilow: 151, Ihigh: 200 },
    { Clow: 150.5, Chigh: 250.4, Ilow: 201, Ihigh: 300 },
    { Clow: 250.5, Chigh: 500.4, Ilow: 301, Ihigh: 500 },
    ];

    const O3_BP: Bp[] = [
    { Clow: 0,   Chigh: 54,  Ilow: 0,   Ihigh: 50 },
    { Clow: 55,  Chigh: 70,  Ilow: 51,  Ihigh: 100 },
    { Clow: 71,  Chigh: 85,  Ilow: 101, Ihigh: 150 },
    { Clow: 86,  Chigh: 105, Ilow: 151, Ihigh: 200 },
    { Clow: 106, Chigh: 200, Ilow: 201, Ihigh: 300 },
    ];

    // NO2 en ppb; si te llega en µg/m3 luego conviertes: ppb ≈ 0.522 * µg/m3
    const NO2_BP: Bp[] = [
    { Clow: 0,   Chigh: 53,   Ilow: 0,   Ihigh: 50 },
    { Clow: 54,  Chigh: 100,  Ilow: 51,  Ihigh: 100 },
    { Clow: 101, Chigh: 360,  Ilow: 101, Ihigh: 150 },
    { Clow: 361, Chigh: 649,  Ilow: 151, Ihigh: 200 },
    { Clow: 650, Chigh: 1249, Ilow: 201, Ihigh: 300 },
    ];

    function lerpAQI(C: number, table: Bp[]): number | undefined {
    for (const { Clow, Chigh, Ilow, Ihigh } of table) {
        if (C >= Clow && C <= Chigh) {
        return Math.round(((Ihigh - Ilow) / (Chigh - Clow)) * (C - Clow) + Ilow);
        }
    }
    return undefined;
    }

    export function aqiCategory(aqi: number): string {
    if (aqi <= 50) return "Bueno";
    if (aqi <= 100) return "Moderado";
    if (aqi <= 150) return "Dañino p/grupos sensibles";
    if (aqi <= 200) return "Dañino";
    if (aqi <= 300) return "Muy dañino";
    return "Peligroso";
    }

    export function computeAQI(input: { pm25?: number; o3?: number; no2?: number; units?: { o3?: "ppb"|"µg/m3"; no2?: "ppb"|"µg/m3" } }): AQIBreakdown | null {
    const units = input.units || {};
    let { pm25, o3, no2 } = input;

    if (typeof o3 === "number" && units.o3 === "µg/m3") o3 = o3 * 0.5;     // aprox
    if (typeof no2 === "number" && units.no2 === "µg/m3") no2 = no2 * 0.522;

    const byPollutant = {
        pm25: typeof pm25 === "number" ? lerpAQI(pm25, PM25_BP) : undefined,
        o3:   typeof o3   === "number" ? lerpAQI(o3,   O3_BP)   : undefined,
        no2:  typeof no2  === "number" ? lerpAQI(no2,  NO2_BP)  : undefined,
    };

    const vals = Object.values(byPollutant).filter((v): v is number => typeof v === "number");
    if (vals.length === 0) return null;

    const aqi = Math.max(...vals);
    return { aqi, category: aqiCategory(aqi), byPollutant };
    }
