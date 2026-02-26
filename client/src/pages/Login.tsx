import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import escudoGaula from "@assets/Escudo_GAULA_Vectorizado_1772078238682.png";

export default function Login() {
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/dashboard");
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
        
        <h1 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">GAULA</h1>
        <p className="text-white/80 mb-8 text-center font-medium">Control Parque Automotor</p>

        <Card className="w-full bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="id" className="text-slate-700">Identificación</Label>
                <Input 
                  id="id" 
                  placeholder="Número de cédula o placa" 
                  required 
                  className="h-12 bg-white/50 border-slate-200 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="h-12 bg-white/50 border-slate-200 focus:ring-primary"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg mt-2 bg-primary hover:bg-primary/90" data-testid="button-login">
                Ingresar al Sistema
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-white/60 text-[10px] mt-8 text-center uppercase tracking-widest font-semibold">
          Vencere Sine Bellum
        </p>
      </div>
    </div>
  );
}