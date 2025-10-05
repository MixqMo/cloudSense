import { useState } from "react";
import { WeatherCard } from "./components/WeatherCard";
import { WeatherForecast } from "./components/WeatherForecast";
import { WeatherMap } from "./components/WeatherMap";
import { CitySearch } from "./components/CitySearch";
import { AirQualityIndicator } from "./components/AirQualityIndicator";
import { ActivitiesToAvoid } from "./components/ActivitiesToAvoid";
import { RecommendedActivities } from "./components/RecommendedActivities";
import { HealthInformation } from "./components/HealthInformation";
import { AirQualityMap } from "./components/AirQualityMap";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Badge } from "./components/ui/badge";
import { Wind, Sun, Cloud } from "lucide-react";

type WeatherCondition = "sunny" | "cloudy" | "rainy";
type AirQualityLevel = "good" | "moderate" | "unhealthy-sensitive";

export interface Weather {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  description: string;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  airQuality: AirQualityLevel;
  windDirection: string;
  rainfall: number;
}

type ForecastItem = {
  day: string;
  date: string;
  condition: WeatherCondition;
  high: number;
  low: number;
  precipitation: number;
};

/* ===== Mock tipado con firma de índice ===== */
const mockWeatherData: Record<string, Weather> = {
  madrid: {
    city: "Madrid",
    country: "España",
    temperature: 22,
    feelsLike: 24,
    description: "Parcialmente nublado",
    condition: "cloudy",
    humidity: 65,
    windSpeed: 12,
    pressure: 1015,
    visibility: 10,
    airQuality: "moderate",
    windDirection: "NW",
    rainfall: 0
  },
  barcelona: {
    city: "Barcelona",
    country: "España",
    temperature: 26,
    feelsLike: 28,
    description: "Soleado",
    condition: "sunny",
    humidity: 58,
    windSpeed: 8,
    pressure: 1018,
    visibility: 12,
    airQuality: "good",
    windDirection: "E",
    rainfall: 0
  },
  london: {
    city: "Londres",
    country: "Reino Unido",
    temperature: 15,
    feelsLike: 13,
    description: "Lluvioso",
    condition: "rainy",
    humidity: 85,
    windSpeed: 15,
    pressure: 1008,
    visibility: 6,
    airQuality: "unhealthy-sensitive",
    windDirection: "SW",
    rainfall: 5.2
  },
  default: {
    city: "Ciudad de México",
    country: "México",
    temperature: 20,
    feelsLike: 22,
    description: "Mayormente soleado",
    condition: "sunny",
    humidity: 45,
    windSpeed: 10,
    pressure: 1020,
    visibility: 15,
    airQuality: "moderate",
    windDirection: "N",
    rainfall: 0
  }
};

const DEFAULT_WEATHER: Weather = mockWeatherData.default;

const mockForecast: ForecastItem[] = [
  { day: "Hoy",       date: "Oct 4",  condition: "sunny",  high: 25, low: 15, precipitation: 0  },
  { day: "Mañana",    date: "Oct 5",  condition: "cloudy", high: 23, low: 14, precipitation: 20 },
  { day: "Lunes",     date: "Oct 6",  condition: "rainy",  high: 19, low: 12, precipitation: 80 },
  { day: "Martes",    date: "Oct 7",  condition: "cloudy", high: 21, low: 13, precipitation: 30 },
  { day: "Miércoles", date: "Oct 8",  condition: "sunny",  high: 24, low: 16, precipitation: 5  },
  { day: "Jueves",    date: "Oct 9",  condition: "sunny",  high: 26, low: 17, precipitation: 0  },
  { day: "Viernes",   date: "Oct 10", condition: "cloudy", high: 22, low: 15, precipitation: 15 }
];

