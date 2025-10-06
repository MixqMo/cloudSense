#!/usr/bin/env python3
# gibs_Fer_con_places.py
"""
Descargador GIBS con selección por lugar/país.

Uso:
  python gibs_Fer_con_places.py --places "Guatemala,California" --buffer-km 10 --email tu@correo.com
  python gibs_Fer_con_places.py --places "Guatemala" --sizes 800x600,1200x900
  python gibs_Fer_con_places.py  # usa bboxes por defecto
"""

from pathlib import Path
import argparse
import logging
import csv
import json
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, date
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from typing import List, Optional, Dict, Tuple
import math

# -------------------- CONFIG DEFAULTS --------------------
GIBS_GETCAP_URL = "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi?request=GetCapabilities"
IMAGE_DOWNLOAD_BASE = "https://gibs.earthdata.nasa.gov/image-download"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
REQUEST_TIMEOUT = 20
DEFAULT_MAX_LAYERS = 200
DEFAULT_BBOXES = [
    [-125, 24, -66, 49],   # EEUU continental
    [-125, 32, -114, 42],  # California aprox
    [-103, 25, -93, 36],   # Texas aprox
    [-82.7, 24.2, -79.8, 31.0],  # Florida
]
DEFAULT_SIZES = [(800, 600), (1200, 900), (1600, 1200)]
# ---------------------------------------------------------

# -------------------- UTIL / SESSION ---------------------
def create_session(retries: int = 3, backoff: float = 0.8) -> requests.Session:
    s = requests.Session()
    retry = Retry(total=retries, backoff_factor=backoff,
                  status_forcelist=(500, 502, 503, 504),
                  allowed_methods=frozenset(["GET", "HEAD"]))
    adapter = HTTPAdapter(max_retries=retry)
    s.mount("https://", adapter)
    s.mount("http://", adapter)
    return s

session = create_session()

def setup_logging(verbose: bool):
    lvl = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(format="%(asctime)s %(levelname)s: %(message)s", level=lvl)

# -------------------- XML / TIME PARSING ----------------
def parse_time_text(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    t = raw.strip()
    if ',' in t and '/' not in t:
        return t.split(',')[-1].strip()
    if '/' in t:
        parts = t.split('/')
        if len(parts) >= 2:
            return parts[1].strip()
    return t

def parse_capabilities(xml_text: str) -> List[Dict]:
    ns_wmts = '{http://www.opengis.net/wmts/1.0}'
    ns_ows = '{http://www.opengis.net/ows/1.1}'
    root = ET.fromstring(xml_text)
    layers = []
    for layer in root.findall('.//' + ns_wmts + 'Layer'):
        id_el = layer.find(ns_ows + 'Identifier')
        title_el = layer.find(ns_ows + 'Title')
        time_text = None
        for dim in layer.findall(ns_wmts + 'Dimension'):
            if dim.get('name') and dim.get('name').lower() == 'time':
                time_text = parse_time_text(dim.text or '')
                break
        if time_text is None:
            for ext in layer.findall(ns_ows + 'Extent'):
                if ext.get('name') and ext.get('name').lower() == 'time':
                    time_text = parse_time_text(ext.text or '')
                    break
        layers.append({
            'id': id_el.text if id_el is not None else None,
            'title': title_el.text if title_el is not None else None,
            'time_text': time_text
        })
    return layers

def try_parse_date(token: Optional[str]) -> Optional[date]:
    if not token:
        return None
    token = token.strip()
    fmts = ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S")
    for f in fmts:
        try:
            return datetime.strptime(token[:len(f)], f).date()
        except Exception:
            continue
    try:
        return datetime.strptime(token[:10], "%Y-%m-%d").date()
    except Exception:
        return None

# -------------------- I/O helpers ------------------------
def save_text(path: Path, text: str):
    path.write_text(text, encoding="utf-8")
    logging.debug(f"Saved text to {path}")

def save_csv(rows: List[Dict], path: Path):
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=['id','title','time_text','last_date'])
        w.writeheader()
        for r in rows:
            w.writerow(r)
    logging.info(f"CSV guardado: {path}")

