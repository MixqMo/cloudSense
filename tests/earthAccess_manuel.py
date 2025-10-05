import datetime as dt
import earthaccess as ea
import xarray as xr
import numpy as np

DATE = dt.date(2025, 10, 4)
t0 = f"{DATE}T00:00:00Z"
t1 = f"{(DATE + dt.timedelta(days=1))}T00:00:00Z"

ea.login(strategy="netrc")  # o "interactive"

# TEMPO NO2 L3 V04 (colección)
CID = "C3685896708-LARC_CLOUD"

# 1) Búsqueda por Concept ID + ventana temporal
results = ea.search_data(
    concept_id=CID,
    temporal=(t0, t1)
)

print("Granulos encontrados:", len(results))
for r in results[:3]:
    print("→", r.data_links()[0])

# 2) Descarga y lectura
if results:
    [path] = ea.download(results[:1], "./data_tempo")
    ds = xr.open_dataset(path, group="product")
    no2 = ds["vertical_column_troposphere"]  # molecules/cm^2
    print("NO2 mean:", float(no2.mean().values))
else:
    print("Sin resultados: pruebe sin 'temporal' o cambie la fecha +/-1 día.")

#------------------------------------------------------------------------------------
# Descargar el primer granulo (puede cambiar el índice)
[path] = ea.download(results[:1], "./data_tempo")

print(f"Archivo descargado: {path}")

# Abrir grupo 'product' (contiene variables principales)
ds = xr.open_dataset(path, group="product")

# Variable principal: columna de NO2 troposférico (mol/cm^2)
no2 = ds["vertical_column_troposphere"]

# Subconjunto geográfico aproximado de Guatemala
no2_gt = no2.sel(latitude=slice(8, 19), longitude=slice(-93, -87))
mean_gt = float(no2_gt.mean().values)

print(f"Promedio NO₂ sobre Guatemala: {mean_gt:.3e} mol/cm²")

# Exportar a GeoTIFF (opcional)
try:
    import rioxarray
    no2_gt = no2_gt.rio.write_crs("EPSG:4326", inplace=True)
    geotiff_path = f"./data_tempo/TEMPO_NO2_GT_{DATE.isoformat()}.tif"
    no2_gt.isel(time=0).rio.to_raster(geotiff_path)
    print(f"[OK] Exportado GeoTIFF: {geotiff_path}")
except Exception as e:
    print("[INFO] No se exportó GeoTIFF:", e)

