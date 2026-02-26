import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Car, CalendarDays, AlertTriangle } from "lucide-react";
import { VEHICULOS } from "@/lib/mock-data";
import { isBefore, parseISO } from "date-fns";

export default function Vehiculos() {
  const [search, setSearch] = useState("");
  const today = new Date();

  const filtered = VEHICULOS.filter(v => 
    v.placa.toLowerCase().includes(search.toLowerCase()) || 
    v.siglas.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Disponible": return "bg-emerald-600";
      case "En misión": return "bg-blue-600";
      case "Mantenimiento": return "bg-rose-600";
      default: return "bg-slate-500";
    }
  };

  const isVencido = (dateStr: string) => {
    try {
      return isBefore(parseISO(dateStr), today);
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <Input 
          placeholder="Buscar por placa o siglas..." 
          className="pl-10 h-12 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.map(vehiculo => {
          const soatVencido = isVencido(vehiculo.vencimiento_soat);
          const tmVencida = isVencido(vehiculo.vencimiento_tecnomecanica);
          
          return (
            <Card key={vehiculo.id} className="shadow-sm border-slate-200" data-testid={`card-vehiculo-${vehiculo.id}`}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="bg-slate-100 p-2 rounded-full mt-1">
                  <Car className="h-8 w-8 text-slate-500" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">
                      {vehiculo.siglas}
                    </h3>
                    <Badge className={getStatusColor(vehiculo.estado)}>
                      {vehiculo.estado}
                    </Badge>
                  </div>
                  <p className="font-mono text-sm text-slate-600 mt-1">
                    Placa: {vehiculo.placa}
                  </p>
                  
                  {/* Documentación */}
                  <div className="mt-3 grid grid-cols-1 gap-2 border-t pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> Venc. SOAT:
                      </span>
                      <span className={`font-medium ${soatVencido ? 'text-rose-600 flex items-center gap-1' : 'text-slate-700'}`}>
                        {vehiculo.vencimiento_soat}
                        {soatVencido && <AlertTriangle className="h-3 w-3 animate-pulse" />}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> Venc. Tecno:
                      </span>
                      <span className={`font-medium ${tmVencida ? 'text-rose-600 flex items-center gap-1' : 'text-slate-700'}`}>
                        {vehiculo.vencimiento_tecnomecanica}
                        {tmVencida && <AlertTriangle className="h-3 w-3 animate-pulse" />}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded">
                    <span>{vehiculo.tipo}</span>
                    <span>KM: {vehiculo.kilometraje_actual.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center p-8 text-slate-500">
            No se encontraron vehículos.
          </div>
        )}
      </div>
    </div>
  );
}