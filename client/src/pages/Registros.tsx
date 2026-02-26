import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, CalendarClock, ArrowRightLeft, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REGISTROS_DIARIOS } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function Registros() {
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filtered = REGISTROS_DIARIOS.filter(r => 
    r.vehiculo.siglas.toLowerCase().includes(search.toLowerCase()) || 
    r.conductor.apellidos.toLowerCase().includes(search.toLowerCase()) ||
    r.destino.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Buscar registros..." 
            className="pl-10 h-12 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-12 w-12 bg-white shrink-0">
          <Filter className="h-5 w-5 text-slate-600" />
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.map(reg => (
          <Card key={reg.id} className="shadow-sm border-slate-200 overflow-hidden" data-testid={`card-registro-${reg.id}`}>
            <div className={`h-1 w-full ${reg.estado_registro === 'Abierto' ? 'bg-amber-400' : 'bg-primary'}`}></div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <CalendarClock className="h-4 w-4" />
                  {reg.fecha}
                </div>
                <Badge variant={reg.estado_registro === 'Abierto' ? 'outline' : 'secondary'} 
                       className={reg.estado_registro === 'Abierto' ? 'border-amber-400 text-amber-700 bg-amber-50' : ''}>
                  {reg.estado_registro}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Vehículo</p>
                  <p className="font-bold text-slate-800">{reg.vehiculo.siglas}</p>
                  <p className="text-xs text-slate-500">{reg.vehiculo.placa}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Conductor</p>
                  <p className="font-bold text-slate-800 truncate" title={reg.conductor.apellidos}>
                    {reg.conductor.apellidos}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{reg.conductor.grado}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded text-sm mb-3">
                <span className="font-semibold text-slate-700">Misión:</span> {reg.destino}
              </div>

              <div className="flex items-center justify-between text-xs font-mono bg-slate-100 p-2 rounded mb-3">
                <div className="flex flex-col">
                  <span className="text-slate-400">Salida</span>
                  <span className="text-slate-700 font-bold">{reg.hora_salida} • {reg.kilometraje_salida}KM</span>
                </div>
                <ArrowRightLeft className="h-4 w-4 text-slate-400 mx-2" />
                <div className="flex flex-col items-end">
                  <span className="text-slate-400">Regreso</span>
                  <span className={`font-bold ${!reg.hora_regreso ? 'text-amber-600' : 'text-slate-700'}`}>
                    {reg.hora_regreso || '--:--'} • {reg.kilometraje_regreso || '---'}KM
                  </span>
                </div>
              </div>

              {/* GALERIA DE FOTOS */}
              <div className="space-y-2 pt-2 border-t">
                <p className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" /> Evidencia Fotográfica
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {/* Salida */}
                  {reg.fotos_salida?.map((foto, idx) => (
                    <Dialog key={`salida-${idx}`}>
                      <DialogTrigger asChild>
                        <div className="relative shrink-0 w-16 h-16 rounded-md overflow-hidden border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity">
                          <img src={foto} alt="Salida" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 inset-x-0 bg-primary/80 text-[8px] text-white text-center py-0.5">S</div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="p-1 bg-black border-none max-w-lg">
                        <img src={foto} alt="Evidencia Salida" className="w-full h-auto rounded" />
                      </DialogContent>
                    </Dialog>
                  ))}
                  {/* Regreso */}
                  {reg.fotos_regreso?.map((foto, idx) => (
                    <Dialog key={`regreso-${idx}`}>
                      <DialogTrigger asChild>
                        <div className="relative shrink-0 w-16 h-16 rounded-md overflow-hidden border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity">
                          <img src={foto} alt="Regreso" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 inset-x-0 bg-emerald-600/80 text-[8px] text-white text-center py-0.5">R</div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="p-1 bg-black border-none max-w-lg">
                        <img src={foto} alt="Evidencia Regreso" className="w-full h-auto rounded" />
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
            No se encontraron registros.
          </div>
        )}
      </div>
    </div>
  );
}