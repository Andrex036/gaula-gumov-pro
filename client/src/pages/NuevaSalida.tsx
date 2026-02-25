import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CONDUCTORES, VEHICULOS } from "@/lib/mock-data";

export default function NuevaSalida() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [vehiculoId, setVehiculoId] = useState("");
  const [conductorId, setConductorId] = useState("");

  const vehiculoSel = VEHICULOS.find(v => v.id === vehiculoId);
  const conductorSel = CONDUCTORES.find(c => c.id === conductorId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiculoSel || !conductorSel) {
      toast({ title: "Error", description: "Seleccione conductor y vehículo", variant: "destructive" });
      return;
    }
    
    toast({
      title: "Salida registrada",
      description: `Vehículo ${vehiculoSel.siglas} en misión.`,
    });
    setLocation("/dashboard");
  };

  return (
    <div className="pb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Registrar Salida</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CONDUCTOR SELECTION */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b pb-3 pt-4">
            <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">Conductor</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label>Buscar Conductor</Label>
              <Select value={conductorId} onValueChange={setConductorId}>
                <SelectTrigger className="h-12 bg-white">
                  <SelectValue placeholder="Seleccione conductor..." />
                </SelectTrigger>
                <SelectContent>
                  {CONDUCTORES.filter(c => c.estado === 'Activo').map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombres} {c.apellidos} - {c.placa_policial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {conductorSel && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                <p className="font-semibold text-blue-900">{conductorSel.grado} {conductorSel.nombres} {conductorSel.apellidos}</p>
                <p className="text-xs text-blue-700 mt-1">Placa: {conductorSel.placa_policial} | {conductorSel.unidad}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* VEHICLE SELECTION */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b pb-3 pt-4">
            <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">Vehículo</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label>Buscar Vehículo</Label>
              <Select value={vehiculoId} onValueChange={setVehiculoId}>
                <SelectTrigger className="h-12 bg-white">
                  <SelectValue placeholder="Seleccione vehículo..." />
                </SelectTrigger>
                <SelectContent>
                  {VEHICULOS.filter(v => v.estado === 'Disponible').map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.siglas} - {v.placa} ({v.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {vehiculoSel && (
              <div className="bg-emerald-50 p-3 rounded-md border border-emerald-100">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-emerald-900 text-lg">{vehiculoSel.siglas}</p>
                  <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-1 rounded text-xs">KM: {vehiculoSel.kilometraje_actual}</span>
                </div>
                <p className="text-sm text-emerald-700 mt-1">Placa: {vehiculoSel.placa} | {vehiculoSel.tipo}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* MISSION DETAILS */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b pb-3 pt-4">
            <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">Misión y Destino</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="destino">Lugar de Destino</Label>
              <Input id="destino" placeholder="Ej. Barrio Centro" required className="h-12 bg-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mision">Actividad / Misión</Label>
              <Input id="mision" placeholder="Ej. Patrullaje de rutina" required className="h-12 bg-white" />
            </div>
            <div className="space-y-2">
              <Label>Evidencia Fotográfica (Odómetro / Vehículo)</Label>
              <Button type="button" variant="outline" className="w-full h-14 border-dashed border-2 flex gap-2 text-slate-500 bg-slate-50">
                <Camera className="h-5 w-5" /> Tomar Foto de Salida
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-md" data-testid="button-guardar-salida">
          <Check className="mr-2 h-5 w-5" /> Registrar Salida
        </Button>
      </form>
    </div>
  );
}