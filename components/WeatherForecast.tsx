import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Cloud, Sun, CloudRain, Snowflake } from "lucide-react";

interface ForecastDay {
  day: string;
  date: string;
  condition: "sunny" | "cloudy" | "rainy" | "snowy";
  high: number;
  low: number;
  precipitation: number;
}

interface WeatherForecastProps {
  forecast: ForecastDay[];
}

const WeatherIcon = ({ condition, size = 32 }: { condition: string; size?: number }) => {
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

export function WeatherForecast({ forecast }: WeatherForecastProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Pronóstico de 7 días</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {forecast.map((day, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="min-w-20">
                  <div className="text-sm">{day.day}</div>
                  <div className="text-xs text-muted-foreground">{day.date}</div>
                </div>
                <WeatherIcon condition={day.condition} />
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="text-blue-500 min-w-12 text-right">
                  {day.precipitation > 0 && `${day.precipitation}%`}
                </div>
                <div className="flex gap-2 min-w-16 text-right">
                  <span>{day.high}°</span>
                  <span className="text-muted-foreground">{day.low}°</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}