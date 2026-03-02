import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function ImportarDatos() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const mutationConductores = useMutation({
    mutationFn: async (data: any[]) => {
      console.log("Enviando datos al servidor:", data);
      const res = await fetch("/api/conductores/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorMsg = await res.json().catch(() => ({ message: "Error de servidor (400/500)" }));
        throw new Error(errorMsg.message || `Fallo importación conductores (${res.status})`);
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conductores"] });
      toast({
        title: "Importación exitosa",
        description: `Se han procesado ${data.count} registros de conductores.`,
        className: "bg-emerald-600 text-white",
      });
    },
    onError: (error) => {
      toast({
        title: "Error de importación",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const mutationVehiculos = useMutation({
    mutationFn: async (data: any[]) => {
      console.log("Enviando datos de vehículos al servidor:", data);
      const res = await fetch("/api/vehiculos/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorMsg = await res.json().catch(() => ({ message: "Error de servidor (400/500)" }));
        throw new Error(errorMsg.message || `Fallo importación vehículos (${res.status})`);
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehiculos"] });
      toast({
        title: "Importación exitosa",
        description: `Se han procesado ${data.count} registros de vehículos.`,
        className: "bg-emerald-600 text-white",
      });
    },
    onError: (error) => {
      toast({
        title: "Error de importación",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "conductores" | "vehiculos") => {
    const inputTarget = e.target;
    const file = inputTarget.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    try {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const ab = event.target?.result;
          const wb = XLSX.read(ab, { type: "array" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];

          // Leer como matriz (array de arrays) para ser independientes del nombre exacto de la cabecera
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

          if (rows.length <= 1) { // 1 es la cabecera
            setLoading(false);
            toast({ title: "Archivo vacío", description: "La hoja de cálculo no contiene datos debajo de la cabecera.", variant: "destructive" });
            inputTarget.value = "";
            return;
          }

          // La primera fila son las cabeceras (la ignoramos para procesar datos)
          const dataRows = rows.slice(1);

          if (type === "conductores") {
            const data = dataRows.map(row => ({
              nombres: String(row[0] || "").trim(),
              apellidos: String(row[1] || "").trim(),
              grado: String(row[2] || "Patrullero").trim(),
              placa_policial: String(row[3] || "").trim(),
              unidad: String(row[4] || "GAULA").trim(),
            })).filter(item => item.nombres && item.placa_policial);

            if (data.length === 0) {
              throw new Error("No se encontraron registros válidos. Asegúrese de llenar 'NOMBRES' y 'PLACA POLICIAL'.");
            }

            mutationConductores.mutate(data, {
              onSettled: () => {
                setLoading(false);
                setFileName("");
                inputTarget.value = "";
              }
            });
          } else {
            const data = dataRows.map(row => {
              const formatExcelDate = (val: any) => {
                if (!val) return "";
                if (typeof val === 'number') {
                  const date = new Date((val - 25569) * 86400 * 1000);
                  return date.toISOString().split('T')[0];
                }
                return String(val).trim();
              };
              return {
                placa: String(row[0] || "").trim(),
                siglas: String(row[1] || "").trim(),
                tipo: String(row[2] || "Automóvil").trim(),
                kilometraje_actual: parseInt(row[3]) || 0,
                vencimiento_soat: formatExcelDate(row[4]),
                vencimiento_tecnomecanica: formatExcelDate(row[5]),
              };
            }).filter(item => item.placa && item.siglas);

            if (data.length === 0) {
              throw new Error("No se encontraron registros válidos. Asegúrese de llenar 'PLACA' y 'SIGLAS'.");
            }

            mutationVehiculos.mutate(data, {
              onSettled: () => {
                setLoading(false);
                setFileName("");
                inputTarget.value = "";
              }
            });
          }
        } catch (err: any) {
          console.error("Error procesando Excel:", err);
          setLoading(false);
          toast({
            title: "Error de Formato/Proceso",
            description: err.message || "Hubo un fallo al analizar el archivo. Verifique que sea un .xlsx válido.",
            variant: "destructive"
          });
          inputTarget.value = "";
        }
      };

      reader.onerror = () => {
        setLoading(false);
        toast({ title: "Error de lectura", description: "El navegador no pudo procesar el archivo físico.", variant: "destructive" });
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error inesperado",
        description: "El archivo no se pudo cargar a la memoria.",
        variant: "destructive",
      });
      inputTarget.value = "";
    }
  };

  const downloadTemplate = (type: string) => {
    const headers = type === "conductores"
      ? [["NOMBRES", "APELLIDOS", "GRADO", "PLACA POLICIAL", "UNIDAD"]]
      : [["PLACA", "SIGLAS", "TIPO VEHICULO", "KILOMETRAJE ACTUAL", "VENCIMIENTO SOAT (AAAA-MM-DD)", "VENCIMIENTO TECNO (AAAA-MM-DD)"]];

    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, `plantilla_${type}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center items-center gap-2">
          <h2 className="text-2xl font-bold text-slate-800">Importar Base de Datos</h2>
          <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-mono">v2.3</span>
        </div>
        <p className="text-slate-500 text-sm">Cargue archivos Excel (.xlsx) para actualizar maestros masivamente</p>
      </div>

      <div className="grid gap-4">
        {/* CONDUCTORES IMPORT */}
        <Card className="border-2 border-dashed border-slate-200 shadow-none hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <FileUp className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Conductores y Funcionarios</CardTitle>
                <CardDescription>Sube la lista de personal del GAULA</CardDescription>
              </div>

              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 h-12 gap-2"
                  onClick={() => downloadTemplate("conductores")}
                >
                  <Download className="h-4 w-4" /> Plantilla
                </Button>
                <div className="flex-1 relative">
                  <Input
                    type="file"
                    accept=".xlsx, .xls"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 h-12"
                    onChange={(e) => handleFileUpload(e, "conductores")}
                    disabled={loading}
                  />
                  <Button className="w-full h-12 gap-2" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                    Cargar Excel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VEHICULOS IMPORT */}
        <Card className="border-2 border-dashed border-slate-200 shadow-none hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FileUp className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Parque Automotor</CardTitle>
                <CardDescription>Sube la lista de vehículos y motocicletas</CardDescription>
              </div>

              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 h-12 gap-2"
                  onClick={() => downloadTemplate("vehiculos")}
                >
                  <Download className="h-4 w-4" /> Plantilla
                </Button>
                <div className="flex-1 relative">
                  <Input
                    type="file"
                    accept=".xlsx, .xls"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 h-12"
                    onChange={(e) => handleFileUpload(e, "vehiculos")}
                    disabled={loading}
                  />
                  <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 gap-2" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                    Cargar Excel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 space-y-2">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
          <AlertCircle className="h-4 w-4" /> Instrucciones Importantes
        </div>
        <ul className="text-xs text-amber-700 space-y-1 list-disc pl-4">
          <li>Use las plantillas descargables para asegurar el orden de las columnas.</li>
          <li>Los registros duplicados (por placa o placa policial) serán omitidos.</li>
          <li>El sistema validará que los campos obligatorios no estén vacíos.</li>
        </ul>
      </div>
    </div>
  );
}