import { Link, useLocation } from "wouter";
import { Home, Users, Car, FileText, Menu, LogOut, Upload } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { USUARIO_ACTUAL } from "@/lib/mock-data";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  if (location === "/") return <>{children}</>;

  const navItems = [
    { href: "/dashboard", label: "Inicio", icon: Home },
    { href: "/conductores", label: "Conductores", icon: Users },
    { href: "/vehiculos", label: "Vehículos", icon: Car },
    { href: "/registros", label: "Registros", icon: FileText },
    { href: "/importar", label: "Importar", icon: Upload },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Top Header */}
      <header className="flex-none h-14 bg-primary text-primary-foreground flex items-center justify-between px-4 shadow-md z-10">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-white p-0 w-72 flex flex-col">
              <div className="p-6 bg-primary text-primary-foreground">
                <h2 className="text-xl font-bold">GAULA Móvil</h2>
                <p className="text-sm opacity-80 mt-1">{USUARIO_ACTUAL.nombre}</p>
                <p className="text-xs opacity-60">{USUARIO_ACTUAL.unidad} - {USUARIO_ACTUAL.rol}</p>
              </div>
              <div className="flex-1 py-4 flex flex-col gap-1 px-3">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant={location === item.href ? "secondary" : "ghost"} 
                      className="w-full justify-start gap-3 h-12"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
              <div className="p-4 border-t">
                <Link href="/">
                  <Button variant="outline" className="w-full text-destructive gap-2 h-12">
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="font-semibold text-lg tracking-tight">Parque Automotor</h1>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-none h-16 bg-white border-t border-border/50 flex items-center justify-around px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] fixed bottom-0 left-0 right-0 z-10">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary/70'}`}>
                <item.icon className={`h-6 w-6 ${isActive ? 'fill-primary/10' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}