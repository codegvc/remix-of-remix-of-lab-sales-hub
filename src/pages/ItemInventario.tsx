import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package, Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useInventarioList,
  useCreateInventario,
  useUpdateInventario,
  useDeleteInventario,
} from '@/hooks/useInventario';
import { useLotesByItem } from '@/hooks/useLotes';
import { ItemInventario, itemInventarioSchema } from '@/types/inventario';

export default function ItemInventarioPage() {
  const { data: items = [], isLoading } = useInventarioList();
  const createMutation = useCreateInventario();
  const updateMutation = useUpdateInventario();
  const deleteMutation = useDeleteInventario();

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemInventario | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    stock_minimo_alerta: '',
  });

  const filteredItems = items.filter((item) =>
    item.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = itemInventarioSchema.safeParse({
      nombre: form.nombre,
      stock_minimo_alerta: form.stock_minimo_alerta ? parseInt(form.stock_minimo_alerta) : null,
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || 'Datos inválidos');
      return;
    }

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, data: parsed.data });
      } else {
        await createMutation.mutateAsync(parsed.data);
      }
      resetForm();
      setIsDialogOpen(false);
    } catch {
      // Error already handled in mutation
    }
  };

  const resetForm = () => {
    setForm({ nombre: '', stock_minimo_alerta: '' });
    setEditingItem(null);
  };

  const handleEdit = (item: ItemInventario) => {
    setForm({
      nombre: item.nombre,
      stock_minimo_alerta: item.stock_minimo_alerta?.toString() || '',
    });
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // Error already handled in mutation
    }
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <PageLayout title="Item Inventario" subtitle="Gestión de items de inventario del laboratorio">
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Editar Item' : 'Nuevo Item'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre <span className="text-destructive">*</span></Label>
                  <Input
                    id="nombre"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Tubos de ensayo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_minimo_alerta">Stock Mínimo Alerta</Label>
                  <Input
                    id="stock_minimo_alerta"
                    type="number"
                    min="0"
                    value={form.stock_minimo_alerta}
                    onChange={(e) => setForm({ ...form, stock_minimo_alerta: e.target.value })}
                    placeholder="Ej: 10"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingItem ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Items ({filteredItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No se encontraron items</p>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    isExpanded={expandedItemId === item.id}
                    onToggle={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDelete(item.id)}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

interface ItemCardProps {
  item: ItemInventario;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function ItemCard({ item, isExpanded, onToggle, onEdit, onDelete, isDeleting }: ItemCardProps) {
  const { data: lotes = [], isLoading } = useLotesByItem(isExpanded ? item.id : null);

  const totalStock = lotes.reduce((acc, lote) => acc + (lote.cantidad_comprada - lote.cantidad_consumida), 0);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-muted/30">
        <div className="flex-1">
          <p className="font-medium text-foreground">{item.nombre}</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Stock mínimo: {item.stock_minimo_alerta ?? 'No definido'}</span>
            {isExpanded && <span>Stock actual: {totalStock}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 bg-background border-t border-border">
          <h4 className="font-medium text-sm mb-3">Lotes ({lotes.length})</h4>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : lotes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4 text-sm">
              No hay lotes registrados para este item
            </p>
          ) : (
            <div className="space-y-2">
              {lotes.map((lote) => {
                const stockDisponible = lote.cantidad_comprada - lote.cantidad_consumida;
                const isLowStock = item.stock_minimo_alerta && stockDisponible <= item.stock_minimo_alerta;

                return (
                  <div
                    key={lote.id}
                    className={`p-3 rounded-lg text-sm ${
                      isLowStock ? 'bg-destructive/10 border border-destructive/30' : 'bg-muted/20'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Lote: {lote.lote}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                          <span>
                            Stock: {stockDisponible}/{lote.cantidad_comprada}
                            {isLowStock && <span className="text-destructive ml-1">(Bajo)</span>}
                          </span>
                          <span>C.Unit: Bs. {lote.costo_unitario.toFixed(2)}</span>
                          <span>P.Unit: Bs. {lote.precio_unitario.toFixed(2)}</span>
                          {lote.fecha_vencimiento && (
                            <span>Vence: {new Date(lote.fecha_vencimiento).toLocaleDateString('es-BO')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {lote.observaciones && (
                      <p className="text-xs text-muted-foreground mt-2">{lote.observaciones}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
