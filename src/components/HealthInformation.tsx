import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Heart, 
  Wind, 
  Baby, 
  AlertTriangle, 
  Shield, 
  Activity,
  Stethoscope,
  UserX
} from "lucide-react";

type AirQualityLevel = "good" | "moderate" | "unhealthy-sensitive" | "unhealthy" | "very-unhealthy" | "hazardous";

const healthEffects = {
  good: {
    color: "bg-green-100 border-green-300",
    textColor: "text-green-800",
    icon: Shield,
    title: "Sin riesgos para la salud",
    effects: [
      { icon: Heart, text: "Sistema cardiovascular funcionando normalmente", severity: "safe" },
      { icon: Wind, text: "Respiración sin complicaciones para todos", severity: "safe" },
      { icon: Baby, text: "Seguro para niños y bebés", severity: "safe" },
      { icon: Activity, text: "Ejercicio al aire libre recomendado", severity: "safe" }
    ],
    recommendation: "Condiciones ideales para todas las actividades al aire libre."
  },
  moderate: {
    color: "bg-yellow-100 border-yellow-300",
    textColor: "text-yellow-800",
    icon: AlertTriangle,
    title: "Efectos menores en grupos sensibles",
    effects: [
      { icon: Baby, text: "Posible irritación leve en niños pequeños", severity: "mild" },
      { icon: Wind, text: "Personas con asma pueden sentir molestias menores", severity: "mild" },
      { icon: Heart, text: "Adultos mayores con problemas cardíacos: precaución", severity: "mild" },
      { icon: Activity, text: "Ejercicio intenso: considerar reducir duración", severity: "mild" }
    ],
    recommendation: "La mayoría de las personas pueden realizar actividades normales."
  },
  "unhealthy-sensitive": {
    color: "bg-orange-100 border-orange-300",
    textColor: "text-orange-800",
    icon: Stethoscope,
    title: "Riesgos para grupos vulnerables",
    effects: [
      { icon: Wind, text: "Agravamiento de síntomas de asma y EPOC", severity: "moderate" },
      { icon: Baby, text: "Irritación respiratoria en niños", severity: "moderate" },
      { icon: Heart, text: "Riesgo aumentado para enfermedades cardíacas", severity: "moderate" },
      { icon: UserX, text: "Adultos mayores deben limitar actividad exterior", severity: "moderate" }
    ],
    recommendation: "Grupos sensibles deben reducir actividades prolongadas al aire libre."
  },
  unhealthy: {
    color: "bg-red-100 border-red-300",
    textColor: "text-red-800",
    icon: AlertTriangle,
    title: "Efectos en la salud general",
    effects: [
      { icon: Wind, text: "Dificultad respiratoria para población general", severity: "high" },
      { icon: Heart, text: "Aumento de problemas cardiovasculares", severity: "high" },
      { icon: Baby, text: "Riesgo significativo para niños y embarazadas", severity: "high" },
      { icon: Activity, text: "Fatiga y reducción de capacidad pulmonar", severity: "high" }
    ],
    recommendation: "Todos deben limitar actividad física prolongada al aire libre."
  },
  "very-unhealthy": {
    color: "bg-purple-100 border-purple-300",
    textColor: "text-purple-800",
    icon: UserX,
    title: "Alertas de salud para todos",
    effects: [
      { icon: Wind, text: "Síntomas respiratorios graves en población general", severity: "severe" },
      { icon: Heart, text: "Riesgo elevado de ataques cardíacos", severity: "severe" },
      { icon: Baby, text: "Peligro para desarrollo pulmonar en niños", severity: "severe" },
      { icon: Stethoscope, text: "Posible necesidad de atención médica", severity: "severe" }
    ],
    recommendation: "Toda la población debe evitar actividades al aire libre."
  },
  hazardous: {
    color: "bg-stone-100 border-stone-400",
    textColor: "text-stone-800",
    icon: UserX,
    title: "Emergencia de salud pública",
    effects: [
      { icon: Wind, text: "Falla respiratoria grave en población general", severity: "critical" },
      { icon: Heart, text: "Riesgo extremo de eventos cardiovasculares", severity: "critical" },
      { icon: Baby, text: "Peligro mortal para grupos vulnerables", severity: "critical" },
      { icon: Stethoscope, text: "Requerimiento inmediato de atención médica", severity: "critical" }
    ],
    recommendation: "Emergencia: todos deben permanecer en interior con filtración de aire."
  }
};

const severityStyles = {
  safe: "bg-green-200 text-green-800",
  mild: "bg-yellow-200 text-yellow-800",
  moderate: "bg-orange-200 text-orange-800",
  high: "bg-red-200 text-red-800",
  severe: "bg-purple-200 text-purple-800",
  critical: "bg-stone-200 text-stone-800"
};

interface HealthInformationProps {
  airQualityLevel: AirQualityLevel;
}

export function HealthInformation({ airQualityLevel }: HealthInformationProps) {
  const healthData = healthEffects[airQualityLevel];
  const Icon = healthData.icon;

  return (
    <Card className={`w-full border-2 ${healthData.color} bg-gradient-to-br from-white to-blue-50`}>
      <CardHeader className="text-center">
        <CardTitle className={`flex items-center justify-center gap-2 ${healthData.textColor}`}>
          <Icon className="w-5 h-5" />
          Información de Salud
        </CardTitle>
        <p className={`text-sm ${healthData.textColor}`}>
          {healthData.title}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {healthData.effects.map((effect, index) => {
            const EffectIcon = effect.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-2 rounded-full bg-blue-100">
                  <EffectIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{effect.text}</p>
                </div>
                <Badge className={`text-xs ${severityStyles[effect.severity]}`}>
                  {effect.severity === 'safe' && 'Seguro'}
                  {effect.severity === 'mild' && 'Leve'}
                  {effect.severity === 'moderate' && 'Moderado'}
                  {effect.severity === 'high' && 'Alto'}
                  {effect.severity === 'severe' && 'Severo'}
                  {effect.severity === 'critical' && 'Crítico'}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Recomendación principal */}
        <div className={`p-4 rounded-lg border-2 ${healthData.color}`}>
          <div className="flex items-start gap-3">
            <Stethoscope className={`w-5 h-5 mt-0.5 ${healthData.textColor}`} />
            <div>
              <h4 className={`text-sm mb-1 ${healthData.textColor}`}>Recomendación Médica</h4>
              <p className="text-sm text-gray-700">{healthData.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-center text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          🏥 <strong>Nota médica:</strong> Si experimentas síntomas persistentes como dificultad para respirar, 
          dolor en el pecho o irritación severa, consulta inmediatamente con un profesional médico.
        </div>
      </CardContent>
    </Card>
  );
}