def save_meta(meta: Dict, path: Path):
    with path.open("w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    logging.info(f"Meta guardada: {path}")

# -------------------- GEOCODING helpers --------------------
def geocode_place(place: str, email: Optional[str]=None, timeout:int=10) -> Optional[List[float]]:
    """
    Geocodifica 'place' usando Nominatim y devuelve bbox en formato
    [minLon, minLat, maxLon, maxLat]. Retorna None si no encuentra resultado.
    """
    headers = {
        "User-Agent": f"gibs-downloader/1.0 ({email or 'anonymous'})"
    }
    params = {
        "q": place,
        "format": "json",
        "limit": 1,
        "addressdetails": 0,
        "polygon_geojson": 0,
    }
    try:
        r = session.get(NOMINATIM_URL, params=params, headers=headers, timeout=timeout)
        r.raise_for_status()
        data = r.json()
        if not data:
            logging.warning(f"Nominatim: sin resultados para '{place}'")
            return None
        bb = data[0].get("boundingbox")
        if not bb or len(bb) < 4:
            logging.warning(f"Nominatim: bbox faltante para '{place}'")
            return None
        # boundingbox: [south, north, west, east]
        south, north, west, east = map(float, bb[:4])
        return [west, south, east, north]
    except Exception as e:
        logging.warning(f"Error geocodificando '{place}': {e}")
        return None

def expand_bbox_km(bbox: List[float], buffer_km: float) -> List[float]:
    if not bbox or buffer_km is None or buffer_km <= 0:
        return bbox
    minlon, minlat, maxlon, maxlat = bbox
    mean_lat = (minlat + maxlat) / 2.0
    deg_lat = buffer_km / 111.32
    rad = math.radians(mean_lat)
    cos_lat = max(0.0001, math.cos(rad))
    deg_lon = buffer_km / (111.32 * cos_lat)
    return [minlon - deg_lon, minlat - deg_lat, maxlon + deg_lon, maxlat + deg_lat]

# -------------------- DOWNLOAD FLOW ---------------------
def fetch_getcap(session: requests.Session, out_dir: Path) -> str:
    logging.info("Descargando GetCapabilities desde GIBS...")
    r = session.get(GIBS_GETCAP_URL, timeout=REQUEST_TIMEOUT)
    r.raise_for_status()
    xml = r.text
    save_text(out_dir / "getcap_raw.xml", xml)
    logging.info(f"GetCapabilities guardado ({len(xml)} bytes)")
    return xml

def collect_layers_with_dates(xml_text: str) -> List[Dict]:
    layers = parse_capabilities(xml_text)
    rows = []
    for l in layers:
        if not l.get('id'):
            continue
        token = l.get('time_text')
        if token and '/' in token:
            token = token.split('/')[1]
        if token and ',' in token:
            token = token.split(',')[-1]
        dt = try_parse_date(token)
        rows.append({
            'id': l['id'],
            'title': l['title'],
            'time_text': l['time_text'],
            'last_date': dt.isoformat() if dt else None
        })
    return rows

def build_image_params(layer_id: str, bbox: List[float], width: int, height: int, time_param: str) -> Dict:
    return {
        "TIME": time_param,
        "extent": f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}",
        "epsg": "4326",
        "layers": layer_id,
        "opacities": "1",
        "worldfile": "false",
        "format": "image/jpeg",
        "width": str(width),
        "height": str(height),
    }

def attempt_image_download(session: requests.Session, out_dir: Path,
                           layer_id: str, time_param: str,
                           bbox: List[float], size: Tuple[int,int]) -> Optional[Path]:
    width, height = size
    params = build_image_params(layer_id, bbox, width, height, time_param)
    try:
        r = session.get(IMAGE_DOWNLOAD_BASE, params=params, timeout=REQUEST_TIMEOUT, stream=True)
    except Exception as e:
        logging.debug(f"Request error for {layer_id} TIME={time_param}: {e}")
        return None

    if r.status_code != 200:
        logging.debug(f"HTTP {r.status_code} for layer={layer_id} TIME={time_param} bbox={bbox} size={width}x{height}")
        return None

    safe = layer_id.replace('/', '_')
    fname = f"{safe}_{time_param}_{width}x{height}.jpg"
    path = out_dir / fname
    try:
        with path.open("wb") as fd:
            for chunk in r.iter_content(1024):
                if chunk:
                    fd.write(chunk)
        logging.info(f"Descargado: {path}")
        meta = {
            "layer": layer_id,
            "time": time_param,
            "bbox": bbox,
            "size": [width, height],
            "url": r.url,
            "file": str(path),
        }
        save_meta(meta, out_dir / f"{safe}_{time_param}_meta.json")
        return path
    except Exception as e:
        logging.error(f"Error guardando archivo {path}: {e}")
        if path.exists():
            try:
                path.unlink()
            except Exception:
                pass
        return None