export default function App() {
  // Estado ensanchado explícitamente
  const [currentWeather, setCurrentWeather] = useState<Weather>(DEFAULT_WEATHER);
  const [loading, setLoading] = useState(false);

  // Forzar Weather en weatherData, indexando con string
  const handleSearch = async (city: string) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const cityKey = city.toLowerCase();
    const weatherData: Weather =
      mockWeatherData[cityKey] ?? { ...DEFAULT_WEATHER, city, country: "Mundo" };

    setCurrentWeather(weatherData);
    setLoading(false);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
      {/* Header con imagen de fondo */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1608819667256-09f726de6938?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbG91ZHklMjBza3klMjB3ZWF0aGVyfGVufDF8fHx8MTc1OTU1MjA3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Cielo nublado"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/40 to-cyan-900/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
          <h1 className="text-5xl mb-3 drop-shadow-lg">CloudSense</h1>
          <p className="text-xl opacity-90 drop-shadow-md">
            Por un cielo más claro y una vida más sana.
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-8">
          {/* Buscador */}
          <CitySearch onSearch={handleSearch} loading={loading} />

          {/* Sistema de pestañas */}
          {!loading && (
            <Tabs defaultValue="weather" className="w-full max-w-7xl">
              <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm border border-sky-200 rounded-xl p-1">
                <TabsTrigger
                  value="weather"
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Pronóstico del Tiempo
                </TabsTrigger>
                <TabsTrigger
                  value="air-quality"
                  className="data-[state=active]:bg-sky-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all"
                >
                  <Wind className="w-4 h-4 mr-2" />
                  Calidad del Aire
                </TabsTrigger>
              </TabsList>

              {/* Pestaña principal: Pronóstico del Tiempo */}
              <TabsContent value="weather" className="space-y-6 mt-6">
                <div className="text-center mb-6">
                  <Badge className="bg-yellow-500 text-white px-4 py-2 text-sm">
                    Clima en {currentWeather.city}, {currentWeather.country}
                  </Badge>
                </div>

                {/* Primera fila: Tarjeta del clima y pronóstico */}
                <div className="flex flex-col lg:flex-row gap-8 items-start justify-center mb-6">
                  <WeatherCard weather={currentWeather} />
                  <WeatherForecast forecast={mockForecast} />
                </div>

                {/* Segunda fila: Mapa del clima */}
                <div className="flex justify-center">
                  <div className="w-full max-w-2xl">
                    <WeatherMap
                      city={currentWeather.city}
                      weatherData={{
                        temperature: currentWeather.temperature,
                        humidity: currentWeather.humidity,
                        windSpeed: currentWeather.windSpeed,
                        windDirection: currentWeather.windDirection,
                        condition: currentWeather.condition
                      }}
                    />
                  </div>
                </div>

                {/* Información adicional del clima */}
                <div className="text-center bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    🌤️ <strong>Información del clima:</strong> Los datos mostrados son simulados para fines demostrativos.
                    En una versión real, se conectaría a APIs como OpenWeatherMap para obtener información actualizada.
                  </p>
                </div>
              </TabsContent>

              {/* Pestaña: Calidad del Aire */}
              <TabsContent value="air-quality" className="space-y-6 mt-6">
                <div className="text-center mb-6">
                  <Badge className="bg-sky-500 text-white px-4 py-2 text-sm">
                    Información para {currentWeather.city}, {currentWeather.country}
                  </Badge>
                </div>

                {/* Primera fila: Semáforo y Mapa */}
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                  <AirQualityIndicator
                    currentLevel={currentWeather.airQuality}
                    city={currentWeather.city}
                  />
                  <AirQualityMap
                    city={currentWeather.city}
                    climateData={{
                      temperature: currentWeather.temperature,
                      humidity: currentWeather.humidity,
                      windSpeed: currentWeather.windSpeed,
                      windDirection: currentWeather.windDirection,
                      rainfall: currentWeather.rainfall,
                      visibility: currentWeather.visibility
                    }}
                  />
                </div>

                {/* Segunda fila: Información de salud */}
                <div className="flex justify-center mb-6">
                  <div className="w-full max-w-2xl">
                    <HealthInformation airQualityLevel={currentWeather.airQuality} />
                  </div>
                </div>

                {/* Tercera fila: Actividades recomendadas y a evitar */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <ActivitiesToAvoid airQualityLevel={currentWeather.airQuality} />
                  <RecommendedActivities airQualityLevel={currentWeather.airQuality} />
                </div>

                {/* Información adicional */}
                <div className="text-center bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-sky-200">
                  <p className="text-sm text-sky-700">
                    💡 <strong>Nota importante:</strong> Esta información es educativa y usa datos simulados.
                    Para datos reales de calidad del aire, consulta fuentes oficiales como AQICN o tu servicio meteorológico local.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Estado de carga */}
          {loading && (
            <div className="flex items-center justify-center p-8 bg-white/60 backdrop-blur-sm rounded-xl border border-sky-200">
              <div className="flex items-center gap-3">
                <div className="animate-spin">
                  <Cloud className="w-6 h-6 text-sky-500" />
                </div>
                <div className="text-lg text-sky-700">Obteniendo datos...</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
