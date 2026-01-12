import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Lote, LoteFormData } from '@/types/compras';
import { toast } from 'sonner';

const ENDPOINT = '/api/lotes';

export function useLotesList() {
  return useQuery({
    queryKey: ['lotes'],
    queryFn: async (): Promise<Lote[]> => {
      const response = await api.get<Lote[]>(ENDPOINT);
      return response.data;
    },
  });
}

export function useLotesByCompra(compraId: number | null) {
  return useQuery({
    queryKey: ['lotes', 'compra', compraId],
    queryFn: async (): Promise<Lote[]> => {
      const response = await api.get<Lote[]>(`${ENDPOINT}?compra_id=${compraId}`);
      return response.data;
    },
    enabled: !!compraId,
  });
}

export function useLotesByItem(itemId: number | null) {
  return useQuery({
    queryKey: ['lotes', 'item', itemId],
    queryFn: async (): Promise<Lote[]> => {
      const response = await api.get<Lote[]>(`${ENDPOINT}?item_inventario_id=${itemId}`);
      return response.data;
    },
    enabled: !!itemId,
  });
}

export function useCreateLote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoteFormData): Promise<Lote> => {
      const response = await api.post<Lote>(ENDPOINT, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
      queryClient.invalidateQueries({ queryKey: ['lotes', 'compra', variables.compra_id] });
      queryClient.invalidateQueries({ queryKey: ['lotes', 'item', variables.item_inventario_id] });
      toast.success('Lote creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear lote');
    },
  });
}

export function useUpdateLote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<LoteFormData> }): Promise<Lote> => {
      const response = await api.put<Lote>(`${ENDPOINT}/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
      toast.success('Lote actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar lote');
    },
  });
}

export function useDeleteLote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`${ENDPOINT}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
      toast.success('Lote eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar lote');
    },
  });
}
