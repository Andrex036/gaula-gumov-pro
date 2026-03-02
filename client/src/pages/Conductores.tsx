import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserCircle2, Filter, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/authContext";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Conductores() {
  const { role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "Administrador";

  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("Todos");

  const { data: conductores = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/conductores"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/conductores/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar el registro");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conductores"] });
      toast({ title: "Registro eliminado", className: "bg-emerald-600 text-white" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: string, estado: string }) => {
      const res = await fetch(`/api/conductores/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado })
      });
      if (!res.ok) throw new Error("Error al actualizar el estado");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conductores"] });
      toast({ title: "Estado actualizado", className: "bg-emerald-600 text-white" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar este registro?")) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = conductores.filter((c: any) => {
    const matchesSearch =
      c.nombres.toLowerCase().includes(search.toLowerCase()) ||
      c.apellidos.toLowerCase().includes(search.toLowerCase()) ||
      c.placa_policial.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filterState === "Todos" || c.estado === filterState;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar por nombre o placa..."
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
              <DropdownMenuRadioItem value="Activo">Solo estado Activo</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Inactivo">Solo estado Inactivo</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        {filtered.map((conductor: any) => (
          <Card key={conductor.id} className="shadow-sm border-slate-200" data-testid={`card-conductor-${conductor.id}`}>
            <CardContent className="p-4 flex items-center gap-4 relative">
              <div className="bg-slate-100 p-2 rounded-full">
                <UserCircle2 className="h-8 w-8 text-slate-500" />
              </div>
              <div className="flex-1 pr-8">
                <h3 className="font-bold text-slate-800 leading-tight">
                  {conductor.nombres} {conductor.apellidos}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {conductor.grado} • {conductor.placa_policial}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-medium text-slate-500">{conductor.unidad}</span>
                  {isAdmin ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                          <Badge
                            variant={conductor.estado === 'Activo' ? 'default' : 'secondary'}
                            className={`${conductor.estado === 'Activo' ? 'bg-emerald-600' : 'bg-slate-400 text-white'} cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap`}
                          >
                            {conductor.estado}
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuRadioGroup
                          value={conductor.estado}
                          onValueChange={(val) => statusMutation.mutate({ id: conductor.id, estado: val })}
                        >
                          <DropdownMenuRadioItem value="Activo">Activo</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="Inactivo">Inactivo</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Badge variant={conductor.estado === 'Activo' ? 'default' : 'secondary'} className={conductor.estado === 'Activo' ? 'bg-emerald-600' : ''}>
                      {conductor.estado}
                    </Badge>
                  )}
                </div>
              </div>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 text-slate-300 hover:text-rose-600"
                  onClick={() => handleDelete(conductor.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center p-8 text-slate-500">
            No se encontraron conductores.
          </div>
        )}
      </div>
    </div>
  );
}