import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ItemInventario, ItemInventarioFormData } from '@/types/inventario';
import { toast } from 'sonner';

const ENDPOINT = '/api/item-inventarios';

export function useInventarioList() {
  return useQuery({
    queryKey: ['inventario'],
    queryFn: async (): Promise<ItemInventario[]> => {
      const response = await api.get<ItemInventario[]>(ENDPOINT);
      return response.data;
    },
  });
}

export function useCreateInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ItemInventarioFormData): Promise<ItemInventario> => {
      const response = await api.post<ItemInventario>(ENDPOINT, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      toast.success('Item de inventario creado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear item');
    },
  });
}

export function useUpdateInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ItemInventarioFormData }): Promise<ItemInventario> => {
      const response = await api.put<ItemInventario>(`${ENDPOINT}/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      toast.success('Item de inventario actualizado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar item');
    },
  });
}

export function useDeleteInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`${ENDPOINT}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      toast.success('Item de inventario eliminado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar item');
    },
  });
}
