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
  timeISO?: string;
};

const OPENAQ_BASE = import.meta.env.VITE_OPENAQ_BASE || "/openaq";
const OPENAQ_API_KEY = import.meta.env.VITE_OPENAQ_API_KEY || "";

function mapV3(results: any[]): OpenAQPoint[] {
  return (results ?? [])
    .map((r: any) => ({
      id: String(r?.id ?? `${r?.location}-${r?.parameter}-${r?.datetime}`),
      lat: r?.coordinates?.latitude,
      lon: r?.coordinates?.longitude,
      parameter: r?.parameter,
      value: r?.value,
      unit: r?.unit,
      timeISO: r?.datetime,
      location: r?.location,
    }))
    .filter(
      (p: OpenAQPoint) =>
        Number.isFinite(p.lat) && Number.isFinite(p.lon) && typeof p.value === "number"
    );
}

function summarize(points: OpenAQPoint[]): OpenAQSummary {
  const latestByParam: Record<string, OpenAQPoint | undefined> = {};
  for (const p of points) {
    const k = p.parameter;
    if (!latestByParam[k] || p.timeISO > (latestByParam[k]!.timeISO)) {
      latestByParam[k] = p;
    }
  }
  return {
    pm25: latestByParam.pm25?.value,
    o3: latestByParam.o3?.value,
    no2: latestByParam.no2?.value,
    timeISO:
      latestByParam.pm25?.timeISO ||
      latestByParam.o3?.timeISO ||
      latestByParam.no2?.timeISO,
  };
}

export async function fetchOpenAQ(lat: number, lon: number, radiusMeters = 20000) {
  // 🚫 Sin API key: no llamamos a la API; devolvemos vacío sin romper el flujo.
  if (!OPENAQ_API_KEY) {
    console.warn(
      "[OpenAQ] Sin VITE_OPENAQ_API_KEY; OpenAQ desactivado. Pon la key para habilitarlo."
    );
    return { points: [], summary: {} as OpenAQSummary };
  }

  const params = new URLSearchParams({
    coordinates: `${lat},${lon}`,
    radius: String(radiusMeters),
    limit: "100",
    sort: "desc",
    order_by: "datetime",
    parameters: "pm25,o3,no2",
  });

  const url = `${OPENAQ_BASE.replace(/\/$/, "")}/measurements?${params.toString()}`;
  const headers: Record<string, string> = {
    "X-API-Key": OPENAQ_API_KEY,
    Authorization: `Bearer ${OPENAQ_API_KEY}`,
  };

  const res = await fetch(url, { headers });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("OpenAQ v3: 401 Unauthorized (API key faltante o inválida)");
    }
    throw new Error(`OpenAQ v3 error ${res.status}`);
  }
  const data = await res.json();
  const points = mapV3(data?.results);
  return { points, summary: summarize(points) };
}
