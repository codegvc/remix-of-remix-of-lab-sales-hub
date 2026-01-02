export interface Doctor {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  address: string;
  commissionPercentage: number;
  totalEarned: number;
  createdAt: string;
}

export interface Derivado {
  id: string;
  name: string;
  phone: string;
  totalEarned: number;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  clientCode: string;
  age?: number;
  createdAt: string;
}

export interface Test {
  id: string;
  name: string;
  abbreviation?: string; // Nombre abreviado
  category: TestCategory;
  price: number;
  derivedPrice?: number; // Precio derivado (más bajo)
  durationHours?: number; // Tiempo de demora en horas
  isExternal?: boolean; // Indica si la prueba no la hacemos nosotros
}

export type PaymentType = 'completo' | 'credito';
export type PaymentMethod = 'efectivo' | 'banco';

export interface PaymentInfo {
  amountPaid: number;
  change: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  observation?: string;
}

export type TestCategory = 
  | 'hematologia'
  | 'copros'
  | 'quimica'
  | 'inmunologia'
  | 'microbiologia'
  | 'orina';

export const TEST_CATEGORIES: { value: TestCategory; label: string }[] = [
  { value: 'hematologia', label: 'Hematología' },
  { value: 'copros', label: 'Coprología' },
  { value: 'quimica', label: 'Química Clínica' },
  { value: 'inmunologia', label: 'Inmunología' },
  { value: 'microbiologia', label: 'Microbiología' },
  { value: 'orina', label: 'Uroanálisis' },
];

export type TestStatus = 'pending' | 'sample_taken' | 'in_progress' | 'completed';

export const TEST_STATUS_LABELS: { value: TestStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'sample_taken', label: 'Muestra Tomada' },
  { value: 'in_progress', label: 'En Procesamiento' },
  { value: 'completed', label: 'Finalizada' },
];

export interface SaleTest {
  id: string;
  testId: string;
  testName: string;
  category: TestCategory;
  status: TestStatus;
  deliveryDate?: string; // Fecha de entrega
  repetition?: number;
  control?: number;
  calibration?: number;
  result?: string;
  completedAt?: string;
  delivered?: boolean; // Si ya fue entregado al cliente
}

export interface Sale {
  id: string;
  clientId: string;
  clientName: string;
  clientCode: string;
  doctorId?: string;
  doctorName?: string;
  doctorCommission?: number;
  derivadoId?: string;
  derivadoName?: string;
  tests: SaleTest[];
  total: number;
  status: 'active' | 'completed';
  payment?: PaymentInfo;
  createdAt: string;
}

export interface Quote {
  id: string;
  tests: SaleTest[];
  total: number;
  expirationDate?: string;
  createdAt: string;
}
