    // src/services/merra2.ts
    // NASA POWER (derivado de MERRA-2) — horario: T2M, WS10M, RH2M, PRECTOTCORR
    // Doc: https://power.larc.nasa.gov/docs/services/api/v1/

    export type WeatherNow = {
    timeISO: string;
    temperature: number;      // °C
    windSpeed: number;        // m/s
    humidity: number;         // %
    rainfall: number;         // mm/h (aprox del último registro)
    description: string;      // breve
    };

    export type WeatherForecastItem = {
    timeISO: string;
    temperature: number;
    windSpeed: number;
    humidity: number;
    rain: number;
    };

    function toISO(dateStr: string, hourStr: string) {
    // POWER devuelve fechas YYYYMMDD y horas HHMM (e.g., "1300")
    const yyyy = dateStr.slice(0, 4);
    const mm = dateStr.slice(4, 6);
    const dd = dateStr.slice(6, 8);
    const HH = hourStr.slice(0, 2);
    const MM = hourStr.slice(2, 4);
    // POWER está en UTC; ISO simple:
    return `${yyyy}-${mm}-${dd}T${HH}:${MM}:00Z`;
    }

    export async function fetchMerra2Hourly(lat: number, lon: number, hours = 24) {
    // Traer el día actual (UTC) — para simplificar pedimos 2 días y nos quedamos con las últimas 'hours'
    const now = new Date();
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const start = new Date(end.getTime() - 2 * 24 * 3600 * 1000);

    const f = (d: Date) =>
        `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;

    const url = new URL("https://power.larc.nasa.gov/api/temporal/hourly/point");
    url.searchParams.set("parameters", "T2M,WS10M,RH2M,PRECTOTCORR");
    url.searchParams.set("start", f(start));
    url.searchParams.set("end", f(end));
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set("community", "RE"); // Renewable Energy (cómodo)
    url.searchParams.set("format", "JSON");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`MERRA-2/POWER error ${res.status}`);
    const data = await res.json();

    const parms = data?.properties?.parameter || {};
    const t2m = parms.T2M || {};
    const ws10 = parms.WS10M || {};
    const rh2m = parms.RH2M || {};
    const pre = parms.PRECTOTCORR || {};

    // POWER indexa por llave "YYYYMMDDHHMM"
    const entries: WeatherForecastItem[] = Object.keys(t2m)
        .sort() // ascendente
        .map((k) => {
        const date = k.slice(0, 8);
        const hour = k.slice(8, 12);
        return {
            timeISO: toISO(date, hour),
            temperature: Number(t2m[k]),
            windSpeed: Number(ws10[k]),
            humidity: Number(rh2m[k]),
            rain: Number(pre[k]), // mm/h aprox
        };
        })
        .filter((e) => Number.isFinite(e.temperature));

    // Últimas 'hours'
    const last = entries.slice(-hours);

    // "Ahora" = el último registro disponible
    const nowItem = last[last.length - 1];
    const weatherNow: WeatherNow | null = nowItem
        ? {
            timeISO: nowItem.timeISO,
            temperature: nowItem.temperature,
            windSpeed: nowItem.windSpeed,
            humidity: nowItem.humidity,
            rainfall: nowItem.rain,
            description: describe(nowItem),
        }
        : null;

    return { now: weatherNow, series: last };
    }

    function describe(i: WeatherForecastItem) {
    const parts: string[] = [];
    // reglas muy simples
    if (i.rain > 0.1) parts.push("lluvia ligera");
    if (i.humidity >= 80 && i.rain <= 0.1) parts.push("húmedo");
    if (i.windSpeed >= 8) parts.push("ventoso");
    if (parts.length === 0) parts.push("estable");
    return parts.join(", ");
    }
