import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import MobileLayout from "./components/layout/MobileLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Conductores from "./pages/Conductores";
import Vehiculos from "./pages/Vehiculos";
import NuevaSalida from "./pages/NuevaSalida";
import CompletarRegreso from "./pages/CompletarRegreso";
import Registros from "./pages/Registros";

function Router() {
  return (
    <MobileLayout>
      <Switch>
        <Route path="/" component={Login}/>
        <Route path="/dashboard" component={Dashboard}/>
        <Route path="/conductores" component={Conductores}/>
        <Route path="/vehiculos" component={Vehiculos}/>
        <Route path="/salida" component={NuevaSalida}/>
        <Route path="/regreso" component={CompletarRegreso}/>
        <Route path="/registros" component={Registros}/>
        <Route component={NotFound} />
      </Switch>
    </MobileLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;