import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Compra, CompraFormData } from '@/types/compras';
import { toast } from 'sonner';

const ENDPOINT = '/api/compras';

export function useComprasList() {
  return useQuery({
    queryKey: ['compras'],
    queryFn: async (): Promise<Compra[]> => {
      const response = await api.get<Compra[]>(ENDPOINT);
      return response.data;
    },
  });
}

export function useCompra(id: number | null) {
  return useQuery({
    queryKey: ['compras', id],
    queryFn: async (): Promise<Compra> => {
      const response = await api.get<Compra>(`${ENDPOINT}/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CompraFormData): Promise<Compra> => {
      const response = await api.post<Compra>(ENDPOINT, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear compra');
    },
  });
}

export function useUpdateCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CompraFormData }): Promise<Compra> => {
      const response = await api.put<Compra>(`${ENDPOINT}/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar compra');
    },
  });
}

export function useDeleteCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`${ENDPOINT}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar compra');
    },
  });
}
