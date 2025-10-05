import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  CheckCircle, 
  Home, 
  Book, 
  Coffee, 
  Gamepad2, 
  Utensils,
  Tv,
  Music,
  Palette,
  Dumbbell,
  TreePine,
  Bike,
  Sun,
  Wind
} from "lucide-react";

type AirQualityLevel = "good" | "moderate" | "unhealthy-sensitive" | "unhealthy" | "very-unhealthy" | "hazardous";

const recommendedActivities = {
  good: {
    color: "bg-green-100 border-green-300",
    textColor: "text-green-800",
    title: "¡Perfecto para todo!",
    activities: [
      { icon: TreePine, text: "Caminatas y senderismo", category: "outdoor", priority: "high" },
      { icon: Bike, text: "Ciclismo y deportes al aire libre", category: "outdoor", priority: "high" },
      { icon: Sun, text: "Picnics y actividades en parques", category: "outdoor", priority: "high" },
      { icon: Dumbbell, text: "Ejercicio al aire libre", category: "outdoor", priority: "high" },
      { icon: Wind, text: "Deportes acuáticos y de aventura", category: "outdoor", priority: "medium" },
      { icon: Home, text: "Ventilar la casa completamente", category: "indoor", priority: "medium" }
    ]
  },
  moderate: {
    color: "bg-yellow-100 border-yellow-300",
    textColor: "text-yellow-800",
    title: "Actividades con precaución",
    activities: [
      { icon: TreePine, text: "Caminatas cortas en parques", category: "outdoor", priority: "medium" },
      { icon: Dumbbell, text: "Ejercicio moderado al aire libre", category: "outdoor", priority: "medium" },
      { icon: Home, text: "Actividades en casa con ventanas abiertas", category: "indoor", priority: "high" },
      { icon: Coffee, text: "Relajarse en terrazas", category: "outdoor", priority: "low" },
      { icon: Book, text: "Lectura en espacios interiores", category: "indoor", priority: "high" },
      { icon: Utensils, text: "Cocinar en casa", category: "indoor", priority: "high" }
    ]
  },
  "unhealthy-sensitive": {
    color: "bg-orange-100 border-orange-300",
    textColor: "text-orange-800",
    title: "Mejor en interiores",
    activities: [
      { icon: Home, text: "Permanecer en casa con purificadores de aire", category: "indoor", priority: "high" },
      { icon: Book, text: "Lectura y estudio", category: "indoor", priority: "high" },
      { icon: Tv, text: "Ver películas y series", category: "indoor", priority: "high" },
      { icon: Gamepad2, text: "Videojuegos y entretenimiento digital", category: "indoor", priority: "medium" },
      { icon: Utensils, text: "Cocinar comidas saludables", category: "indoor", priority: "high" },
      { icon: TreePine, text: "Caminatas muy cortas solo si es necesario", category: "outdoor", priority: "low" }
    ]
  },
  unhealthy: {
    color: "bg-red-100 border-red-300",
    textColor: "text-red-800",
    title: "Solo actividades interiores",
    activities: [
      { icon: Home, text: "Quedarse en casa con ventanas cerradas", category: "indoor", priority: "high" },
      { icon: Book, text: "Leer libros y revistas", category: "indoor", priority: "high" },
      { icon: Music, text: "Escuchar música y podcasts", category: "indoor", priority: "high" },
      { icon: Palette, text: "Arte y manualidades", category: "indoor", priority: "medium" },
      { icon: Dumbbell, text: "Yoga y ejercicios en casa", category: "indoor", priority: "high" },
      { icon: Coffee, text: "Meditar y relajarse", category: "indoor", priority: "high" }
    ]
  },
  "very-unhealthy": {
    color: "bg-purple-100 border-purple-300",
    textColor: "text-purple-800",
    title: "Máxima protección en casa",
    activities: [
      { icon: Home, text: "Permanecer en casa con purificadores de aire", category: "indoor", priority: "high" },
      { icon: Book, text: "Lectura en habitaciones selladas", category: "indoor", priority: "high" },
      { icon: Tv, text: "Entretenimiento audiovisual", category: "indoor", priority: "high" },
      { icon: Music, text: "Actividades relajantes y meditación", category: "indoor", priority: "high" },
      { icon: Utensils, text: "Cocinar sin abrir puertas/ventanas", category: "indoor", priority: "medium" },
      { icon: Coffee, text: "Hidratarse y descansar adecuadamente", category: "indoor", priority: "high" }
    ]
  },
  hazardous: {
    color: "bg-stone-100 border-stone-400",
    textColor: "text-stone-800",
    title: "Emergencia: Solo lo esencial",
    activities: [
      { icon: Home, text: "Refugiarse en habitación sellada", category: "indoor", priority: "high" },
      { icon: Coffee, text: "Mantenerse hidratado", category: "indoor", priority: "high" },
      { icon: Book, text: "Actividades muy tranquilas", category: "indoor", priority: "medium" },
      { icon: Music, text: "Escuchar música relajante", category: "indoor", priority: "medium" },
      { icon: Utensils, text: "Comer alimentos preparados", category: "indoor", priority: "low" },
      { icon: Tv, text: "Monitorear noticias sobre la calidad del aire", category: "indoor", priority: "high" }
    ]
  }
};

