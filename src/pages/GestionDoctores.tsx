import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Stethoscope, Phone, MapPin, Percent, DollarSign, IdCard } from 'lucide-react';
import { Doctor } from '@/types';

export default function GestionDoctores() {
  const { doctors, addDoctor, updateDoctor, deleteDoctor } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState({
    name: '',
    licenseNumber: '',
    phone: '',
    address: '',
    commissionPercentage: '',
  });

  const resetForm = () => {
    setForm({ name: '', licenseNumber: '', phone: '', address: '', commissionPercentage: '' });
    setEditingDoctor(null);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setForm({
      name: doctor.name,
      licenseNumber: doctor.licenseNumber || '',
      phone: doctor.phone,
      address: doctor.address,
      commissionPercentage: doctor.commissionPercentage.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    const commissionPercentage = parseFloat(form.commissionPercentage) || 0;
    
    if (commissionPercentage < 0 || commissionPercentage > 100) {
      toast.error('La comisión debe estar entre 0 y 100%');
      return;
    }

    if (editingDoctor) {
      updateDoctor(editingDoctor.id, {
        name: form.name.trim(),
        licenseNumber: form.licenseNumber.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        commissionPercentage,
      });
      toast.success('Doctor actualizado correctamente');
    } else {
      addDoctor({
        name: form.name.trim(),
        licenseNumber: form.licenseNumber.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        commissionPercentage,
        totalEarned: 0,
      });
      toast.success('Doctor agregado correctamente');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este doctor?')) {
      deleteDoctor(id);
      toast.success('Doctor eliminado correctamente');
    }
  };

  return (
    <MainLayout 
      title="Gestión de Doctores" 
      subtitle="Administra los doctores y sus comisiones"
    >
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-end">
          <Button onClick={openNewDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Doctor
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Lista de Doctores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {doctors.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay doctores registrados
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Comisión (%)</TableHead>
                    <TableHead>Total Ganado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <IdCard className="h-3 w-3 text-muted-foreground" />
                          {doctor.licenseNumber || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {doctor.phone || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {doctor.address || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Percent className="h-3 w-3 text-muted-foreground" />
                          {doctor.commissionPercentage}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <DollarSign className="h-3 w-3" />
                          Bs {doctor.totalEarned.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(doctor)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(doctor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDoctor ? 'Editar Doctor' : 'Agregar Doctor'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre del doctor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Matrícula</Label>
              <Input
                id="licenseNumber"
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                placeholder="Código profesional"
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
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Dirección"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commissionPercentage">Comisión (%)</Label>
              <Input
                id="commissionPercentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.commissionPercentage}
                onChange={(e) => setForm({ ...form, commissionPercentage: e.target.value })}
                placeholder="Porcentaje de comisión"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingDoctor ? 'Actualizar' : 'Agregar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
