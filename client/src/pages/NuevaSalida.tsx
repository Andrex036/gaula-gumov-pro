import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Check, Plus, Trash2, AlertTriangle, CalendarClock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CONDUCTORES, VEHICULOS } from "@/lib/mock-data";
import { isBefore, parseISO } from "date-fns";

export default function NuevaSalida() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const today = new Date();
  
  const [vehiculoId, setVehiculoId] = useState("");
  const [conductorId, setConductorId] = useState("");
  const [pasajeros, setPasajeros] = useState<string[]>([]);
  
  const checklistItems = [
    { id: "aceite", label: "Nivel de Aceite" },
    { id: "frenos", label: "Sistema de Frenos" },
    { id: "luces", label: "Sistema de Luces" },
    { id: "llantas", label: "Estado de Llantas" },
    { id: "refrigeracion", label: "Sistema de Refrigeración" }
  ];

  const vehiculoSel = VEHICULOS.find(v => v.id === vehiculoId);
  const conductorSel = CONDUCTORES.find(c => c.id === conductorId);

  const isVencido = (dateStr?: string) => {
    if (!dateStr) return false;
    try {
      return isBefore(parseISO(dateStr), today);
    } catch (e) {
      return false;
    }
  };

  const soatVencido = isVencido(vehiculoSel?.vencimiento_soat);
  const tmVencida = isVencido(vehiculoSel?.vencimiento_tecnomecanica);
  const tieneAlertas = soatVencido || tmVencida;

  const addPasajero = (id: string) => {
    if (id && !pasajeros.includes(id) && id !== conductorId) {
      setPasajeros([...pasajeros, id]);
    }
  };

  const removePasajero = (id: string) => {
    setPasajeros(pasajeros.filter(p => p !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiculoSel || !conductorSel) {
      toast({ title: "Error", description: "Seleccione conductor y vehículo", variant: "destructive" });
      return;
    }

    if (tieneAlertas) {
      toast({
        title: "Atención: Documentación Vencida",
        description: "Se registrará la salida a pesar de tener documentos vencidos. Reporte esta novedad.",
        variant: "destructive",
      });
    }
    
    toast({
      title: "Salida registrada",
      description: `Vehículo ${vehiculoSel.siglas} en misión con ${pasajeros.length} pasajeros.`,
    });
    setLocation("/dashboard");
  };

  return (
    <div className="pb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Registrar Salida</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CONDUCTOR SELECTION */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b pb-3 pt-4">
            <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">Responsable</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label>Conductor Principal</Label>
              <Select value={conductorId} onValueChange={setConductorId}>
                <SelectTrigger className="h-12 bg-white">
                  <SelectValue placeholder="Seleccione conductor..." />
                </SelectTrigger>
                <SelectContent>
                  {CONDUCTORES.filter(c => c.estado === 'Activo').map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.grado} {c.apellidos} - {c.placa_policial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {conductorSel && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 animate-in fade-in slide-in-from-top-1">
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
              <Label>Seleccionar Vehículo</Label>
              <Select value={vehiculoId} onValueChange={setVehiculoId}>
                <SelectTrigger className="h-12 bg-white">
                  <SelectValue placeholder="Seleccione vehículo..." />
                </SelectTrigger>
                <SelectContent>
                  {VEHICULOS.filter(v => v.estado === 'Disponible').map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.siglas} - {v.placa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {vehiculoSel && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                <div className="bg-emerald-50 p-3 rounded-md border border-emerald-100">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-emerald-900 text-lg">{vehiculoSel.siglas}</p>
                    <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-1 rounded text-xs">KM: {vehiculoSel.kilometraje_actual}</span>
                  </div>
                  <p className="text-sm text-emerald-700 mt-1">Placa: {vehiculoSel.placa} | {vehiculoSel.tipo}</p>
                </div>

                {/* ALERTAS DE DOCUMENTACIÓN */}
                {tieneAlertas && (
                  <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-900">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    <AlertTitle className="font-bold">Alerta de Documentación</AlertTitle>
                    <AlertDescription className="text-xs space-y-1 mt-1">
                      {soatVencido && <p className="flex items-center gap-1"><CalendarClock className="h-3 w-3" /> SOAT VENCIDO: {vehiculoSel.vencimiento_soat}</p>}
                      {tmVencida && <p className="flex items-center gap-1"><CalendarClock className="h-3 w-3" /> TECNOMECÁNICA VENCIDA: {vehiculoSel.vencimiento_tecnomecanica}</p>}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PASAJEROS */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b pb-3 pt-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">Pasajeros</CardTitle>
            <Badge variant="outline">{pasajeros.length}</Badge>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex gap-2">
              <Select onValueChange={addPasajero} value="">
                <SelectTrigger className="h-12 bg-white flex-1">
                  <SelectValue placeholder="Agregar pasajero..." />
                </SelectTrigger>
                <SelectContent>
                  {CONDUCTORES.filter(c => c.estado === 'Activo' && c.id !== conductorId && !pasajeros.includes(c.id)).map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.grado} {c.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {pasajeros.map(pId => {
                const p = CONDUCTORES.find(c => c.id === pId);
                return ( p && (
                  <div key={pId} className="flex items-center justify-between p-2 bg-slate-50 rounded border animate-in zoom-in-95">
                    <span className="text-sm font-medium">{p.grado} {p.apellidos} {p.nombres}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removePasajero(pId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ));
              })}
            </div>
          </CardContent>
        </Card>

        {/* CHECKLIST OPERACIONAL */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b pb-3 pt-4">
            <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">Chequeo Operacional</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <Checkbox id={item.id} required />
                  <Label htmlFor={item.id} className="text-sm font-medium leading-none cursor-pointer">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* MISSION DETAILS */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b pb-3 pt-4">
            <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">Misión</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="destino">Destino</Label>
              <Input id="destino" placeholder="Lugar de destino" required className="h-12 bg-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mision">Actividad</Label>
              <Input id="mision" placeholder="Propósito de la salida" required className="h-12 bg-white" />
            </div>
            <Button type="button" variant="outline" className="w-full h-14 border-dashed border-2 flex gap-2 text-slate-500 bg-slate-50">
              <Camera className="h-5 w-5" /> Evidencia Odómetro
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-lg" data-testid="button-guardar-salida">
          <Check className="mr-2 h-5 w-5" /> Registrar Salida
        </Button>
      </form>
    </div>
  );
}

function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: string, className?: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${variant === 'outline' ? 'border border-slate-300 text-slate-600' : 'bg-primary text-white'} ${className}`}>
      {children}
    </span>
  );
}