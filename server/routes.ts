import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { hashPassword } from "./auth";
import passport from "passport";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const parsedUser = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(parsedUser.username);
      if (existingUser) {
        return res.status(400).json({ message: "La identificación ya está registrada" });
      }

      const hashedPassword = await hashPassword(parsedUser.password);
      const user = await storage.createUser({
        ...parsedUser,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Error iniciando sesión" });
        return res.json(user);
      });
    } catch (err: any) {
      if (err.name === "ZodError") {
        return res.status(400).json({ message: "Información inválida" });
      }
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/login", (req: Request, res: Response, next: any) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Credenciales inválidas" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Error al cerrar sesión" });
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "No autenticado" });
    }
  });

  app.post("/api/recover-password/question", async (req: Request, res: Response) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "La identificación es obligatoria" });

    const user = await storage.getUserByUsername(username);
    if (!user) {
      // Return 404 to explicitly say user doesn't exist
      return res.status(404).json({ message: "El usuario no existe" });
    }

    return res.json({ question: user.securityQuestion });
  });

  app.post("/api/recover-password/reset", async (req: Request, res: Response) => {
    const { username, answer, newPassword } = req.body;
    if (!username || !answer || !newPassword) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    const user = await storage.getUserByUsername(username);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // In a real app the answer might be hashed, here we do a simple case-insensitive comparison
    if (user.securityAnswer.trim().toLowerCase() !== answer.trim().toLowerCase()) {
      return res.status(400).json({ message: "Respuesta de seguridad incorrecta" });
    }

    const hashedPassword = await hashPassword(newPassword);
    await storage.updateUserPassword(user.id, hashedPassword);

    return res.json({ message: "Contraseña actualizada exitosamente" });
  });

  // INITIAL SEED - SOLO PARA DEMOSTRACION EN MEMORIA
  const adminPass = await hashPassword("admin123");
  const funcPass = await hashPassword("func123");

  if (!await storage.getUserByUsername("admin")) {
    await storage.createUser({
      username: "admin",
      password: adminPass,
      role: "Administrador",
      securityQuestion: "¿Cuál es tu color favorito?",
      securityAnswer: "rojo"
    });
  }
  if (!await storage.getUserByUsername("funcionario")) {
    await storage.createUser({
      username: "funcionario",
      password: funcPass,
      role: "Funcionario",
      securityQuestion: "¿Ciudad de nacimiento?",
      securityAnswer: "bogota"
    });
  }

  // --- API BUSINESS LOGIC ---

  app.get("/api/conductores", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const conductores = await storage.getConductores();
    res.json(conductores);
  });

  app.delete("/api/conductores/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "Administrador") return res.sendStatus(403);
    const success = await storage.deleteConductor(req.params.id as string);
    if (!success) return res.status(404).json({ message: "Conductor no encontrado" });
    res.status(200).json({ message: "Registro eliminado" });
  });

  app.patch("/api/conductores/:id/estado", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "Administrador") return res.sendStatus(403);
    try {
      const { estado } = req.body;
      if (!estado) return res.status(400).json({ message: "Estado es requerido" });
      const updated = await storage.updateConductorEstado(req.params.id as string, estado);
      if (!updated) return res.status(404).json({ message: "Conductor no encontrado" });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post("/api/conductores/import", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const dbConductores = await storage.getConductores();
      const newItems = Array.isArray(req.body) ? req.body : [];
      let added = 0;

      for (const item of newItems) {
        // Validar campos mínimos
        if (!item.placa_policial || !item.nombres) continue;

        const placaPolicial = String(item.placa_policial).trim();
        const conductorId = item.id ? String(item.id).trim() : `C${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Evitar duplicados por placa policial o por ID explícito
        const existe = dbConductores.find(c =>
          String(c.placa_policial).trim().toLowerCase() === placaPolicial.toLowerCase() ||
          c.id === conductorId
        );

        if (!existe) {
          const newConductor = {
            id: conductorId,
            nombres: String(item.nombres).trim(),
            apellidos: String(item.apellidos || "").trim(),
            grado: String(item.grado || "Patrullero").trim(),
            placa_policial: placaPolicial,
            unidad: String(item.unidad || "GAULA").trim(),
            estado: "Activo",
          };

          await storage.createConductor(newConductor as any);
          added++;
        }
      }
      console.log(`[Import] Procesados ${added} conductores.`);
      res.status(200).json({ message: "Importación exitosa", count: added });
    } catch (err: any) {
      console.error("[Import Error] Conductores:", err.message);
      res.status(400).json({ message: err.message });
    }
  });

  app.get("/api/vehiculos", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const vehiculos = await storage.getVehiculos();
    res.json(vehiculos);
  });

  app.delete("/api/vehiculos/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "Administrador") return res.sendStatus(403);
    const success = await storage.deleteVehiculo(req.params.id as string);
    if (!success) return res.status(404).json({ message: "Vehículo no encontrado" });
    res.status(200).json({ message: "Registro eliminado" });
  });

  app.patch("/api/vehiculos/:id/estado", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "Administrador") return res.sendStatus(403);
    try {
      const { estado } = req.body;
      if (!estado) return res.status(400).json({ message: "Estado es requerido" });
      const updated = await storage.updateVehiculoEstado(req.params.id as string, estado);
      if (!updated) return res.status(404).json({ message: "Vehículo no encontrado" });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post("/api/vehiculos/import", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const dbVehiculos = await storage.getVehiculos();
      const newItems = Array.isArray(req.body) ? req.body : [];
      let added = 0;

      for (const item of newItems) {
        if (!item.placa) continue;

        const placa = String(item.placa).trim();
        const vehiculoId = item.id ? String(item.id).trim() : `V${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        const existe = dbVehiculos.find(v =>
          String(v.placa).trim().toLowerCase() === placa.toLowerCase() ||
          v.id === vehiculoId
        );

        if (!existe) {
          const newVehiculo = {
            id: vehiculoId,
            placa: placa,
            siglas: String(item.siglas || "").trim(),
            tipo: String(item.tipo || "Automóvil").trim(),
            estado: String(item.estado || "Disponible").trim(),
            kilometraje_actual: parseInt(item.kilometraje_actual) || 0,
            vencimiento_soat: String(item.vencimiento_soat || "").trim(),
            vencimiento_tecnomecanica: String(item.vencimiento_tecnomecanica || "").trim(),
            observaciones: String(item.observaciones || "").trim(),
          };

          await storage.createVehiculo(newVehiculo as any);
          added++;
        }
      }
      console.log(`[Import] Procesados ${added} vehículos.`);
      res.status(200).json({ message: "Importación exitosa", count: added });
    } catch (err: any) {
      console.error("[Import Error] Vehículos:", err.message);
      res.status(400).json({ message: err.message });
    }
  });

  app.get("/api/registros", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const registros = await storage.getRegistros();
    res.json(registros);
  });

  app.post("/api/registros", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      // Validate schema in the future, doing direct pass-through for demo
      const nuevoRegistro = await storage.createRegistro(req.body);
      // Update vehiculo status to "En misión"
      await storage.updateVehiculoEstado(req.body.vehiculoId, "En misión", req.body.kilometraje_salida);
      res.status(201).json(nuevoRegistro);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/registros/:id/regreso", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const id = req.params.id as string;
      const dbRegistro = await storage.getRegistro(id);
      if (!dbRegistro) return res.status(404).json({ message: "Registro no encontrado" });

      const patchData = req.body; // e.g., hora_regreso, kilometraje_regreso, observaciones, fotos_regreso
      const updated = await storage.updateRegistro(id, {
        ...patchData,
        estado_registro: "Cerrado"
      });

      if (updated) {
        // Update vehiculo status to "Disponible" and update KM
        await storage.updateVehiculoEstado(updated.vehiculoId, "Disponible", patchData.kilometraje_regreso);
      }

      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  return httpServer;
}
