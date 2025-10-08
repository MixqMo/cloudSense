    // src/services/tempo.ts
    export function buildTempoTileUrl(): string | undefined {
    // Define en .env: VITE_TEMPO_TILE_URL="https://{tu-servidor}/tempo/{z}/{x}/{y}.png"
    const url = import.meta.env.VITE_TEMPO_TILE_URL;
    return url && typeof url === "string" ? url : undefined;
    }

    export async function sampleTempoNo2(
    lat: number,
    lon: number
    ): Promise<{ no2: number | null; timeISO?: string }> {
    // Backend opcional: VITE_TEMPO_API_BASE="https://tu_api/tempo"
    const base = import.meta.env.VITE_TEMPO_API_BASE;
    if (!base) {
        // sin backend, devolvemos nulo (evita errores de red)
        return { no2: null };
    }
    const url = `${base.replace(/\/$/, "")}/no2?lat=${lat}&lon=${lon}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TEMPO sample error ${res.status}`);
    const data = await res.json();
    return {
        no2: typeof data?.no2 === "number" ? data.no2 : null,
        timeISO: data?.timeISO,
    };
    }
