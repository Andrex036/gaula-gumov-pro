import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Car, CalendarDays, AlertTriangle, Filter, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { isBefore, parseISO } from "date-fns";
import { useAuth } from "@/lib/authContext";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Vehiculos() {
  const { role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "Administrador";

  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("Todos");
  const today = new Date();

  const { data: vehiculos = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/vehiculos"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/vehiculos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar el vehículo");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehiculos"] });
      toast({ title: "Vehículo eliminado", className: "bg-emerald-600 text-white" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: string, estado: string }) => {
      const res = await fetch(`/api/vehiculos/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado })
      });
      if (!res.ok) throw new Error("Error al actualizar el estado");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehiculos"] });
      toast({ title: "Estado actualizado", className: "bg-emerald-600 text-white" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar este vehículo?")) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = vehiculos.filter(v => {
    const matchesSearch =
      v.placa.toLowerCase().includes(search.toLowerCase()) ||
      v.siglas.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filterState === "Todos" || v.estado === filterState;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Disponible": return "bg-emerald-600";
      case "En misión": return "bg-blue-600";
      case "Mantenimiento": return "bg-rose-500";
      case "Fuera de Servicio": return "bg-rose-900";
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
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar por placa o siglas..."
            className="pl-10 h-12 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={filterState !== "Todos" ? "default" : "outline"} size="icon" className={`h-12 w-12 shrink-0 ${filterState === 'Todos' ? 'bg-white' : ''}`}>
              <Filter className={`h-5 w-5 ${filterState !== 'Todos' ? 'text-white' : 'text-slate-600'}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuRadioGroup value={filterState} onValueChange={setFilterState}>
              <DropdownMenuRadioItem value="Todos">Todos los Estados</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Disponible">Solo Disponibles</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="En misión">En misión</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Mantenimiento">Mantenimiento</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Fuera de Servicio">Fuera de Servicio</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
                    <div className="flex items-center gap-2">
                      {isAdmin ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                              <Badge className={`${getStatusColor(vehiculo.estado)} cursor-pointer hover:opacity-80 transition-opacity`}>
                                {vehiculo.estado}
                              </Badge>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuRadioGroup
                              value={vehiculo.estado}
                              onValueChange={(val) => statusMutation.mutate({ id: vehiculo.id, estado: val })}
                            >
                              <DropdownMenuRadioItem value="Disponible">Disponible</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="Mantenimiento">Mantenimiento</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="Fuera de Servicio">Fuera de Servicio</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Badge className={getStatusColor(vehiculo.estado)}>
                          {vehiculo.estado}
                        </Badge>
                      )}

                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-300 hover:text-rose-600"
                          onClick={() => handleDelete(vehiculo.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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