import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Email inválido' }),
  password: z.string().min(1, { message: 'La contraseña es requerida' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export interface AuthUser {
  id: number;
  name: string;
  usuario: string;
  email: string;
  email_verified_at: string | null;
  rol: number;
  estado: number;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}
