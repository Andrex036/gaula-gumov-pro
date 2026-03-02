import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, Link } from "wouter";
import escudoGaula from "@assets/Escudo_GAULA_Vectorizado_1772078238682.png";
import { useAuth, Role } from "@/lib/authContext";
import { useState } from "react";
import { toast } from "sonner";

export default function Register() {
    const [, setLocation] = useLocation();
    const { register } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<Role>("Funcionario");
    const [securityQuestion, setSecurityQuestion] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password || !role || !securityQuestion || !securityAnswer) return;

        setLoading(true);
        try {
            await register({ username, password, role, securityQuestion, securityAnswer });
            toast.success("Usuario creado exitosamente. Sesión iniciada.");
            setLocation("/dashboard");
        } catch (err: any) {
            toast.error(err.message || "Error al crear la cuenta");
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
                        className="w-24 h-24 drop-shadow-2xl"
                    />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2 text-center tracking-tight">
                    Registro de Usuarios
                </h1>
                <p className="text-white/80 mb-6 text-center text-sm font-medium">
                    Control Parque Automotor GAULA
                </p>

                <Card className="w-full bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                    <CardContent className="pt-6">
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="id" className="text-slate-700">
                                    Identificación (Usuario)
                                </Label>
                                <Input
                                    id="id"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Número de cédula o placa"
                                    className="h-11 bg-white/50 border-slate-200 focus:ring-primary"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700">
                                    Contraseña
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-11 bg-white/50 border-slate-200 focus:ring-primary"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-slate-700">
                                    Rol del Usuario
                                </Label>
                                <Select value={role || "Funcionario"} onValueChange={(v) => setRole(v as Role)} required>
                                    <SelectTrigger className="w-full h-11 bg-white/50 focus:ring-primary">
                                        <SelectValue placeholder="Selecciona un rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Funcionario">Funcionario Operativo</SelectItem>
                                        <SelectItem value="Administrador">Administrador del Sistema</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="securityQuestion" className="text-slate-700">
                                    Pregunta de Seguridad (Recuperación)
                                </Label>
                                <Select value={securityQuestion} onValueChange={setSecurityQuestion} required>
                                    <SelectTrigger className="w-full h-11 bg-white/50 focus:ring-primary">
                                        <SelectValue placeholder="Selecciona una pregunta secreta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="¿Cuál es tu color favorito?">¿Cuál es tu color favorito?</SelectItem>
                                        <SelectItem value="¿Ciudad de nacimiento?">¿Ciudad de nacimiento?</SelectItem>
                                        <SelectItem value="¿Nombre de tu primera mascota?">¿Nombre de tu primera mascota?</SelectItem>
                                        <SelectItem value="¿Placa de tu primer vehículo?">¿Placa de tu primer vehículo?</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="securityAnswer" className="text-slate-700">
                                    Respuesta de Seguridad
                                </Label>
                                <Input
                                    id="securityAnswer"
                                    value={securityAnswer}
                                    onChange={(e) => setSecurityAnswer(e.target.value)}
                                    placeholder="Tu respuesta secreta"
                                    className="h-11 bg-white/50 border-slate-200 focus:ring-primary"
                                    required
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 text-md bg-emerald-700 hover:bg-emerald-800"
                                >
                                    {loading ? "Registrando..." : "Crear Nueva Cuenta"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-6 w-full text-center text-white/90 text-sm">
                    <p className="font-medium">
                        ¿Ya tienes una cuenta?{" "}
                        <Link href="/">
                            <span className="font-bold underline cursor-pointer text-white hover:text-white/80 transition-colors">
                                Ingresar al sistema
                            </span>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
