import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  ShoppingBag,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  Package,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useComprasList,
  useCreateCompra,
  useUpdateCompra,
  useDeleteCompra,
} from '@/hooks/useCompras';
import {
  useLotesByCompra,
  useCreateLote,
  useUpdateLote,
  useDeleteLote,
} from '@/hooks/useLotes';
import { useInventarioList } from '@/hooks/useInventario';
import { Compra, compraSchema, Lote, loteSchema } from '@/types/compras';

export default function ComprasPage() {
  const { data: compras = [], isLoading } = useComprasList();
  const { data: items = [] } = useInventarioList();
  const createCompra = useCreateCompra();
  const updateCompra = useUpdateCompra();
  const deleteCompra = useDeleteCompra();

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompra, setEditingCompra] = useState<Compra | null>(null);
  const [expandedCompraId, setExpandedCompraId] = useState<number | null>(null);
  const [form, setForm] = useState({
    fecha_compra: new Date().toISOString().split('T')[0],
    monto_total: '',
    proveedor: '',
    observaciones: '',
  });

  const filteredCompras = compras.filter(
    (c) =>
      c.proveedor.toLowerCase().includes(search.toLowerCase()) ||
      c.fecha_compra.includes(search)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = compraSchema.safeParse({
      fecha_compra: form.fecha_compra,
      monto_total: parseFloat(form.monto_total) || 0,
      proveedor: form.proveedor,
      observaciones: form.observaciones || null,
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || 'Datos inválidos');
      return;
    }

    try {
      if (editingCompra) {
        await updateCompra.mutateAsync({ id: editingCompra.id, data: parsed.data });
      } else {
        await createCompra.mutateAsync(parsed.data);
      }
      resetForm();
      setIsDialogOpen(false);
    } catch {
      // Error handled in mutation
    }
  };

  const resetForm = () => {
    setForm({
      fecha_compra: new Date().toISOString().split('T')[0],
      monto_total: '',
      proveedor: '',
      observaciones: '',
    });
    setEditingCompra(null);
  };

  const handleEdit = (compra: Compra) => {
    setForm({
      fecha_compra: compra.fecha_compra.split('T')[0],
      monto_total: compra.monto_total.toString(),
      proveedor: compra.proveedor,
      observaciones: compra.observaciones || '',
    });
    setEditingCompra(compra);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar esta compra y todos sus lotes?')) {
      await deleteCompra.mutateAsync(id);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedCompraId(expandedCompraId === id ? null : id);
  };

  const isPending = createCompra.isPending || updateCompra.isPending;

  return (
    <PageLayout title="Compras" subtitle="Gestión de compras y lotes de inventario">
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por proveedor o fecha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Compra
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCompra ? 'Editar Compra' : 'Nueva Compra'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_compra">
                    Fecha Compra <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fecha_compra"
                    type="date"
                    value={form.fecha_compra}
                    onChange={(e) => setForm({ ...form, fecha_compra: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monto_total">
                    Monto Total <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="monto_total"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.monto_total}
                    onChange={(e) => setForm({ ...form, monto_total: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proveedor">
                  Proveedor <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="proveedor"
                  value={form.proveedor}
                  onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={form.observaciones}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingCompra ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Compras ({filteredCompras.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredCompras.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No se encontraron compras</p>
            ) : (
              <div className="space-y-4">
                {filteredCompras.map((compra) => (
                  <CompraCard
                    key={compra.id}
                    compra={compra}
                    items={items}
                    isExpanded={expandedCompraId === compra.id}
                    onToggle={() => toggleExpand(compra.id)}
                    onEdit={() => handleEdit(compra)}
                    onDelete={() => handleDelete(compra.id)}
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

interface CompraCardProps {
  compra: Compra;
  items: { id: number; nombre: string }[];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function CompraCard({ compra, items, isExpanded, onToggle, onEdit, onDelete }: CompraCardProps) {
  const { data: lotes = [], isLoading: lotesLoading } = useLotesByCompra(isExpanded ? compra.id : null);
  const createLote = useCreateLote();
  const updateLote = useUpdateLote();
  const deleteLote = useDeleteLote();

  const [isLoteDialogOpen, setIsLoteDialogOpen] = useState(false);
  const [editingLote, setEditingLote] = useState<Lote | null>(null);
  const [loteForm, setLoteForm] = useState({
    cantidad_comprada: '',
    cantidad_consumida: '0',
    costo_total: '',
    costo_unitario: '',
    precio_unitario: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    fecha_terminado: '',
    fecha_vencimiento: '',
    lote: '',
    observaciones: '',
    alerta_vencimiento: '',
    item_inventario_id: '',
  });

  const resetLoteForm = () => {
    setLoteForm({
      cantidad_comprada: '',
      cantidad_consumida: '0',
      costo_total: '',
      costo_unitario: '',
      precio_unitario: '',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      fecha_terminado: '',
      fecha_vencimiento: '',
      lote: '',
      observaciones: '',
      alerta_vencimiento: '',
      item_inventario_id: '',
    });
    setEditingLote(null);
  };

  const handleLoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = loteSchema.safeParse({
      cantidad_comprada: parseInt(loteForm.cantidad_comprada) || 0,
      cantidad_consumida: parseInt(loteForm.cantidad_consumida) || 0,
      costo_total: parseFloat(loteForm.costo_total) || 0,
      costo_unitario: parseFloat(loteForm.costo_unitario) || 0,
      precio_unitario: parseFloat(loteForm.precio_unitario) || 0,
      fecha_ingreso: loteForm.fecha_ingreso,
      fecha_terminado: loteForm.fecha_terminado || null,
      fecha_vencimiento: loteForm.fecha_vencimiento || null,
      lote: loteForm.lote,
      observaciones: loteForm.observaciones || null,
      alerta_vencimiento: loteForm.alerta_vencimiento ? parseInt(loteForm.alerta_vencimiento) : null,
      compra_id: compra.id,
      item_inventario_id: parseInt(loteForm.item_inventario_id) || 0,
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || 'Datos inválidos');
      return;
    }

    try {
      if (editingLote) {
        await updateLote.mutateAsync({ id: editingLote.id, data: parsed.data });
      } else {
        await createLote.mutateAsync(parsed.data);
      }
      resetLoteForm();
      setIsLoteDialogOpen(false);
    } catch {
      // Error handled in mutation
    }
  };

  const handleEditLote = (lote: Lote) => {
    setLoteForm({
      cantidad_comprada: lote.cantidad_comprada.toString(),
      cantidad_consumida: lote.cantidad_consumida.toString(),
      costo_total: lote.costo_total.toString(),
      costo_unitario: lote.costo_unitario.toString(),
      precio_unitario: lote.precio_unitario.toString(),
      fecha_ingreso: lote.fecha_ingreso.split('T')[0],
      fecha_terminado: lote.fecha_terminado?.split('T')[0] || '',
      fecha_vencimiento: lote.fecha_vencimiento?.split('T')[0] || '',
      lote: lote.lote,
      observaciones: lote.observaciones || '',
      alerta_vencimiento: lote.alerta_vencimiento?.toString() || '',
      item_inventario_id: lote.item_inventario_id.toString(),
    });
    setEditingLote(lote);
    setIsLoteDialogOpen(true);
  };

  const handleDeleteLote = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este lote?')) {
      await deleteLote.mutateAsync(id);
    }
  };

  const lotePending = createLote.isPending || updateLote.isPending;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-muted/30">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div>
              <p className="font-semibold text-foreground">{compra.proveedor}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(compra.fecha_compra).toLocaleDateString('es-BO')} • Bs. {compra.monto_total.toFixed(2)}
              </p>
            </div>
          </div>
          {compra.observaciones && (
            <p className="text-sm text-muted-foreground mt-1">{compra.observaciones}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 bg-background border-t border-border">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Lotes ({lotes.length})
            </h4>
            <Button
              size="sm"
              onClick={() => {
                resetLoteForm();
                setIsLoteDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar Lote
            </Button>
          </div>

          {lotesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : lotes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay lotes registrados</p>
          ) : (
            <div className="space-y-2">
              {lotes.map((lote) => {
                const itemName = items.find((i) => i.id === lote.item_inventario_id)?.nombre || 'Desconocido';
                const stockDisponible = lote.cantidad_comprada - lote.cantidad_consumida;

                return (
                  <div
                    key={lote.id}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{itemName}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span>Lote: {lote.lote}</span>
                        <span>Stock: {stockDisponible}/{lote.cantidad_comprada}</span>
                        <span>C.Unit: Bs. {lote.costo_unitario.toFixed(2)}</span>
                        <span>P.Unit: Bs. {lote.precio_unitario.toFixed(2)}</span>
                        {lote.fecha_vencimiento && (
                          <span>Vence: {new Date(lote.fecha_vencimiento).toLocaleDateString('es-BO')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditLote(lote)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteLote(lote.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Dialog open={isLoteDialogOpen} onOpenChange={setIsLoteDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingLote ? 'Editar Lote' : 'Nuevo Lote'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleLoteSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Item Inventario <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={loteForm.item_inventario_id}
                    onValueChange={(v) => setLoteForm({ ...loteForm, item_inventario_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar item..." />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lote">
                      Número de Lote <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lote"
                      value={loteForm.lote}
                      onChange={(e) => setLoteForm({ ...loteForm, lote: e.target.value })}
                      placeholder="Ej: LOT-2026-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cantidad_comprada">
                      Cantidad Comprada <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cantidad_comprada"
                      type="number"
                      min="1"
                      value={loteForm.cantidad_comprada}
                      onChange={(e) => setLoteForm({ ...loteForm, cantidad_comprada: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costo_total">Costo Total</Label>
                    <Input
                      id="costo_total"
                      type="number"
                      step="0.01"
                      min="0"
                      value={loteForm.costo_total}
                      onChange={(e) => setLoteForm({ ...loteForm, costo_total: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costo_unitario">Costo Unitario</Label>
                    <Input
                      id="costo_unitario"
                      type="number"
                      step="0.01"
                      min="0"
                      value={loteForm.costo_unitario}
                      onChange={(e) => setLoteForm({ ...loteForm, costo_unitario: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="precio_unitario">Precio Unitario</Label>
                    <Input
                      id="precio_unitario"
                      type="number"
                      step="0.01"
                      min="0"
                      value={loteForm.precio_unitario}
                      onChange={(e) => setLoteForm({ ...loteForm, precio_unitario: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_ingreso">
                      Fecha Ingreso <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fecha_ingreso"
                      type="date"
                      value={loteForm.fecha_ingreso}
                      onChange={(e) => setLoteForm({ ...loteForm, fecha_ingreso: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_vencimiento">Fecha Vencimiento</Label>
                    <Input
                      id="fecha_vencimiento"
                      type="date"
                      value={loteForm.fecha_vencimiento}
                      onChange={(e) => setLoteForm({ ...loteForm, fecha_vencimiento: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alerta_vencimiento">Alerta (días)</Label>
                    <Input
                      id="alerta_vencimiento"
                      type="number"
                      min="0"
                      value={loteForm.alerta_vencimiento}
                      onChange={(e) => setLoteForm({ ...loteForm, alerta_vencimiento: e.target.value })}
                      placeholder="Ej: 30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lote_observaciones">Observaciones</Label>
                  <Textarea
                    id="lote_observaciones"
                    value={loteForm.observaciones}
                    onChange={(e) => setLoteForm({ ...loteForm, observaciones: e.target.value })}
                    placeholder="Notas adicionales..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsLoteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={lotePending}>
                    {lotePending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingLote ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
