import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("Funcionario"),
  securityQuestion: text("security_question").notNull().default(""),
  securityAnswer: text("security_answer").notNull().default(""),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  securityQuestion: true,
  securityAnswer: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const conductores = pgTable("conductores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombres: text("nombres").notNull(),
  apellidos: text("apellidos").notNull(),
  grado: text("grado").notNull(),
  placa_policial: text("placa_policial").notNull(),
  unidad: text("unidad").notNull(),
  estado: text("estado").notNull().default("Activo"),
});

export const insertConductorSchema = createInsertSchema(conductores);
export type Conductor = typeof conductores.$inferSelect;

export const vehiculos = pgTable("vehiculos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  placa: text("placa").notNull(),
  siglas: text("siglas").notNull(),
  tipo: text("tipo").notNull(),
  estado: text("estado").notNull().default("Disponible"),
  kilometraje_actual: integer("kilometraje_actual").notNull(),
  vencimiento_soat: text("vencimiento_soat").notNull(),
  vencimiento_tecnomecanica: text("vencimiento_tecnomecanica").notNull(),
  observaciones: text("observaciones"),
});

export const insertVehiculoSchema = createInsertSchema(vehiculos);
export type Vehiculo = typeof vehiculos.$inferSelect;

export const registros = pgTable("registros", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fecha: text("fecha").notNull(),
  hora_salida: text("hora_salida").notNull(),
  vehiculoId: varchar("vehiculo_id").notNull(),
  conductorId: varchar("conductor_id").notNull(),
  destino: text("destino").notNull(),
  mision: text("mision").notNull(),
  kilometraje_salida: integer("kilometraje_salida").notNull(),
  hora_regreso: text("hora_regreso"),
  kilometraje_regreso: integer("kilometraje_regreso"),
  estado_registro: text("estado_registro").notNull().default("Abierto"),
  observaciones: text("observaciones"),
  pasajeros: text("pasajeros"), // Nuevo campo para nombres de pasajeros
  fotos_salida: jsonb("fotos_salida").$type<string[]>(),
  fotos_regreso: jsonb("fotos_regreso").$type<string[]>(),
});

export const insertRegistroSchema = createInsertSchema(registros);
export type Registro = typeof registros.$inferSelect;

export type RegistroDetallado = Registro & {
  vehiculo: Vehiculo;
  conductor: Conductor;
};
