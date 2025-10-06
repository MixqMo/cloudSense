// src/app.tsx
import { useEffect, useMemo, useState } from "react";

// UI (ajusta paths reales de tu proyecto)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { CitySearch } from "./components/CitySearch";
import { AirQualityIndicator } from "./components/AirQualityIndicator";
import { AirQualityMap } from "./components/AirQualityMap";
import { WeatherCard } from "./components/WeatherCard";
import { WeatherForecast } from "./components/WeatherForecast";
import { RecommendedActivities } from "./components/RecommendedActivities";
import { ActivitiesToAvoid } from "./components/ActivitiesToAvoid";
import { HealthInformation } from "./components/HealthInformation";

// ---- SHIMS para sortear tipos de props durante la integración ----
const CitySearchAny = CitySearch as any;
const AirQualityIndicatorAny = AirQualityIndicator as any;
const AirQualityMapAny = AirQualityMap as any;
const WeatherForecastAny = WeatherForecast as any;
const RecommendedActivitiesAny = RecommendedActivities as any;
const ActivitiesToAvoidAny = ActivitiesToAvoid as any;
const HealthInformationAny = HealthInformation as any;
// ------------------------------------------------------------------

import { fetchOpenAQ, OpenAQPoint, OpenAQSummary } from "./services/openaq";

const GIBS_BASEMAP = {
  // Nivel de zoom práctico para ciudades; puedes subir a Level9 si tu mapa lo permite
  url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief/default/2013-12-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg",
  attribution:
    'Imagery © NASA GIBS BlueMarble_ShadedRelief (2013-12-01), WMTS via gibs.earthdata.nasa.gov',
};

// === AQI utils (inline) ===
type AQIBreakdown = {
  aqi: number;
  category: string;
  byPollutant: { pm25?: number; o3?: number; no2?: number };
};

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

function aqiCategory(aqi: number): string {
  if (aqi <= 50) return "Bueno";
  if (aqi <= 100) return "Moderado";
  if (aqi <= 150) return "Dañino p/grupos sensibles";
  if (aqi <= 200) return "Dañino";
  if (aqi <= 300) return "Muy dañino";
  return "Peligroso";
}

function computeAQI(input: {
  pm25?: number; o3?: number; no2?: number;
  units?: { o3?: "ppb"|"µg/m3"; no2?: "ppb"|"µg/m3" }
}): AQIBreakdown | null {
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
// === /AQI utils (inline) ===

type City = { name: string; country?: string; lat: number; lon: number };

type AQIState =
  | {
      value: number;
      category: string;
      byPollutant: { pm25?: number; o3?: number; no2?: number };
      timeISO?: string;
    }
  | null;

export default function App() {
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [openAQPoints, setOpenAQPoints] = useState<OpenAQPoint[]>([]);
  const [openAQSummary, setOpenAQSummary] = useState<OpenAQSummary | null>(null);
  const [aqi, setAqi] = useState<AQIState>(null);

  const [weatherNow, setWeatherNow] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);

  const defaultCity = useMemo<City>(() => {
    const name = import.meta.env.VITE_DEFAULT_CITY || "Guatemala City";
    const lat = Number(import.meta.env.VITE_DEFAULT_LAT ?? 14.6349);
    const lon = Number(import.meta.env.VITE_DEFAULT_LON ?? -90.5069);
    return { name, lat, lon };
  }, []);

  useEffect(() => {
    handleSearch(defaultCity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(selected: City) {
    setCity(selected);
    setLoading(true);
    setErrorMsg(null);

    try {
      const { points, summary } = await fetchOpenAQ(selected.lat, selected.lon);
      setOpenAQPoints(points);
      setOpenAQSummary(summary);

      const result = computeAQI({
        pm25: summary.pm25,
        o3: summary.o3,
        no2: summary.no2,
        units: { o3: "ppb", no2: "ppb" },
      }) as AQIBreakdown | null;

      if (result) {
        setAqi({
          value: result.aqi,
          category: result.category,
          byPollutant: {
            pm25: result.byPollutant.pm25,
            o3: result.byPollutant.o3,
            no2: result.byPollutant.no2,
          },
          timeISO: summary.timeISO,
        });
      } else {
        setAqi(null);
      }

      // (Paso 5) futuro: MERRA-2
      setWeatherNow(null);
      setForecast([]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Ocurrió un error obteniendo datos.");
    } finally {
      setLoading(false);
    }
  }

  const cityName = city?.name ?? defaultCity.name;

  return (
    <main className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">CloudSense — Air & Weather Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Ciudad: <span className="font-medium">{cityName}</span>
            {aqi?.timeISO ? (
              <span className="ml-2 text-xs opacity-80">
                (actualizado: {new Date(aqi.timeISO).toLocaleString()})
              </span>
            ) : null}
          </p>
        </div>
        <div className="max-w-md w-full">
          <CitySearchAny onSelect={handleSearch} defaultValue={cityName} />
        </div>
      </header>

      {loading && <div className="mb-4 text-sm"><span className="animate-pulse">Obteniendo datos…</span></div>}
      {errorMsg && <div className="mb-4 text-sm text-red-600">{errorMsg}</div>}

      <Tabs defaultValue="air" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="air">Calidad del aire</TabsTrigger>
          <TabsTrigger value="weather">Clima</TabsTrigger>
          <TabsTrigger value="health">Salud</TabsTrigger>
        </TabsList>

        {/* --- Pestaña: Calidad del aire --- */}
      <TabsContent value="air" className="space-y-4">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <AirQualityIndicatorAny
              aqi={aqi?.value ?? null}
              category={aqi?.category ?? "—"}
              breakdown={aqi?.byPollutant ?? {}}
              updatedAt={aqi?.timeISO ?? undefined}
            />
            <div className="mt-4 space-y-3">
              <RecommendedActivitiesAny aqi={aqi?.value ?? null} weather={weatherNow} />
              <ActivitiesToAvoidAny aqi={aqi?.value ?? null} weather={weatherNow} />
            </div>
          </div>
          <div className="lg:col-span-2">
            <AirQualityMapAny
              stations={openAQPoints}
              city={cityName}
              baseUrl={GIBS_BASEMAP.url}
              attribution={GIBS_BASEMAP.attribution}
            />
          </div>
        </section>
      </TabsContent>


        {/* --- Pestaña: Clima --- */}
        <TabsContent value="weather" className="space-y-4">
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <WeatherCard weather={weatherNow} />
            </div>
            <div className="lg:col-span-2">
              <WeatherForecastAny items={forecast} />
            </div>
          </section>
        </TabsContent>

        {/* --- Pestaña: Salud --- */}
        <TabsContent value="health" className="space-y-4">
          <HealthInformationAny
            aqi={aqi?.value ?? null}
            category={aqi?.category ?? "—"}
            breakdown={aqi?.byPollutant ?? {}}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
