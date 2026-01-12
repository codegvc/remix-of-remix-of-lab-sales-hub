import { z } from 'zod';

export interface ItemInventario {
  id: number;
  nombre: string;
  stock_minimo_alerta: number | null;
  created_at?: string;
  updated_at?: string;
}

export const itemInventarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255, 'Máximo 255 caracteres'),
  stock_minimo_alerta: z.number().int().min(0).nullable().optional(),
});

export type ItemInventarioFormData = z.infer<typeof itemInventarioSchema>;
