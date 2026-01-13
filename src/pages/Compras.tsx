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
  X,
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
import { Compra, compraConLotesSchema, Lote, loteSchema, LoteInputData, loteInputSchema } from '@/types/compras';

interface LoteFormState {
  cantidad_comprada: string;
  cantidad_consumida: string;
  costo_total: string;
  costo_unitario: string;
  precio_unitario: string;
  fecha_ingreso: string;
  fecha_terminado: string;
  fecha_vencimiento: string;
  lote: string;
  observaciones: string;
  alerta_vencimiento: string;
  item_inventario_id: string;
}

const emptyLoteForm = (): LoteFormState => ({
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
  
  // Form de compra
  const [form, setForm] = useState({
    fecha_compra: new Date().toISOString().split('T')[0],
    monto_total: '',
    proveedor: '',
    observaciones: '',
  });
  
  // Lotes a agregar en la compra nueva
  const [lotesForm, setLotesForm] = useState<LoteFormState[]>([]);
  const [currentLoteForm, setCurrentLoteForm] = useState<LoteFormState>(emptyLoteForm());

  const filteredCompras = compras.filter(
    (c) =>
      c.proveedor?.toLowerCase().includes(search.toLowerCase()) ||
      c.fecha_compra?.includes(search)
  );

  const addLoteToList = () => {
    const parsed = loteInputSchema.safeParse({
      cantidad_comprada: parseInt(currentLoteForm.cantidad_comprada) || 0,
      cantidad_consumida: parseInt(currentLoteForm.cantidad_consumida) || 0,
      costo_total: parseFloat(currentLoteForm.costo_total) || 0,
      costo_unitario: parseFloat(currentLoteForm.costo_unitario) || 0,
      precio_unitario: parseFloat(currentLoteForm.precio_unitario) || 0,
      fecha_ingreso: currentLoteForm.fecha_ingreso,
      fecha_terminado: currentLoteForm.fecha_terminado || null,
      fecha_vencimiento: currentLoteForm.fecha_vencimiento || null,
      lote: currentLoteForm.lote,
      observaciones: currentLoteForm.observaciones || null,
      alerta_vencimiento: currentLoteForm.alerta_vencimiento ? parseInt(currentLoteForm.alerta_vencimiento) : null,
      item_inventario_id: parseInt(currentLoteForm.item_inventario_id) || 0,
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || 'Datos del lote inválidos');
      return;
    }

    setLotesForm([...lotesForm, currentLoteForm]);
    setCurrentLoteForm(emptyLoteForm());
    toast.success('Lote agregado a la lista');
  };

  const removeLoteFromList = (index: number) => {
    setLotesForm(lotesForm.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convertir lotes del formulario a formato de envío
    const lotesData: LoteInputData[] = lotesForm.map(lf => ({
      cantidad_comprada: parseInt(lf.cantidad_comprada) || 0,
      cantidad_consumida: parseInt(lf.cantidad_consumida) || 0,
      costo_total: parseFloat(lf.costo_total) || 0,
      costo_unitario: parseFloat(lf.costo_unitario) || 0,
      precio_unitario: parseFloat(lf.precio_unitario) || 0,
      fecha_ingreso: lf.fecha_ingreso,
      fecha_terminado: lf.fecha_terminado || null,
      fecha_vencimiento: lf.fecha_vencimiento || null,
      lote: lf.lote,
      observaciones: lf.observaciones || null,
      alerta_vencimiento: lf.alerta_vencimiento ? parseInt(lf.alerta_vencimiento) : null,
      item_inventario_id: parseInt(lf.item_inventario_id) || 0,
    }));

    const dataToSend = {
      fecha_compra: form.fecha_compra || null,
      monto_total: parseFloat(form.monto_total) || 0,
      proveedor: form.proveedor || null,
      observaciones: form.observaciones || null,
      lotes: lotesData.length > 0 ? lotesData : undefined,
    };

    const parsed = compraConLotesSchema.safeParse(dataToSend);

    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || 'Datos inválidos');
      return;
    }

    try {
      if (editingCompra) {
        // Al editar no enviamos lotes (se manejan por separado)
        await updateCompra.mutateAsync({ 
          id: editingCompra.id, 
          data: {
            fecha_compra: form.fecha_compra || null,
            monto_total: parseFloat(form.monto_total) || 0,
            proveedor: form.proveedor || null,
            observaciones: form.observaciones || null,
          }
        });
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
    setLotesForm([]);
    setCurrentLoteForm(emptyLoteForm());
    setEditingCompra(null);
  };

  const handleEdit = (compra: Compra) => {
    setForm({
      fecha_compra: compra.fecha_compra?.split('T')[0] || '',
      monto_total: compra.monto_total.toString(),
      proveedor: compra.proveedor || '',
      observaciones: compra.observaciones || '',
    });
    setLotesForm([]); // Al editar no se muestran lotes en el form
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

  const getItemName = (id: number) => items.find(i => i.id === id)?.nombre || 'Desconocido';

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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCompra ? 'Editar Compra' : 'Nueva Compra'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos de la compra */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Datos de la Compra</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_compra">Fecha Compra</Label>
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
                  <Label htmlFor="proveedor">Proveedor</Label>
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
                    rows={2}
                  />
                </div>
              </div>

              {/* Sección de lotes - solo para nueva compra */}
              {!editingCompra && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Lotes ({lotesForm.length})
                    </h3>
                  </div>

                  {/* Lista de lotes agregados */}
                  {lotesForm.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {lotesForm.map((lf, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{getItemName(parseInt(lf.item_inventario_id))}</p>
                            <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground mt-1">
                              <span>Lote: {lf.lote}</span>
                              <span>Cant: {lf.cantidad_comprada}</span>
                              <span>C.Unit: Bs. {parseFloat(lf.costo_unitario || '0').toFixed(2)}</span>
                              <span>P.Unit: Bs. {parseFloat(lf.precio_unitario || '0').toFixed(2)}</span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLoteFromList(index)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulario para agregar lote */}
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
                    <h4 className="font-medium text-sm">Agregar Nuevo Lote</h4>
                    
                    <div className="space-y-2">
                      <Label>
                        Item Inventario <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={currentLoteForm.item_inventario_id}
                        onValueChange={(v) => setCurrentLoteForm({ ...currentLoteForm, item_inventario_id: v })}
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
                        <Label>
                          Número de Lote <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={currentLoteForm.lote}
                          onChange={(e) => setCurrentLoteForm({ ...currentLoteForm, lote: e.target.value })}
                          placeholder="Ej: LOT-2026-001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Cantidad Comprada <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          value={currentLoteForm.cantidad_comprada}
                          onChange={(e) => setCurrentLoteForm({ ...currentLoteForm, cantidad_comprada: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Costo Total</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={currentLoteForm.costo_total}
                          onChange={(e) => setCurrentLoteForm({ ...currentLoteForm, costo_total: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Costo Unitario</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={currentLoteForm.costo_unitario}
                          onChange={(e) => setCurrentLoteForm({ ...currentLoteForm, costo_unitario: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Precio Unitario</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={currentLoteForm.precio_unitario}
                          onChange={(e) => setCurrentLoteForm({ ...currentLoteForm, precio_unitario: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>
                          Fecha Ingreso <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={currentLoteForm.fecha_ingreso}
                          onChange={(e) => setCurrentLoteForm({ ...currentLoteForm, fecha_ingreso: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha Vencimiento</Label>
                        <Input
                          type="date"
                          value={currentLoteForm.fecha_vencimiento}
                          onChange={(e) => setCurrentLoteForm({ ...currentLoteForm, fecha_vencimiento: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Alerta (días)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={currentLoteForm.alerta_vencimiento}
                          onChange={(e) => setCurrentLoteForm({ ...currentLoteForm, alerta_vencimiento: e.target.value })}
                          placeholder="Ej: 30"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Observaciones del Lote</Label>
                      <Textarea
                        value={currentLoteForm.observaciones}
                        onChange={(e) => setCurrentLoteForm({ ...currentLoteForm, observaciones: e.target.value })}
                        placeholder="Notas adicionales..."
                        rows={2}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addLoteToList}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Lote a la Lista
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingCompra ? 'Actualizar' : 'Crear Compra'}
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
  const [loteForm, setLoteForm] = useState<LoteFormState>(emptyLoteForm());

  const resetLoteForm = () => {
    setLoteForm(emptyLoteForm());
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
              <p className="font-semibold text-foreground">{compra.proveedor || 'Sin proveedor'}</p>
              <p className="text-sm text-muted-foreground">
                {compra.fecha_compra ? new Date(compra.fecha_compra).toLocaleDateString('es-BO') : 'Sin fecha'} • Bs. {compra.monto_total.toFixed(2)}
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
                    <Label>
                      Número de Lote <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={loteForm.lote}
                      onChange={(e) => setLoteForm({ ...loteForm, lote: e.target.value })}
                      placeholder="Ej: LOT-2026-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Cantidad Comprada <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={loteForm.cantidad_comprada}
                      onChange={(e) => setLoteForm({ ...loteForm, cantidad_comprada: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Costo Total</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={loteForm.costo_total}
                      onChange={(e) => setLoteForm({ ...loteForm, costo_total: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Costo Unitario</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={loteForm.costo_unitario}
                      onChange={(e) => setLoteForm({ ...loteForm, costo_unitario: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio Unitario</Label>
                    <Input
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
                    <Label>
                      Fecha Ingreso <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={loteForm.fecha_ingreso}
                      onChange={(e) => setLoteForm({ ...loteForm, fecha_ingreso: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Vencimiento</Label>
                    <Input
                      type="date"
                      value={loteForm.fecha_vencimiento}
                      onChange={(e) => setLoteForm({ ...loteForm, fecha_vencimiento: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Alerta (días)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={loteForm.alerta_vencimiento}
                      onChange={(e) => setLoteForm({ ...loteForm, alerta_vencimiento: e.target.value })}
                      placeholder="Ej: 30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <Textarea
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
