import { z } from 'zod';

export interface Compra {
  id: number;
  fecha_compra: string;
  monto_total: number;
  proveedor: string;
  observaciones: string | null;
  created_at?: string;
  updated_at?: string;
  lotes?: Lote[];
}

export interface Lote {
  id: number;
  cantidad_comprada: number;
  cantidad_consumida: number;
  costo_total: number;
  costo_unitario: number;
  precio_unitario: number;
  fecha_ingreso: string;
  fecha_terminado: string | null;
  fecha_vencimiento: string | null;
  lote: string;
  observaciones: string | null;
  alerta_vencimiento: number | null;
  compra_id: number;
  item_inventario_id: number;
  item_inventario?: {
    id: number;
    nombre: string;
  };
  created_at?: string;
  updated_at?: string;
}

export const compraSchema = z.object({
  fecha_compra: z.string().nullable().optional(),
  monto_total: z.number().min(0, 'El monto debe ser mayor o igual a 0'),
  proveedor: z.string().max(255).nullable().optional(),
  observaciones: z.string().max(1000).nullable().optional(),
});

export const loteInputSchema = z.object({
  cantidad_comprada: z.number().int().min(1, 'Cantidad mínima es 1'),
  cantidad_consumida: z.number().int().min(0).default(0),
  costo_total: z.number().min(0, 'El costo debe ser mayor o igual a 0'),
  costo_unitario: z.number().min(0, 'El costo unitario debe ser mayor o igual a 0'),
  precio_unitario: z.number().min(0, 'El precio unitario debe ser mayor o igual a 0'),
  fecha_ingreso: z.string().min(1, 'La fecha de ingreso es requerida'),
  fecha_terminado: z.string().nullable().optional(),
  fecha_vencimiento: z.string().nullable().optional(),
  lote: z.string().min(1, 'El número de lote es requerido').max(100),
  observaciones: z.string().max(1000).nullable().optional(),
  alerta_vencimiento: z.number().int().min(0).nullable().optional(),
  item_inventario_id: z.number().int().min(1, 'Debe seleccionar un item de inventario'),
});

export const loteSchema = z.object({
  cantidad_comprada: z.number().int().min(1, 'Cantidad mínima es 1'),
  cantidad_consumida: z.number().int().min(0).default(0),
  costo_total: z.number().min(0, 'El costo debe ser mayor o igual a 0'),
  costo_unitario: z.number().min(0, 'El costo unitario debe ser mayor o igual a 0'),
  precio_unitario: z.number().min(0, 'El precio unitario debe ser mayor o igual a 0'),
  fecha_ingreso: z.string().min(1, 'La fecha de ingreso es requerida'),
  fecha_terminado: z.string().nullable().optional(),
  fecha_vencimiento: z.string().nullable().optional(),
  lote: z.string().min(1, 'El número de lote es requerido').max(100),
  observaciones: z.string().max(1000).nullable().optional(),
  alerta_vencimiento: z.number().int().min(0).nullable().optional(),
  compra_id: z.number().int(),
  item_inventario_id: z.number().int().min(1, 'Debe seleccionar un item de inventario'),
});

export const compraConLotesSchema = z.object({
  fecha_compra: z.string().nullable().optional(),
  monto_total: z.number().min(0, 'El monto debe ser mayor o igual a 0'),
  proveedor: z.string().max(255).nullable().optional(),
  observaciones: z.string().max(1000).nullable().optional(),
  lotes: z.array(loteInputSchema).optional(),
});

export type CompraFormData = z.infer<typeof compraSchema>;
export type LoteFormData = z.infer<typeof loteSchema>;
export type LoteInputData = z.infer<typeof loteInputSchema>;
export type CompraConLotesFormData = z.infer<typeof compraConLotesSchema>;
