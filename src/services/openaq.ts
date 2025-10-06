// src/services/openaq.ts
export type OpenAQPoint = {
  id: string;
  lat: number;
  lon: number;
  parameter: "pm25" | "o3" | "no2";
  value: number;
  unit: string;
  timeISO: string;
  location: string;
};

export type OpenAQSummary = {
  pm25?: number;
  o3?: number;
  no2?: number;
  timeISO?: string; // última actualización usada
};

const OPENAQ_BASE = "https://api.openaq.org/v3";

/**
 * Trae últimas mediciones de PM2.5, O3 y NO2 en un radio (m) alrededor de lat/lon.
 * Devuelve puntos para el mapa y un resumen por ciudad.
 */
export async function fetchOpenAQ(lat: number, lon: number, radiusMeters = 20000) {
  const params = new URLSearchParams({
    coordinates: `${lat},${lon}`,
    radius: String(radiusMeters),
    limit: "100",
    sort: "desc",
    order_by: "datetime",
    parameters: "pm25,o3,no2",
  });

  const url = `${OPENAQ_BASE}/measurements?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OpenAQ error ${res.status}`);
  const data = await res.json();

  const points: OpenAQPoint[] = (data?.results ?? []).map((r: any) => ({
    id: String(r?.id ?? `${r.location}-${r.parameter}-${r.datetime}`),
    lat: r.coordinates?.latitude,
    lon: r.coordinates?.longitude,
    parameter: r.parameter,
    value: r.value,
    unit: r.unit,
    timeISO: r.datetime,
    location: r.location,
  })).filter((p: OpenAQPoint) => Number.isFinite(p.lat) && Number.isFinite(p.lon));

  // Tomamos el valor más reciente por parámetro como "resumen"
  const latestByParam: Record<string, OpenAQPoint | undefined> = {};
  for (const p of points) {
    const key = p.parameter;
    if (!latestByParam[key] || (p.timeISO > (latestByParam[key]!.timeISO))) {
      latestByParam[key] = p;
    }
  }

  const summary: OpenAQSummary = {
    pm25: latestByParam["pm25"]?.value,
    o3: latestByParam["o3"]?.value,
    no2: latestByParam["no2"]?.value,
    timeISO: latestByParam["pm25"]?.timeISO || latestByParam["o3"]?.timeISO || latestByParam["no2"]?.timeISO,
  };

  return { points, summary };
}
