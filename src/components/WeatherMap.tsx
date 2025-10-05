import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, Thermometer } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  condition: "sunny" | "cloudy" | "rainy" | "snowy";
}

interface WeatherMapProps {
  city: string;
  weatherData: WeatherData;
}

const getConditionIcon = (condition: string) => {
  switch (condition) {
    case "sunny": return { Icon: Sun, color: "text-yellow-500", bg: "bg-yellow-500" };
    case "cloudy": return { Icon: Cloud, color: "text-gray-500", bg: "bg-gray-500" };
    case "rainy": return { Icon: CloudRain, color: "text-blue-500", bg: "bg-blue-500" };
    case "snowy": return { Icon: Snowflake, color: "text-cyan-500", bg: "bg-cyan-500" };
    default: return { Icon: Cloud, color: "text-gray-500", bg: "bg-gray-500" };
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

export function WeatherMap({ city, weatherData }: WeatherMapProps) {
  const mainCondition = getConditionIcon(weatherData.condition);
  const MainIcon = mainCondition.Icon;

  return (
    <Card className="w-full border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-yellow-800">
          <MapPin className="w-5 h-5" />
          Ubicación: {city}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mapa geográfico real */}
        <div className="relative rounded-xl overflow-hidden border-2 border-yellow-300 shadow-lg">
          {/* Imagen del mapa satelital */}
          <div className="relative h-96">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1518902420343-1794cd8da681?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMG1hcCUyMHNhdGVsbGl0ZSUyMHZpZXd8ZW58MXx8fHwxNzU5NDg3NDE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Mapa satelital"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            
            {/* Marcador de ubicación en el centro */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                {/* Pulso animado */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-yellow-400/30 animate-ping"></div>
                </div>
                {/* Pin de ubicación */}
                <div className="relative z-10 bg-yellow-500 text-white p-4 rounded-full shadow-2xl border-4 border-white">
                  <MapPin className="w-8 h-8" />
                </div>
                {/* Etiqueta con nombre de ciudad */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-yellow-300 whitespace-nowrap">
                  <div className="text-sm text-gray-800">{city}</div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <MainIcon className={`w-4 h-4 ${mainCondition.color}`} />
                    <span className="text-xs text-gray-600">{weatherData.temperature}°C</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leyenda en la esquina superior derecha */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-yellow-200">
              <div className="text-xs text-gray-700 mb-2">Vista Satelital</div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${mainCondition.bg}`}></div>
                <span className="text-xs text-gray-600">
                  {weatherData.condition === 'sunny' && 'Soleado'}
                  {weatherData.condition === 'cloudy' && 'Nublado'}
                  {weatherData.condition === 'rainy' && 'Lluvioso'}
                  {weatherData.condition === 'snowy' && 'Nevado'}
                </span>
              </div>
            </div>
          </div>

          {/* Barra inferior con información del clima */}
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <Thermometer className="w-5 h-5 mb-1" />
                <div className="text-xs opacity-90">Temperatura</div>
                <div className="text-sm">{weatherData.temperature}°C</div>
              </div>
              <div className="flex flex-col items-center">
                <Wind className="w-5 h-5 mb-1" />
                <div className="text-xs opacity-90">Viento</div>
                <div className="text-sm">{weatherData.windSpeed} km/h</div>
              </div>
              <div className="flex flex-col items-center">
                <Droplets className="w-5 h-5 mb-1" />
                <div className="text-xs opacity-90">Humedad</div>
                <div className="text-sm">{weatherData.humidity}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles adicionales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border border-yellow-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Wind className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-800">Dirección del Viento</div>
                <div className="text-xs text-gray-600">
                  {getWindDirection(weatherData.windDirection)}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-yellow-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-100">
                <MainIcon className={`w-5 h-5 ${mainCondition.color}`} />
              </div>
              <div>
                <div className="text-sm text-gray-800">Condición Actual</div>
                <div className="text-xs text-gray-600">
                  {weatherData.condition === 'sunny' && 'Cielo despejado'}
                  {weatherData.condition === 'cloudy' && 'Parcialmente nublado'}
                  {weatherData.condition === 'rainy' && 'Lluvia presente'}
                  {weatherData.condition === 'snowy' && 'Nieve presente'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-center text-xs text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          🗺️ <strong>Mapa satelital:</strong> Vista geográfica simulada. 
          En una aplicación real, se integraría con servicios como Google Maps o Mapbox para mostrar la ubicación exacta.
        </div>
      </CardContent>
    </Card>
  );
}