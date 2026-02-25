import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserCircle2 } from "lucide-react";
import { CONDUCTORES } from "@/lib/mock-data";

export default function Conductores() {
  const [search, setSearch] = useState("");

  const filtered = CONDUCTORES.filter(c => 
    c.nombres.toLowerCase().includes(search.toLowerCase()) || 
    c.apellidos.toLowerCase().includes(search.toLowerCase()) ||
    c.placa_policial.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <Input 
          placeholder="Buscar por nombre o placa..." 
          className="pl-10 h-12 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.map(conductor => (
          <Card key={conductor.id} className="shadow-sm border-slate-200" data-testid={`card-conductor-${conductor.id}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-slate-100 p-2 rounded-full">
                <UserCircle2 className="h-8 w-8 text-slate-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 leading-tight">
                  {conductor.nombres} {conductor.apellidos}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {conductor.grado} • {conductor.placa_policial}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-medium text-slate-500">{conductor.unidad}</span>
                  <Badge variant={conductor.estado === 'Activo' ? 'default' : 'secondary'} className={conductor.estado === 'Activo' ? 'bg-emerald-600' : ''}>
                    {conductor.estado}
                  </Badge>
                </div>
              </div>
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