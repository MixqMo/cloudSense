import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Wind, Thermometer, Droplets, CloudRain, Eye, TrendingUp } from "lucide-react";

interface ClimateData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  rainfall: number;
  visibility: number;
}

interface AirQualityMapProps {
  city: string;
  climateData: ClimateData;
}

// Datos simulados de estaciones de monitoreo
const mockStations = [
  { id: "centro", name: "Centro", aqi: 85, lat: 19.4326, lng: -99.1332, status: "moderate" },
  { id: "norte", name: "Zona Norte", aqi: 120, lat: 19.5000, lng: -99.1200, status: "unhealthy-sensitive" },
  { id: "sur", name: "Zona Sur", aqi: 65, lat: 19.3500, lng: -99.1500, status: "good" },
  { id: "este", name: "Zona Este", aqi: 95, lat: 19.4200, lng: -99.0800, status: "moderate" },
  { id: "oeste", name: "Zona Oeste", aqi: 110, lat: 19.4400, lng: -99.2000, status: "unhealthy-sensitive" }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "good": return "bg-green-500";
    case "moderate": return "bg-yellow-500";
    case "unhealthy-sensitive": return "bg-orange-500";
    case "unhealthy": return "bg-red-500";
    case "very-unhealthy": return "bg-purple-500";
    case "hazardous": return "bg-stone-800";
    default: return "bg-gray-500";
  }
};

const getWindDirection = (direction: string) => {
  const directions: { [key: string]: string } = {
    "N": "Norte ↑",
    "NE": "Noreste ↗",
    "E": "Este →",
    "SE": "Sureste ↘",
    "S": "Sur ↓",
    "SW": "Suroeste ↙",
    "W": "Oeste ←",
    "NW": "Noroeste ↖"
  };
  return directions[direction] || direction;
};

export function AirQualityMap({ city, climateData }: AirQualityMapProps) {
  return (
    <Card className="w-full border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-sky-800">
          <MapPin className="w-5 h-5" />
          Mapa de Calidad del Aire - {city}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mapa simulado */}
        <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-xl p-6 border-2 border-sky-200 min-h-64">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-200/30 to-cyan-200/30 rounded-xl"></div>
          
          {/* Estaciones de monitoreo simuladas */}
          <div className="relative z-10 h-full">
            <div className="text-center mb-4">
              <Badge className="bg-sky-500 text-white">Estaciones de Monitoreo</Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-32">
              {mockStations.map((station) => (
                <div
                  key={station.id}
                  className="relative flex flex-col items-center justify-center p-3 bg-white/80 backdrop-blur-sm rounded-lg border shadow-sm hover:shadow-md transition-all"
                >
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(station.status)} mb-1`}></div>
                  <div className="text-xs text-center">
                    <div className="text-gray-800">{station.name}</div>
                    <div className="text-gray-600">AQI: {station.aqi}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Factores climáticos que afectan la calidad del aire */}
        <div className="space-y-4">
          <h4 className="text-center text-sky-800 mb-4">
            Factores Climáticos que Afectan la Calidad del Aire
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Viento */}
            <div className="p-4 bg-white rounded-lg border border-sky-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Wind className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-gray-800">Viento</div>
                  <div className="text-xs text-gray-600">{climateData.windSpeed} km/h</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-blue-600">
                  Dirección: {getWindDirection(climateData.windDirection)}
                </div>
                <div className="text-xs text-gray-500">
                  {climateData.windSpeed > 15 ? "Ayuda a dispersar contaminantes" : "Dispersión limitada"}
                </div>
              </div>
            </div>

            {/* Temperatura */}
            <div className="p-4 bg-white rounded-lg border border-sky-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Thermometer className="w-5 h-5 text-red-500" />
                <div>
                  <div className="text-sm text-gray-800">Temperatura</div>
                  <div className="text-xs text-gray-600">{climateData.temperature}°C</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {climateData.temperature > 25 
                  ? "Favorece formación de ozono" 
                  : "Menor formación de ozono"}
              </div>
            </div>

            {/* Humedad */}
            <div className="p-4 bg-white rounded-lg border border-sky-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Droplets className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm text-gray-800">Humedad</div>
                  <div className="text-xs text-gray-600">{climateData.humidity}%</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {climateData.humidity > 60 
                  ? "Partículas se adhieren más" 
                  : "Menor adhesión de partículas"}
              </div>
            </div>

            {/* Lluvia */}
            <div className="p-4 bg-white rounded-lg border border-sky-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <CloudRain className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-800">Precipitación</div>
                  <div className="text-xs text-gray-600">{climateData.rainfall}mm</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {climateData.rainfall > 0 
                  ? "Lava contaminantes del aire" 
                  : "Sin efecto de limpieza"}
              </div>
            </div>
          </div>
        </div>

        {/* Pronóstico de calidad del aire */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border-2 border-sky-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-sky-600" />
            <h4 className="text-sky-800">Pronóstico de Calidad del Aire</h4>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-white/60 rounded">
              <div className="text-xs text-gray-600">Mañana</div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mt-1"></div>
              <div className="text-xs text-gray-800 mt-1">Moderado</div>
            </div>
            <div className="p-2 bg-white/60 rounded">
              <div className="text-xs text-gray-600">2 días</div>
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mt-1"></div>
              <div className="text-xs text-gray-800 mt-1">Bueno</div>
            </div>
            <div className="p-2 bg-white/60 rounded">
              <div className="text-xs text-gray-600">3 días</div>
              <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mt-1"></div>
              <div className="text-xs text-gray-800 mt-1">Sensible</div>
            </div>
          </div>
          <div className="text-xs text-center text-gray-600 mt-3">
            Basado en patrones climáticos y dispersión de contaminantes
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-center text-xs text-sky-600 bg-sky-50 p-3 rounded-lg border border-sky-200">
          🗺️ <strong>Información del mapa:</strong> Los datos mostrados son simulados. 
          En una aplicación real, se integrarían APIs de monitoreo ambiental oficial para datos precisos en tiempo real.
        </div>
      </CardContent>
    </Card>
  );
}