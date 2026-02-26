// Mock data for the GAULA App Prototype

export const GRADOS = [
  { id: 1, nombre: "Patrullero", orden: 1 },
  { id: 2, nombre: "Subintendente", orden: 2 },
  { id: 3, nombre: "Intendente", orden: 3 },
  { id: 4, nombre: "Subteniente", orden: 4 },
  { id: 5, nombre: "Teniente", orden: 5 },
  { id: 6, nombre: "Capitán", orden: 6 }
];

export const CONDUCTORES = [
  { id: "C001", nombres: "Juan Carlos", apellidos: "Pérez Gómez", grado: "Patrullero", placa_policial: "PT-10293", unidad: "GAULA Bogotá", estado: "Activo" },
  { id: "C002", nombres: "María", apellidos: "Rodríguez", grado: "Subintendente", placa_policial: "SI-83746", unidad: "GAULA Bogotá", estado: "Activo" },
  { id: "C003", nombres: "Carlos", apellidos: "Ramírez", grado: "Intendente", placa_policial: "IT-92837", unidad: "GAULA Bogotá", estado: "Inactivo" },
];

export const TIPOS_AUTOMOTOR = [
  "Motocicleta", "Camión", "Camioneta", "Automóvil", "Bus", "Microbús"
];

export const VEHICULOS = [
  { 
    id: "V001", 
    placa: "GNA-123", 
    siglas: "MI-45", 
    tipo: "Motocicleta", 
    estado: "Disponible", 
    kilometraje_actual: 15420, 
    vencimiento_soat: "2024-03-01", 
    vencimiento_tecnomecanica: "2024-12-15",
    observaciones: "" 
  },
  { 
    id: "V002", 
    placa: "POL-987", 
    siglas: "CA-12", 
    tipo: "Camioneta", 
    estado: "En misión", 
    kilometraje_actual: 85300, 
    vencimiento_soat: "2025-08-15", 
    vencimiento_tecnomecanica: "2024-04-20", 
    observaciones: "" 
  },
  { 
    id: "V003", 
    placa: "BOG-456", 
    siglas: "AU-08", 
    tipo: "Automóvil", 
    estado: "Mantenimiento", 
    kilometraje_actual: 120500, 
    vencimiento_soat: "2024-05-10", 
    vencimiento_tecnomecanica: "2024-06-10",
    observaciones: "Falla en frenos" 
  },
];

// Mock Image URLs for visual testing
const MOCK_IMG_1 = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=300&q=80";
const MOCK_IMG_2 = "https://images.unsplash.com/photo-1594731802111-070115ee5e81?auto=format&fit=crop&w=300&q=80";
const MOCK_IMG_3 = "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=300&q=80";

export const REGISTROS_DIARIOS = [
  {
    id: "R001",
    fecha: "2024-05-20",
    hora_salida: "06:30",
    vehiculo: VEHICULOS[1],
    conductor: CONDUCTORES[1],
    destino: "Centro",
    mision: "Patrullaje",
    kilometraje_salida: 85250,
    hora_regreso: null,
    kilometraje_regreso: null,
    estado_registro: "Abierto",
    observaciones: "",
    fotos_salida: [MOCK_IMG_1, MOCK_IMG_2],
    fotos_regreso: []
  },
  {
    id: "R002",
    fecha: "2024-05-19",
    hora_salida: "08:00",
    vehiculo: VEHICULOS[0],
    conductor: CONDUCTORES[0],
    destino: "Norte",
    mision: "Escolta",
    kilometraje_salida: 15300,
    hora_regreso: "14:00",
    kilometraje_regreso: 15420,
    estado_registro: "Cerrado",
    observaciones: "Sin novedades",
    fotos_salida: [MOCK_IMG_3],
    fotos_regreso: [MOCK_IMG_1, MOCK_IMG_2]
  }
];

export const USUARIO_ACTUAL = {
  nombre: "Admin GAULA",
  rol: "Administrador",
  unidad: "Dirección General"
};