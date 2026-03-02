import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation, Link } from "wouter";
import escudoGaula from "@assets/Escudo_GAULA_Vectorizado_1772078238682.png";
import { useAuth } from "@/lib/authContext";
import { useState } from "react";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    try {
      await login({ username, password });
      setLocation("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-black/30 to-transparent"></div>

      <div className="z-10 w-full max-w-sm flex flex-col items-center">
        <div className="p-2 mb-6 animate-in fade-in zoom-in duration-700">
          <img
            src={escudoGaula}
            alt="Escudo GAULA"
            className="w-32 h-32 drop-shadow-2xl"
          />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">
          GAULA
        </h1>
        <p className="text-white/80 mb-8 text-center font-medium">
          Control Parque Automotor
        </p>

        <Card className="w-full bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="id" className="text-slate-700">
                  Identificación (Usuario)
                </Label>
                <Input
                  id="id"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Número de cédula o placa"
                  className="h-12 bg-white/50 border-slate-200 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="password" className="text-slate-700">
                  Contraseña
                </Label>
                <Link href="/recover-password">
                  <span className="text-[10px] text-primary underline cursor-pointer hover:text-primary/70 font-semibold uppercase">
                    ¿Olvidaste tu clave?
                  </span>
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 bg-white/50 border-slate-200 focus:ring-primary"
                required
              />
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-md bg-primary hover:bg-primary/90"
                >
                  {loading ? "Verificando..." : "Ingresar Seguro"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 w-full text-center text-white/90 text-sm">
          <p className="font-medium">
            ¿No tienes una cuenta?{" "}
            <Link href="/register">
              <span className="font-bold underline cursor-pointer text-white hover:text-white/80 transition-colors">
                Registrarse aquí
              </span>
            </Link>
          </p>
        </div>

        <p className="text-white/60 text-[10px] mt-8 text-center uppercase tracking-widest font-semibold">
          Aplicación de acceso exclusivo para la Policía Nacional de Colombia -
          GAULA 2026
        </p>
      </div>
    </div>
  );
}
