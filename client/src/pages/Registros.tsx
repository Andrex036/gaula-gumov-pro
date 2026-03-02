import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, CalendarClock, ArrowRightLeft, Image as ImageIcon, X, Download, Loader2, FileSpreadsheet, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function Registros() {
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("Todos");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Estados para el reporte Excel
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const exportarRegistroComoImagen = async (e: React.MouseEvent, id: string | number) => {
    e.preventDefault();
    e.stopPropagation();

    const elemento = document.getElementById(`captura-registro-${id}`);
    if (!elemento) {
      toast.error("No se pudo ubicar el elemento para la captura.");
      return;
    }

    try {
      toast.loading("Generando y descargando imagen...", { id: `toast-img-${id}` });

      const imgData = await toPng(elemento, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: true,
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        },
        filter: (node) => {
          if (node.tagName === 'LINK') {
            const link = node as HTMLLinkElement;
            if (link.rel === 'stylesheet' && link.href && link.href.includes('googleapis')) {
              return false;
            }
          }
          return true;
        }
      });

      const link = document.createElement("a");
      link.href = imgData;
      link.download = `Registro-GAULA-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Imagen generada con éxito.", { id: `toast-img-${id}` });
    } catch (error) {
      console.error("Error al capturar la imagen:", error);
      toast.error("Hubo un error al crear la imagen.", { id: `toast-img-${id}` });
    }
  };

  const generarExcel = () => {
    let dataToExport = registros_diarios;

    // Filtrar por rango si ambos están definidos
    if (startDate && endDate) {
      dataToExport = registros_diarios.filter(r => r.fecha >= startDate && r.fecha <= endDate);
    }

    if (dataToExport.length === 0) {
      toast.error("No hay registros en el periodo seleccionado o coincidiendo con el filtro.");
      return;
    }

    const reportData = dataToExport.map(r => ({
      "Fecha": r.fecha,
      "Hora Salida": r.hora_salida,
      "Hora Regreso": r.hora_regreso || "--:--",
      "Siglas": r.vehiculo.siglas,
      "Placa": r.vehiculo.placa,
      "Tipo Vehículo": r.vehiculo.tipo,
      "Responsable": `${r.conductor.grado} ${r.conductor.nombres} ${r.conductor.apellidos}`,
      "Placa Policial": r.conductor.placa_policial,
      "Acompañantes": r.pasajeros || "Ninguno",
      "Destino": r.destino,
      "Misión": r.mision,
      "KM Salida": r.kilometraje_salida,
      "KM Regreso": r.kilometraje_regreso || "---",
      "Observaciones": r.observaciones || "",
      "Estado": r.estado_registro
    }));

    try {
      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Libro de Registro GAULA");

      // Ajustar anchos de columna básicos
      const wscols = [
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
        { wch: 15 }, { wch: 35 }, { wch: 15 }, { wch: 40 }, { wch: 25 },
        { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 40 }, { wch: 12 }
      ];
      ws['!cols'] = wscols;

      XLSX.writeFile(wb, `Reporte_Movimiento_${startDate || 'Historico'}_${endDate || ''}.xlsx`);
      toast.success("Excel generado y descargado con éxito.");
      setReportDialogOpen(false);
    } catch (error) {
      console.error("Error al generar Excel:", error);
      toast.error("Error técnico al procesar el archivo Excel.");
    }
  };

  const { data: registros_diarios = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/registros"],
  });

  const filtered = registros_diarios.filter(r => {
    const matchesSearch =
      r.vehiculo.siglas.toLowerCase().includes(search.toLowerCase()) ||
      r.conductor.apellidos.toLowerCase().includes(search.toLowerCase()) ||
      r.destino.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filterState === "Todos" || r.estado_registro === filterState;
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
            placeholder="Buscar registros..."
            className="pl-10 h-12 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-12 border-emerald-600 text-emerald-700 hover:bg-emerald-50 gap-2 font-bold px-4">
              <FileSpreadsheet className="h-5 w-5" />
              <span className="hidden sm:inline">Reporte</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                Exportar Reporte Excel
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Filtrar por Periodo (Opcional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="from" className="text-[10px]">Desde</Label>
                    <Input id="from" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="to" className="text-[10px]">Hasta</Label>
                    <Input id="to" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic mt-1">Si deja las fechas vacías se exportará el historial total ({registros_diarios.length} registros).</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setStartDate(""); setEndDate(""); }} className="h-11">Limpiar</Button>
              <Button onClick={generarExcel} className="bg-emerald-600 hover:bg-emerald-700 h-11 flex-1">
                Descargar Excel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={filterState !== "Todos" ? "default" : "outline"} size="icon" className={`h-12 w-12 shrink-0 ${filterState === 'Todos' ? 'bg-white' : ''}`}>
              <Filter className={`h-5 w-5 ${filterState !== 'Todos' ? 'text-white' : 'text-slate-600'}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuRadioGroup value={filterState} onValueChange={setFilterState}>
              <DropdownMenuRadioItem value="Todos">Todos los Estados</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Abierto">Solo estado Abierto</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Cerrado">Solo estado Cerrado</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        {filtered.map(reg => (
          <Card key={reg.id} id={`captura-registro-${reg.id}`} className="shadow-sm border-slate-200 overflow-hidden" data-testid={`card-registro-${reg.id}`}>
            <div className={`h-1 w-full ${reg.estado_registro === 'Abierto' ? 'bg-amber-400' : 'bg-primary'}`}></div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <CalendarClock className="h-4 w-4" />
                  {reg.fecha}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-primary transition-colors cursor-pointer z-10"
                    onClick={(e) => exportarRegistroComoImagen(e, reg.id)}
                    title="Exportar como imagen"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Badge variant={reg.estado_registro === 'Abierto' ? 'outline' : 'secondary'}
                    className={reg.estado_registro === 'Abierto' ? 'border-amber-400 text-amber-700 bg-amber-50' : ''}>
                    {reg.estado_registro}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-4 border-b pb-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-wider">Vehículo</p>
                    <p className="font-bold text-slate-800 text-base leading-tight">
                      {reg.vehiculo.siglas} <span className="text-slate-400 font-mono text-xs ml-1 tracking-tight">({reg.vehiculo.placa})</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-wider">Tipo</p>
                    <p className="text-xs font-semibold text-slate-600">{reg.vehiculo.tipo}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-wider">Responsable del Vehículo</p>
                  <p className="font-bold text-slate-900 leading-snug">
                    {reg.conductor.grado} {reg.conductor.nombres} {reg.conductor.apellidos}
                  </p>
                  <p className="text-xs text-slate-500 font-mono italic mt-0.5">{reg.conductor.placa_policial} • {reg.conductor.unidad}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-md border border-slate-200 mb-3 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Misión / Actividad</span>
                  <p className="text-sm text-slate-800 font-medium leading-tight">{reg.destino} — {reg.mision}</p>
                </div>
                {reg.pasajeros && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Personal Acompañante</span>
                    <p className="text-xs text-slate-700 leading-relaxed italic">{reg.pasajeros}</p>
                  </div>
                )}
                {reg.observaciones && (
                  <div className="pt-1 border-t border-slate-100 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Observaciones</span>
                    <p className="text-xs text-slate-600 leading-snug">{reg.observaciones}</p>
                  </div>
                )}
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
                  {reg.fotos_salida?.map((foto: string, idx: number) => (
                    <Dialog key={`salida-${idx}`}>
                      <DialogTrigger asChild>
                        <div className="relative shrink-0 w-16 h-16 rounded-md overflow-hidden border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity">
                          <img src={foto} crossOrigin="anonymous" alt="Salida" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 inset-x-0 bg-primary/80 text-[8px] text-white text-center py-0.5">S</div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="p-1 bg-black border-none max-w-lg">
                        <img src={foto} alt="Evidencia Salida" className="w-full h-auto rounded" />
                      </DialogContent>
                    </Dialog>
                  ))}
                  {/* Regreso */}
                  {reg.fotos_regreso?.map((foto: string, idx: number) => (
                    <Dialog key={`regreso-${idx}`}>
                      <DialogTrigger asChild>
                        <div className="relative shrink-0 w-16 h-16 rounded-md overflow-hidden border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity">
                          <img src={foto} crossOrigin="anonymous" alt="Regreso" className="w-full h-full object-cover" />
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