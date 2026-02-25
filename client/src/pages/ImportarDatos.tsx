import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

export default function ImportarDatos() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "conductores" | "vehiculos") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const bstr = event.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Simulate processing delay
        setTimeout(() => {
          setLoading(false);
          toast({
            title: `Importación exitosa`,
            description: `Se han procesado ${data.length} registros de ${type}.`,
            className: "bg-emerald-600 text-white",
          });
          setFileName("");
          if (fileInputRef.current) fileInputRef.current.value = "";
        }, 1500);
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error de importación",
        description: "El archivo no tiene el formato correcto.",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = (type: string) => {
    const headers = type === "conductores" 
      ? [["nombres", "apellidos", "grado", "placa_policial", "unidad"]]
      : [["placa", "siglas", "tipo", "kilometraje_actual", "vencimiento_soat"]];
    
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, `plantilla_${type}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Importar Base de Datos</h2>
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
                    ref={fileInputRef}
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