# -------------------- MAIN ------------------------------
def main(argv=None):
    parser = argparse.ArgumentParser(description="Descargar imágenes GIBS (Test_gibs junto al .py).")
    parser.add_argument("--max-layers", type=int, default=DEFAULT_MAX_LAYERS, help="Máx capas a probar")
    parser.add_argument("--sizes", type=str, default=",".join(f"{w}x{h}" for w,h in DEFAULT_SIZES),
                        help="Lista tamaños WxH separada por comas, e.g. 800x600,1200x900")
    parser.add_argument("--places", type=str, default="", help="Lista de lugares/países separados por comas (ej: 'Guatemala,California')")
    parser.add_argument("--buffer-km", type=float, default=0.0, help="Buffer en km para expandir bbox geocodificada")
    parser.add_argument("--email", type=str, default="", help="Email para User-Agent en Nominatim (recomendado)")
    parser.add_argument("--verbose", action="store_true", help="Verbose logging")
    args = parser.parse_args(argv)

    setup_logging(args.verbose)

    # directorio del script
    try:
        script_dir = Path(__file__).resolve().parent
    except NameError:
        script_dir = Path.cwd()
    out_dir = script_dir / "Test_gibs"
    out_dir.mkdir(parents=True, exist_ok=True)
    logging.info(f"Carpeta de salida: {out_dir}")

    # parse sizes
    sizes = []
    for token in args.sizes.split(","):
        token = token.strip()
        if not token:
            continue
        if "x" not in token:
            logging.warning(f"Ignorando tamaño inválido: {token}")
            continue
        w,h = token.split("x", 1)
        try:
            sizes.append((int(w), int(h)))
        except ValueError:
            logging.warning(f"Ignorando tamaño no numérico: {token}")

    # Preparar bboxes: si --places dado, geocodificamos y usamos sus bboxes
    bboxes_to_try: List[List[float]] = []
    if args.places:
        # separar por comas respetando comillas no implementado (simple split)
        places = [p.strip() for p in args.places.split(",") if p.strip()]
        for place in places:
            bbox = geocode_place(place, email=args.email or None)
            if bbox:
                bbox = expand_bbox_km(bbox, args.buffer_km)
                bboxes_to_try.append(bbox)
            else:
                logging.warning(f"No se obtuvo bbox para '{place}', se omitirá.")
    # si no hay lugares válidos, usar DEFAULT_BBOXES
    if not bboxes_to_try:
        bboxes_to_try = DEFAULT_BBOXES

    # fetch getcap
    try:
        xml = fetch_getcap(session, out_dir)
    except Exception as e:
        logging.error(f"No se pudo descargar GetCapabilities: {e}")
        return

    rows = collect_layers_with_dates(xml)
    if not rows:
        logging.warning("No se detectaron capas con dimensión TIME en GetCapabilities.")
        return

    rows_sorted = sorted(rows, key=lambda r: (r['last_date'] or "1900-01-01"), reverse=True)
    save_csv(rows_sorted, out_dir / "gibs_layers_dates.csv")
    logging.info(f"Se detectaron {len(rows_sorted)} capas con TIME. Probando descargas... (máx {args.max_layers})")

    tried = 0
    try:
        for rec in rows_sorted:
            if tried >= args.max_layers:
                break
            layer_id = rec['id']
            last_date = rec['last_date']
            logging.debug(f"Probando layer {layer_id} last_date={last_date}")

            time_attempts = ["latest"]
            if last_date:
                time_attempts.append(last_date)

            for time_param in time_attempts:
                for bbox in bboxes_to_try:
                    for size in sizes:
                        logging.info(f"Intentando: layer={layer_id} TIME={time_param} bbox={bbox} size={size[0]}x{size[1]}")
                        path = attempt_image_download(session, out_dir, layer_id, time_param, bbox, size)
                        if path:
                            logging.info("Imagen válida obtenida, terminando proceso.")
                            return
            tried += 1
    except KeyboardInterrupt:
        logging.warning("Interrumpido por usuario (KeyboardInterrupt).")

    logging.info("Proceso terminado. No se encontró ninguna imagen válida con las combinaciones probadas.")
    logging.info(f"Revisa {out_dir / 'gibs_layers_dates.csv'} para elegir manualmente un layer y probarlo.")

if __name__ == "__main__":
    main()
