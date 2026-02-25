import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth success
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-[100dvh] bg-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-black/20 to-transparent"></div>
      
      <div className="z-10 w-full max-w-sm flex flex-col items-center">
        <div className="bg-white/10 p-4 rounded-full mb-6 backdrop-blur-sm shadow-xl">
          <ShieldAlert className="w-16 h-16 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2 text-center">GAULA</h1>
        <p className="text-white/70 mb-8 text-center">Control Parque Automotor</p>

        <Card className="w-full bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="id" className="text-slate-700">Identificación</Label>
                <Input 
                  id="id" 
                  placeholder="Número de cédula o placa" 
                  required 
                  className="h-12 bg-white/50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="h-12 bg-white/50 border-slate-200"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg mt-2" data-testid="button-login">
                Ingresar al Sistema
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-white/50 text-xs mt-8 text-center">
          Uso exclusivo para personal autorizado de la Policía Nacional de Colombia.
        </p>
      </div>
    </div>
  );
}