import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation, Link } from "wouter";
import escudoGaula from "@assets/Escudo_GAULA_Vectorizado_1772078238682.png";
import { useState } from "react";
import { toast } from "sonner";

export default function RecoverPassword() {
    const [, setLocation] = useLocation();

    const [step, setStep] = useState<1 | 2>(1);
    const [username, setUsername] = useState("");
    const [securityQuestion, setSecurityQuestion] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Paso 1: Pedir pregunta secreta al backend
    const handleVerifyUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) return;

        setLoading(true);
        try {
            const res = await fetch("/api/recover-password/question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Usuario no encontrado");

            setSecurityQuestion(data.question);
            setStep(2);
            toast.success("Usuario verificado. Responde tu pregunta de seguridad.");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Paso 2: Enviar respuesta y resetear
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!securityAnswer || !newPassword) return;

        setLoading(true);
        try {
            const res = await fetch("/api/recover-password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, answer: securityAnswer, newPassword }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Error al restaurar");

            toast.success(data.message);
            setLocation("/"); // Regresa directo al Login
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-black/30 to-transparent"></div>

            <div className="z-10 w-full max-w-sm flex flex-col items-center">
                <div className="p-2 mb-6">
                    <img src={escudoGaula} alt="Escudo GAULA" className="w-24 h-24 drop-shadow-2xl" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2 text-center tracking-tight">
                    Recuperar Contraseña
                </h1>
                <p className="text-white/80 mb-6 text-center text-sm font-medium">
                    Sistema de restablecimiento seguro
                </p>

                <Card className="w-full bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                    <CardContent className="pt-6">
                        {step === 1 ? (
                            <form onSubmit={handleVerifyUsername} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="id" className="text-slate-700">
                                        Número de Identificación
                                    </Label>
                                    <Input
                                        id="id"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Escribe tu usuario/cédula"
                                        className="h-11 bg-white/50 focus:ring-primary"
                                        required
                                    />
                                    <p className="text-xs text-slate-500">Se buscará tu usuario para ofrecerte tu pregunta secreta de recuperación.</p>
                                </div>
                                <div className="pt-4">
                                    <Button type="submit" disabled={loading} className="w-full h-12 bg-amber-600 hover:bg-amber-700">
                                        {loading ? "Buscando..." : "Buscar Usuario"}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-4 relative animate-in slide-in-from-right-4 duration-300">
                                <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)} className="absolute -top-4 -right-2 text-xs text-slate-400">Volver</Button>

                                <div className="space-y-2 mt-2">
                                    <Label className="text-slate-700">Pregunta Secreta</Label>
                                    <p className="font-bold text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 text-sm">
                                        "{securityQuestion}"
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="securityAnswer" className="text-slate-700">Tu Respuesta</Label>
                                    <Input
                                        id="securityAnswer"
                                        value={securityAnswer}
                                        onChange={(e) => setSecurityAnswer(e.target.value)}
                                        placeholder="Escribe la respuesta secreta"
                                        className="h-11 bg-white/50 focus:ring-primary"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-slate-700">Nueva Contraseña</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-11 bg-white/50 focus:ring-primary"
                                        required
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={loading} className="w-full h-12 bg-emerald-700 hover:bg-emerald-800">
                                        {loading ? "Aplicando..." : "Restablecer Contraseña"}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-6 w-full text-center text-white/90 text-sm">
                    <p className="font-medium">
                        <Link href="/">
                            <span className="font-bold underline cursor-pointer text-white hover:text-white/80 transition-colors">
                                Me acordé, regresar al inicio
                            </span>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
