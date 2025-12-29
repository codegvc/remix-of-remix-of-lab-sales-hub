import { Client, Sale, Test } from '@/types';

export const initialTests: Test[] = [
  // Hematología
  { id: 't1', name: 'Hemograma Completo', category: 'hematologia', price: 25 },
  { id: 't2', name: 'Tiempo de Protrombina', category: 'hematologia', price: 18 },
  { id: 't3', name: 'Tiempo de Tromboplastina', category: 'hematologia', price: 18 },
  { id: 't4', name: 'Velocidad de Sedimentación', category: 'hematologia', price: 12 },
  { id: 't5', name: 'Recuento de Plaquetas', category: 'hematologia', price: 15 },
  
  // Coprología
  { id: 't6', name: 'Coproparasitológico', category: 'copros', price: 20 },
  { id: 't7', name: 'Sangre Oculta en Heces', category: 'copros', price: 15 },
  { id: 't8', name: 'Coprocultivo', category: 'copros', price: 35 },
  
  // Química Clínica
  { id: 't9', name: 'Glucosa en Ayunas', category: 'quimica', price: 10 },
  { id: 't10', name: 'Perfil Lipídico', category: 'quimica', price: 45 },
  { id: 't11', name: 'Creatinina', category: 'quimica', price: 12 },
  { id: 't12', name: 'Ácido Úrico', category: 'quimica', price: 12 },
  { id: 't13', name: 'Transaminasas (AST/ALT)', category: 'quimica', price: 25 },
  
  // Inmunología
  { id: 't14', name: 'Proteína C Reactiva', category: 'inmunologia', price: 20 },
  { id: 't15', name: 'Factor Reumatoideo', category: 'inmunologia', price: 22 },
  { id: 't16', name: 'VDRL', category: 'inmunologia', price: 15 },
  { id: 't17', name: 'HIV (Elisa)', category: 'inmunologia', price: 35 },
  
  // Microbiología
  { id: 't18', name: 'Urocultivo', category: 'microbiologia', price: 40 },
  { id: 't19', name: 'Antibiograma', category: 'microbiologia', price: 45 },
  { id: 't20', name: 'Cultivo de Secreción', category: 'microbiologia', price: 40 },
  
  // Uroanálisis
  { id: 't21', name: 'Examen General de Orina', category: 'orina', price: 12 },
  { id: 't22', name: 'Microalbuminuria', category: 'orina', price: 25 },
  { id: 't23', name: 'Proteinuria 24h', category: 'orina', price: 30 },
];

export const initialClients: Client[] = [];
export const initialSales: Sale[] = [];
