import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  X, 
  Bike, 
  TreePine, 
  Dumbbell, 
  Baby, 
  Heart,
  Wind,
  Building,
  Car
} from "lucide-react";

type AirQualityLevel = "good" | "moderate" | "unhealthy-sensitive" | "unhealthy" | "very-unhealthy" | "hazardous";

const activitiesToAvoid = {
  good: {
    color: "bg-green-100 border-green-300",
    textColor: "text-green-800",
    activities: []
  },
  moderate: {
    color: "bg-yellow-100 border-yellow-300",
    textColor: "text-yellow-800",
    activities: [
      { icon: Baby, text: "Actividad intensa al aire libre para bebés y niños pequeños", severity: "low" },
      { icon: Heart, text: "Ejercicio prolongado para personas con problemas cardíacos", severity: "low" }
    ]
  },
  "unhealthy-sensitive": {
    color: "bg-orange-100 border-orange-300",
    textColor: "text-orange-800",
    activities: [
      { icon: Dumbbell, text: "Ejercicio intenso al aire libre para grupos sensibles", severity: "medium" },
      { icon: Baby, text: "Juegos al aire libre prolongados para niños", severity: "medium" },
      { icon: Heart, text: "Actividad física para personas con asma o problemas cardíacos", severity: "high" },
      { icon: TreePine, text: "Caminatas largas en parques para adultos mayores", severity: "medium" }
    ]
  },
  unhealthy: {
    color: "bg-red-100 border-red-300",
    textColor: "text-red-800",
    activities: [
      { icon: Bike, text: "Ciclismo al aire libre", severity: "high" },
      { icon: Dumbbell, text: "Ejercicio intenso al aire libre para todos", severity: "high" },
      { icon: TreePine, text: "Actividades prolongadas en parques y espacios abiertos", severity: "high" },
      { icon: Baby, text: "Cualquier actividad al aire libre para niños", severity: "high" },
      { icon: Wind, text: "Deportes al aire libre", severity: "high" }
    ]
  },
  "very-unhealthy": {
    color: "bg-purple-100 border-purple-300",
    textColor: "text-purple-800",
    activities: [
      { icon: Building, text: "Salir de casa sin mascarilla", severity: "critical" },
      { icon: TreePine, text: "Cualquier actividad al aire libre", severity: "critical" },
      { icon: Car, text: "Viajes innecesarios en vehículo con ventanas abiertas", severity: "high" },
      { icon: Wind, text: "Actividades que requieran respiración profunda", severity: "critical" },
      { icon: Baby, text: "Exposición al aire libre para grupos vulnerables", severity: "critical" }
    ]
  },
  hazardous: {
    color: "bg-stone-100 border-stone-400",
    textColor: "text-stone-800",
    activities: [
      { icon: Building, text: "Salir al exterior por cualquier motivo no esencial", severity: "critical" },
      { icon: Wind, text: "Abrir ventanas en casa", severity: "critical" },
      { icon: Car, text: "Usar transporte público", severity: "high" },
      { icon: TreePine, text: "Cualquier exposición al aire exterior", severity: "critical" },
      { icon: Baby, text: "Permitir que niños o personas vulnerables salgan", severity: "critical" }
    ]
  }
};

const severityColors = {
  low: "bg-yellow-200 text-yellow-800",
  medium: "bg-orange-200 text-orange-800", 
  high: "bg-red-200 text-red-800",
  critical: "bg-purple-200 text-purple-800"
};

interface ActivitiesToAvoidProps {
  airQualityLevel: AirQualityLevel;
}

export function ActivitiesToAvoid({ airQualityLevel }: ActivitiesToAvoidProps) {
  const levelData = activitiesToAvoid[airQualityLevel];

  if (levelData.activities.length === 0) {
    return (
      <Card className={`w-full border-2 ${levelData.color} bg-gradient-to-br from-green-50 to-emerald-50`}>
        <CardHeader className="text-center">
          <CardTitle className={`flex items-center justify-center gap-2 ${levelData.textColor}`}>
            <Wind className="w-5 h-5" />
            Actividades a Evitar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <p className={`text-lg ${levelData.textColor}`}>
              ¡Excelente! No hay actividades que debas evitar.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Puedes realizar todas las actividades al aire libre con normalidad.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full border-2 ${levelData.color} bg-gradient-to-br from-white to-gray-50`}>
      <CardHeader className="text-center">
        <CardTitle className={`flex items-center justify-center gap-2 ${levelData.textColor}`}>
          <X className="w-5 h-5" />
          Actividades a Evitar
        </CardTitle>
        <p className="text-sm text-gray-600">
          Con la calidad de aire actual, considera evitar estas actividades:
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {levelData.activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-2 rounded-full bg-red-100">
                  <Icon className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.text}</p>
                </div>
                <Badge className={`text-xs ${severityColors[activity.severity]}`}>
                  {activity.severity === 'low' && 'Precaución'}
                  {activity.severity === 'medium' && 'Evitar'}
                  {activity.severity === 'high' && 'No recomendado'}
                  {activity.severity === 'critical' && 'Peligroso'}
                </Badge>
              </div>
            );
          })}
        </div>
        
        <div className={`mt-4 p-3 rounded-lg border ${levelData.color}`}>
          <p className="text-xs text-center text-gray-600">
            💡 <strong>Consejo:</strong> Si debes realizar alguna de estas actividades, considera usar mascarilla N95 
            y limita el tiempo de exposición al mínimo necesario.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}