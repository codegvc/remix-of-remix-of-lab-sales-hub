import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Building2, Plus, Pencil, Trash2, Phone, DollarSign, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function GestionDerivados() {
  const { derivados, sales, addDerivado, updateDerivado, deleteDerivado } = useData();
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (editingId) {
      updateDerivado(editingId, {
        name: form.name.trim(),
        phone: form.phone.trim(),
      });
      toast.success('Derivado actualizado correctamente');
    } else {
      addDerivado({
        name: form.name.trim(),
        phone: form.phone.trim(),
      });
      toast.success('Derivado registrado correctamente');
    }

    setForm({ name: '', phone: '' });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (derivado: typeof derivados[0]) => {
    setEditingId(derivado.id);
    setForm({
      name: derivado.name,
      phone: derivado.phone,
    });
    setShowModal(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteDerivado(deleteId);
      toast.success('Derivado eliminado correctamente');
      setDeleteId(null);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm({ name: '', phone: '' });
    setShowModal(true);
  };

  const getDerivadoSales = (derivadoId: string) => {
    return sales.filter(s => s.derivadoId === derivadoId);
  };

  const calculateDerivadoTotal = (derivadoId: string) => {
    return getDerivadoSales(derivadoId).reduce((sum, sale) => sum + sale.total, 0);
  };

  return (
    <MainLayout 
      title="Gestión de Derivados" 
      subtitle="Administra los laboratorios externos"
      headerRight={
        <Button onClick={openNewModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Derivado
        </Button>
      }
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Derivados</p>
                  <p className="text-2xl font-bold text-foreground">{derivados.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Ganado</p>
                  <p className="text-2xl font-bold text-foreground">
                    Bs {derivados.reduce((sum, d) => sum + calculateDerivadoTotal(d.id), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Eye className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ventas de Derivados</p>
                  <p className="text-2xl font-bold text-foreground">
                    {sales.filter(s => s.derivadoId).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Derivados Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Lista de Derivados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {derivados.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay derivados registrados</p>
                <Button onClick={openNewModal} variant="outline" className="mt-4">
                  Registrar primer derivado
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {derivados.map((derivado) => {
                  const derivadoSales = getDerivadoSales(derivado.id);
                  const totalEarned = calculateDerivadoTotal(derivado.id);
                  const isExpanded = expandedId === derivado.id;
                  
                  return (
                    <div key={derivado.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4 bg-card">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{derivado.name}</p>
                              {derivado.phone && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {derivado.phone}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Total ganado</p>
                              <p className="font-bold text-green-600">Bs {totalEarned}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Ventas</p>
                              <p className="font-semibold">{derivadoSales.length}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setExpandedId(isExpanded ? null : derivado.id)}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(derivado)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(derivado.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="border-t bg-muted/30 p-4">
                          {derivadoSales.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                              No hay ventas registradas para este derivado
                            </p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Fecha</TableHead>
                                  <TableHead>Paciente</TableHead>
                                  <TableHead>Pruebas</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {derivadoSales.map((sale) => (
                                  <TableRow key={sale.id}>
                                    <TableCell>
                                      {format(new Date(sale.createdAt), 'dd/MM/yyyy')}
                                    </TableCell>
                                    <TableCell>{sale.clientName}</TableCell>
                                    <TableCell>
                                      <div className="flex flex-wrap gap-1">
                                        {sale.tests.map((test) => (
                                          <span
                                            key={test.id}
                                            className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                                          >
                                            {test.testName}
                                          </span>
                                        ))}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      Bs {sale.total}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Derivado' : 'Nuevo Derivado'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre del laboratorio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Número de teléfono"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingId ? 'Actualizar' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar derivado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El derivado será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
