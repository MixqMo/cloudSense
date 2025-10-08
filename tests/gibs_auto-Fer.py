#!/usr/bin/env python3
# gibs_auto-Fer.py
# Descarga automáticamente imágenes de GIBS para un lugar especificado, 
# probando varias capas y fechas recientes si no hay datos disponibles.

import os
import logging
from datetime import datetime, timedelta, timezone
from owslib.wms import WebMapService
from geopy.geocoders import Nominatim
from shapely.geometry import box

# --- Configuración de logging ---
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

# --- Configuración de WMS y capas ---
WMS_URL = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi"
LAYERS = [
    "MODIS_Terra_CorrectedReflectance_TrueColor",
    "MODIS_Aqua_CorrectedReflectance_TrueColor",
    "VIIRS_SNPP_CorrectedReflectance_TrueColor",
    "BlueMarble_ShadedRelief"
]

# --- Función para obtener bounding box de un lugar ---
def get_bbox(place_name):
    geolocator = Nominatim(user_agent="gibs_downloader")
    location = geolocator.geocode(place_name)
    if location is None:
        raise ValueError(f"No se pudo localizar el lugar: {place_name}")
    # Retorna bbox: [minx, miny, maxx, maxy]
    return box(location.longitude-1, location.latitude-1,
               location.longitude+1, location.latitude+1)

# --- Función para descargar imagen ---
def download_image(wms_url, layer, bbox, date, out_file):
    try:
        wms = WebMapService(wms_url)
        response = wms.getmap(
            layers=[layer],
            styles=[''],
            srs='EPSG:4326',
            bbox=(bbox.bounds[0], bbox.bounds[1], bbox.bounds[2], bbox.bounds[3]),
            width=800,
            height=800,
            format='image/png',
            time=date
        )
        if response is None or response.read() is None:
            logging.warning(f"No hay datos para capa {layer} fecha {date}")
            return False
        with open(out_file, 'wb') as f:
            f.write(response.read())
        logging.info(f"Imagen descargada: {out_file}")
        return True
    except Exception as e:
        logging.error(f"Error al descargar capa {layer} fecha {date}: {e}")
        return False

# --- Función principal ---
def main():
    place_name = input("Introduce el lugar o país: ")
    try:
        bbox = get_bbox(place_name)
    except ValueError as e:
        logging.error(e)
        return

    output_dir = os.path.join(os.getcwd(), "GIBS_Images")
    os.makedirs(output_dir, exist_ok=True)

    success = False
    today = datetime.now(timezone.utc)

    # Intentar la fecha actual y hasta 4 días anteriores
    for delta_days in range(0, 5):
        date_str = (today - timedelta(days=delta_days)).strftime("%Y-%m-%d")
        logging.info(f"Intentando para fecha {date_str}")
        for layer in LAYERS:
            out_file = os.path.join(output_dir, f"{place_name}_{layer}_{date_str}.png")
            if download_image(WMS_URL, layer, bbox, date_str, out_file):
                success = True
        if success:
            break

    if not success:
        logging.error(f"No se pudo descargar ninguna imagen válida para {place_name} en los últimos 5 días.")

if __name__ == "__main__":
    main()
