import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { REGISTROS_DIARIOS } from "@/lib/mock-data";

export default function CompletarRegreso() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Try to parse ID from URL search string if we had standard React Router, 
  // but with Wouter we'll just use state for this mockup or pick the first open
  const [registroId, setRegistroId] = useState("");
  
  const pendientes = REGISTROS_DIARIOS.filter(r => r.estado_registro === "Abierto");
  const registroSel = pendientes.find(r => r.id === registroId) || pendientes[0];

  useEffect(() => {
    if (registroSel && !registroId) {
      setRegistroId(registroSel.id);
    }
  }, [registroSel, registroId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registroSel) return;
    
    toast({
      title: "Regreso completado",
      description: "El vehículo se encuentra disponible.",
      className: "bg-emerald-600 text-white border-none",
    });
    setLocation("/dashboard");
  };

  if (pendientes.length === 0) {
    return (
      <div className="text-center p-12">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-slate-700">No hay pendientes</h2>
        <p className="text-slate-500 mt-2">Todos los vehículos han regresado.</p>
        <Button className="mt-6" onClick={() => setLocation("/dashboard")}>Volver a Inicio</Button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Completar Regreso</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="space-y-2">
          <Label>Seleccionar Registro Abierto</Label>
          <Select value={registroId} onValueChange={setRegistroId}>
            <SelectTrigger className="h-12 bg-white border-amber-300 bg-amber-50">
              <SelectValue placeholder="Seleccione..." />
            </SelectTrigger>
            <SelectContent>
              {pendientes.map(r => (
                <SelectItem key={r.id} value={r.id}>
                  {r.vehiculo.siglas} - {r.conductor.apellidos} ({r.hora_salida})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {registroSel && (
          <Card className="bg-slate-50 border-0 shadow-sm mb-6">
            <CardContent className="p-4 text-sm space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Vehículo:</span>
                <span className="font-bold">{registroSel.vehiculo.siglas} ({registroSel.vehiculo.placa})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2 pt-1">
                <span className="text-slate-500">Conductor:</span>
                <span className="font-semibold">{registroSel.conductor.apellidos}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2 pt-1">
                <span className="text-slate-500">Misión:</span>
                <span>{registroSel.destino}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">KM Salida:</span>
                <span className="font-mono bg-blue-100 text-blue-800 px-2 rounded">{registroSel.kilometraje_salida}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b pb-3 pt-4">
            <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">Datos de Regreso</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="km_regreso">Kilometraje de Regreso</Label>
              <Input 
                id="km_regreso" 
                type="number" 
                min={registroSel?.kilometraje_salida || 0} 
                placeholder="Ej. 15450" 
                required 
                className="h-12 bg-white font-mono text-lg" 
              />
              <p className="text-xs text-slate-500">Debe ser mayor o igual al KM de salida.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="novedades">Novedades / Observaciones</Label>
              <Textarea 
                id="novedades" 
                placeholder="Indique si hubo alguna novedad (choque, falla mecánica, etc.) o escriba 'Sin novedades'" 
                required
                className="min-h-24 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Evidencia Fotográfica</Label>
              <Button type="button" variant="outline" className="w-full h-14 border-dashed border-2 flex gap-2 text-slate-500 bg-slate-50">
                <Camera className="h-5 w-5" /> Tomar Foto Odómetro
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-md" data-testid="button-guardar-regreso">
          <CheckCircle2 className="mr-2 h-5 w-5" /> Cerrar Registro
        </Button>
      </form>
    </div>
  );
}