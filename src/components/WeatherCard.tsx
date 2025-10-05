import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, Eye, Thermometer } from "lucide-react";

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  description: string;
  condition: "sunny" | "cloudy" | "rainy" | "snowy";
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
}

interface WeatherCardProps {
  weather: WeatherData;
}

const WeatherIcon = ({ condition, size = 64 }: { condition: string; size?: number }) => {
  const iconProps = { size, className: "text-primary" };
  
  switch (condition) {
    case "sunny":
      return <Sun {...iconProps} className="text-yellow-500" />;
    case "cloudy":
      return <Cloud {...iconProps} className="text-gray-500" />;
    case "rainy":
      return <CloudRain {...iconProps} className="text-blue-500" />;
    case "snowy":
      return <Snowflake {...iconProps} className="text-blue-200" />;
    default:
      return <Sun {...iconProps} />;
  }
};

export function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {weather.city}, {weather.country}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Temperatura principal */}
        <div className="text-center space-y-2">
          <WeatherIcon condition={weather.condition} />
          <div className="space-y-1">
            <div className="text-5xl">{weather.temperature}°</div>
            <div className="text-muted-foreground">
              Sensación térmica {weather.feelsLike}°
            </div>
            <Badge variant="secondary" className="text-sm">
              {weather.description}
            </Badge>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Droplets className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-sm text-muted-foreground">Humedad</div>
              <div>{weather.humidity}%</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Wind className="w-5 h-5 text-gray-500" />
            <div>
              <div className="text-sm text-muted-foreground">Viento</div>
              <div>{weather.windSpeed} km/h</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Thermometer className="w-5 h-5 text-red-500" />
            <div>
              <div className="text-sm text-muted-foreground">Presión</div>
              <div>{weather.pressure} hPa</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Eye className="w-5 h-5 text-purple-500" />
            <div>
              <div className="text-sm text-muted-foreground">Visibilidad</div>
              <div>{weather.visibility} km</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}