const priorityColors = {
  high: "bg-green-200 text-green-800",
  medium: "bg-yellow-200 text-yellow-800",
  low: "bg-blue-200 text-blue-800"
};

const categoryIcons = {
  indoor: Home,
  outdoor: TreePine
};

interface RecommendedActivitiesProps {
  airQualityLevel: AirQualityLevel;
}

export function RecommendedActivities({ airQualityLevel }: RecommendedActivitiesProps) {
  const levelData = recommendedActivities[airQualityLevel];
  const indoorActivities = levelData.activities.filter(a => a.category === 'indoor');
  const outdoorActivities = levelData.activities.filter(a => a.category === 'outdoor');

  return (
    <Card className={`w-full border-2 ${levelData.color} bg-gradient-to-br from-white to-sky-50`}>
      <CardHeader className="text-center">
        <CardTitle className={`flex items-center justify-center gap-2 ${levelData.textColor}`}>
          <CheckCircle className="w-5 h-5" />
          Actividades Recomendadas
        </CardTitle>
        <p className={`text-sm ${levelData.textColor}`}>
          {levelData.title}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {indoorActivities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Home className="w-4 h-4 text-blue-600" />
              <h4 className="text-blue-800">Actividades en Interior</h4>
            </div>
            <div className="grid gap-2">
              {indoorActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white border border-blue-200 hover:shadow-md transition-shadow"
                  >
                    <div className="p-2 rounded-full bg-blue-100">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{activity.text}</p>
                    </div>
                    <Badge className={`text-xs ${priorityColors[activity.priority]}`}>
                      {activity.priority === 'high' && 'Ideal'}
                      {activity.priority === 'medium' && 'Bueno'}
                      {activity.priority === 'low' && 'Opcional'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {outdoorActivities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TreePine className="w-4 h-4 text-green-600" />
              <h4 className="text-green-800">Actividades al Aire Libre</h4>
            </div>
            <div className="grid gap-2">
              {outdoorActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white border border-green-200 hover:shadow-md transition-shadow"
                  >
                    <div className="p-2 rounded-full bg-green-100">
                      <Icon className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{activity.text}</p>
                    </div>
                    <Badge className={`text-xs ${priorityColors[activity.priority]}`}>
                      {activity.priority === 'high' && 'Ideal'}
                      {activity.priority === 'medium' && 'Bueno'}
                      {activity.priority === 'low' && 'Con precaución'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={`mt-4 p-3 rounded-lg border ${levelData.color}`}>
          <p className="text-xs text-center text-gray-600">
            ⭐ <strong>Recomendación:</strong> Mantente hidratado y monitorea cómo te sientes. 
            Si experimentas molestias respiratorias, busca espacios con mejor ventilación.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}