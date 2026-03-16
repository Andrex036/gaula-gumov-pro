import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightSquare, ArrowLeftSquare, AlertCircle, CarFront, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/authContext";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { role } = useAuth();
  const isAdmin = role === "Administrador";

  const { data: vehiculos = [], isLoading: loadingV } = useQuery<any[]>({
    queryKey: ["/api/vehiculos"],
  });
  const { data: todosLosRegistros = [], isLoading: loadingR } = useQuery<any[]>({
    queryKey: ["/api/registros"],
  });

  const disponibles = vehiculos.filter(v => v.estado === "Disponible").length;
  const enMision = vehiculos.filter(v => v.estado === "En misión").length;
  const mantenimiento = vehiculos.filter(v => v.estado === "Mantenimiento" || v.estado === "Fuera de Servicio").length;

  const pendientesRegreso = todosLosRegistros.filter(r => r.estado_registro === "Abierto");

  // Get current date as string in YYYY-MM-DD format for simple string comparison
  const todayStr = new Date().toISOString().split('T')[0];

  const vehiculosVencidos = vehiculos.filter(v => {
    const isSoatVencido = v.vencimiento_soat && v.vencimiento_soat < todayStr;
    const isTecnoVencida = v.vencimiento_tecnomecanica && v.vencimiento_tecnomecanica < todayStr;
    return isSoatVencido || isTecnoVencida;
  });
  if (loadingV || loadingR) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/salida">
          <Button className="w-full h-24 flex flex-col gap-2 bg-primary hover:bg-primary/90 shadow-lg border-b-4 border-black/20 active:translate-y-1 active:border-b-0 transition-all" data-testid="button-nueva-salida">
            <ArrowRightSquare className="h-6 w-6" />
            <span className="font-bold">Nueva Salida</span>
          </Button>
        </Link>
        <Link href="/regreso">
          <Button className="w-full h-24 flex flex-col gap-2 bg-emerald-700 hover:bg-emerald-800 shadow-lg border-b-4 border-black/20 active:translate-y-1 active:border-b-0 transition-all" data-testid="button-completar-regreso">
            <ArrowLeftSquare className="h-6 w-6" />
            <span className="font-bold">Completar Regreso</span>
          </Button>
        </Link>
      </div>

      {isAdmin && (
        <>
          {/* Fleet Status */}
          <section>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-800">
              <CarFront className="h-5 w-5 text-primary" /> Estado del Parque Automotor
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <Card className="bg-white border shadow-sm">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{disponibles}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Disponibles</p>
                </CardContent>
              </Card>
              <Card className="bg-white border shadow-sm">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{enMision}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">En Misión</p>
                </CardContent>
              </Card>
              <Card className="bg-white border shadow-sm">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-rose-700">{mantenimiento}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">F/Servicio/Manto</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Alerts / Pendientes */}
          <section>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-800">
              <AlertCircle className="h-5 w-5 text-amber-600" /> Alertas
            </h2>
            <div className="space-y-3">
              {pendientesRegreso.map((reg) => (
                <Card key={reg.id} className="border-l-4 border-l-amber-500 shadow-sm bg-amber-50/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{reg.vehiculo.siglas} • {reg.vehiculo.placa}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Salió: {reg.fecha} {reg.hora_salida} • {reg.destino}
                      </p>
                    </div>
                    <Link href={`/regreso?id=${reg.id}`}>
                      <Button variant="outline" size="sm" className="text-xs h-8 border-amber-200 text-amber-800 hover:bg-amber-100">Cerrar</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
              {vehiculosVencidos.map((v) => {
                const isSoatVencido = v.vencimiento_soat && v.vencimiento_soat < todayStr;
                const isTecnoVencida = v.vencimiento_tecnomecanica && v.vencimiento_tecnomecanica < todayStr;
                
                let numVencidos = 0;
                let mensaje = "";
                
                if (isSoatVencido && isTecnoVencida) {
                  mensaje = "SOAT y Tecnomecánica Vencidos";
                  numVencidos = 2;
                } else if (isSoatVencido) {
                  mensaje = "SOAT Vencido";
                  numVencidos = 1;
                } else {
                  mensaje = "Tecnomecánica Vencida";
                  numVencidos = 1;
                }

                return (
                  <Card key={`vencido-${v.id}`} className="border-l-4 border-l-rose-500 shadow-sm bg-rose-50/50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-rose-900 line-clamp-1">{v.siglas} • {v.placa}</p>
                        <p className="text-xs text-rose-700 font-medium mt-1">
                          {mensaje}
                        </p>
                      </div>
                      <Link href={`/vehiculos`}>
                        <Button variant="outline" size="sm" className="text-xs h-8 border-rose-200 text-rose-800 hover:bg-rose-100 hover:text-rose-900 shrink-0 ml-2">Revisar</Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
              {pendientesRegreso.length === 0 && vehiculosVencidos.length === 0 && (
                <div className="text-center p-6 text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                  No hay alertas actuales.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}