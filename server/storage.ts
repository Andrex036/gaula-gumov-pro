import { users, conductores, vehiculos, registros, type User, type InsertUser, type Conductor, type Vehiculo, type Registro, type RegistroDetallado } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: string, newPassword: string): Promise<User>;

  getConductores(): Promise<Conductor[]>;
  getVehiculos(): Promise<Vehiculo[]>;
  updateVehiculoEstado(id: string, estado: string, kilometraje?: number): Promise<Vehiculo | undefined>;
  updateConductorEstado(id: string, estado: string): Promise<Conductor | undefined>;

  getRegistros(): Promise<RegistroDetallado[]>;
  getRegistro(id: string): Promise<RegistroDetallado | undefined>;
  createRegistro(registro: Omit<Registro, "id" | "estado_registro">): Promise<RegistroDetallado>;
  updateRegistro(id: string, update: Partial<Registro>): Promise<RegistroDetallado | undefined>;

  createConductor(conductor: Conductor): Promise<Conductor>;
  createVehiculo(vehiculo: Vehiculo): Promise<Vehiculo>;
  deleteConductor(id: string): Promise<boolean>;
  deleteVehiculo(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPassword(id: string, newPassword: string): Promise<User> {
    const [user] = await db.update(users).set({ password: newPassword }).where(eq(users.id, id)).returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async getConductores(): Promise<Conductor[]> {
    return await db.select().from(conductores);
  }

  async getVehiculos(): Promise<Vehiculo[]> {
    return await db.select().from(vehiculos);
  }

  async updateVehiculoEstado(id: string, estado: string, kilometraje?: number): Promise<Vehiculo | undefined> {
    const update: any = { estado };
    if (kilometraje !== undefined) update.kilometraje_actual = kilometraje;
    const [vehiculo] = await db.update(vehiculos).set(update).where(eq(vehiculos.id, id)).returning();
    return vehiculo;
  }

  async updateConductorEstado(id: string, estado: string): Promise<Conductor | undefined> {
    const [conductor] = await db.update(conductores).set({ estado }).where(eq(conductores.id, id)).returning();
    return conductor;
  }

  async getRegistros(): Promise<RegistroDetallado[]> {
    const allRegistros = await db.select().from(registros).orderBy(desc(registros.fecha), desc(registros.hora_salida));

    // Manual join for detailed view (Drizzle can do this better but keeping it simple)
    const detailed = await Promise.all(allRegistros.map(async (r) => {
      const [v] = await db.select().from(vehiculos).where(eq(vehiculos.id, r.vehiculoId));
      const [c] = await db.select().from(conductores).where(eq(conductores.id, r.conductorId));
      return { ...r, vehiculo: v, conductor: c } as RegistroDetallado;
    }));

    return detailed;
  }

  async getRegistro(id: string): Promise<RegistroDetallado | undefined> {
    const [r] = await db.select().from(registros).where(eq(registros.id, id));
    if (!r) return undefined;
    const [v] = await db.select().from(vehiculos).where(eq(vehiculos.id, r.vehiculoId));
    const [c] = await db.select().from(conductores).where(eq(conductores.id, r.conductorId));
    return { ...r, vehiculo: v, conductor: c } as RegistroDetallado;
  }

  async createRegistro(registro: Omit<Registro, "id" | "estado_registro">): Promise<RegistroDetallado> {
    const [newReg] = await db.insert(registros).values({ ...registro, estado_registro: "Abierto" }).returning();
    const [v] = await db.select().from(vehiculos).where(eq(vehiculos.id, newReg.vehiculoId));
    const [c] = await db.select().from(conductores).where(eq(conductores.id, newReg.conductorId));
    return { ...newReg, vehiculo: v, conductor: c } as RegistroDetallado;
  }

  async updateRegistro(id: string, update: Partial<Registro>): Promise<RegistroDetallado | undefined> {
    const [updatedReg] = await db.update(registros).set(update).where(eq(registros.id, id)).returning();
    if (!updatedReg) return undefined;
    const [v] = await db.select().from(vehiculos).where(eq(vehiculos.id, updatedReg.vehiculoId));
    const [c] = await db.select().from(conductores).where(eq(conductores.id, updatedReg.conductorId));
    return { ...updatedReg, vehiculo: v, conductor: c } as RegistroDetallado;
  }

  async createConductor(conductor: Conductor): Promise<Conductor> {
    const [newConductor] = await db.insert(conductores).values(conductor).returning();
    return newConductor;
  }

  async createVehiculo(vehiculo: Vehiculo): Promise<Vehiculo> {
    const [newVehiculo] = await db.insert(vehiculos).values(vehiculo).returning();
    return newVehiculo;
  }

  async deleteConductor(id: string): Promise<boolean> {
    const result = await db.delete(conductores).where(eq(conductores.id, id)).returning();
    return result.length > 0;
  }

  async deleteVehiculo(id: string): Promise<boolean> {
    const result = await db.delete(vehiculos).where(eq(vehiculos.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
