import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, MapPin } from "lucide-react";

interface CitySearchProps {
  onSearch: (city: string) => void;
  loading?: boolean;
}

export function CitySearch({ onSearch, loading = false }: CitySearchProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // En una app real, usarías las coordenadas para obtener el clima
          onSearch("Tu Ubicación");
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar ciudad..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 border-sky-300 focus:border-sky-500 bg-white/80"
            disabled={loading}
          />
        </div>
        <Button 
          type="submit" 
          disabled={loading || !query.trim()}
          className="bg-sky-500 hover:bg-sky-600 text-white"
        >
          {loading ? "Buscando..." : "Buscar"}
        </Button>
      </div>
      
      <Button
        type="button"
        variant="outline"
        onClick={handleCurrentLocation}
        className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
        disabled={loading}
      >
        <MapPin className="w-4 h-4 mr-2" />
        Usar mi ubicación
      </Button>
    </form>
  );
}