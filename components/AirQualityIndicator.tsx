import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Leaf, AlertTriangle, AlertCircle, XCircle, Skull, Zap } from "lucide-react";

type AirQualityLevel = "good" | "moderate" | "unhealthy-sensitive" | "unhealthy" | "very-unhealthy" | "hazardous";

const airQualityLevels = {
  good: {
    range: "0-50",
    label: "Bueno",
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    icon: Leaf,
    emoji: "🌿",
    description: "El aire está limpio, sin riesgos para la salud.",
    advice: "Actividades al aire libre recomendadas para todos."
  },
  moderate: {
    range: "51-100",
    label: "Moderado",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    icon: AlertTriangle,
    emoji: "🌤️",
    description: "El aire es aceptable, pero algunas personas sensibles pueden empezar a sentir molestias leves.",
    advice: "Precaución para asmáticos y niños."
  },
  "unhealthy-sensitive": {
    range: "101-150",
    label: "Dañino para grupos sensibles",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    icon: AlertCircle,
    emoji: "🧒👵",
    description: "Personas con asma, adultos mayores o niños deben limitar actividad al aire libre.",
    advice: "El resto de la población aún puede estar segura."
  },
  unhealthy: {
    range: "151-200",
    label: "Dañino para todos",
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    icon: XCircle,
    emoji: "🚷",
    description: "Riesgo para la salud general.",
    advice: "Se recomienda limitar el tiempo al aire libre."
  },
  "very-unhealthy": {
    range: "201-300",
    label: "Muy dañino",
    color: "bg-purple-500",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50",
    icon: Skull,
    emoji: "☠️",
    description: "Alertas de salud: todos pueden experimentar efectos negativos.",
    advice: "Evitar salir al aire libre."
  },
  hazardous: {
    range: ">300",
    label: "Peligro extremo",
    color: "bg-stone-800",
    textColor: "text-stone-700",
    bgColor: "bg-stone-50",
    icon: Zap,
    emoji: "🚨",
    description: "Riesgo severo para la salud de toda la población.",
    advice: "Emergencia: nadie debería exponerse."
  }
};

interface AirQualityIndicatorProps {
  currentLevel?: AirQualityLevel;
  city?: string;
}

export function AirQualityIndicator({ currentLevel = "moderate", city = "tu ciudad" }: AirQualityIndicatorProps) {
  const current = airQualityLevels[currentLevel];
  const Icon = current.icon;

  return (
    <Card className="w-full max-w-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-sky-800">
          Calidad del Aire
        </CardTitle>
        <p className="text-sm text-sky-600">
          Información general sobre niveles de calidad del aire
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Indicador actual simulado */}
        <div className={`p-4 rounded-xl ${current.bgColor} border-2 ${current.color.replace('bg-', 'border-')}`}>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Icon className={`w-8 h-8 ${current.textColor}`} />
            <span className="text-2xl">{current.emoji}</span>
          </div>
          <div className="text-center">
            <Badge className={`${current.color} text-white text-sm mb-2`}>
              Ejemplo: {current.label} ({current.range})
            </Badge>
            <p className="text-sm text-gray-700 mb-1">{current.description}</p>
            <p className="text-xs text-gray-600">{current.advice}</p>
          </div>
        </div>

        {/* Semáforo de todos los niveles */}
        <div className="space-y-3">
          <h4 className="text-center text-sky-800 mb-4">Guía de Niveles de Calidad del Aire</h4>
          <div className="grid gap-2">
            {Object.entries(airQualityLevels).map(([key, level]) => {
              const LevelIcon = level.icon;
              const isActive = key === currentLevel;
              
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    isActive 
                      ? `${level.bgColor} ${level.color.replace('bg-', 'border-')} shadow-md scale-105` 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${level.color}`} />
                  <LevelIcon className={`w-5 h-5 ${level.textColor}`} />
                  <span className="text-lg">{level.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${isActive ? level.textColor : 'text-gray-700'}`}>
                        {level.label} ({level.range})
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>
                      {level.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center text-xs text-sky-600 bg-sky-50 p-3 rounded-lg border border-sky-200">
          💡 Los niveles mostrados son informativos. Para datos reales de {city}, consulta fuentes oficiales de monitoreo ambiental.
        </div>
      </CardContent>
    </Card>
  );
}