import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TEST_CATEGORIES, TestCategory } from '@/types';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, FlaskConical, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function GestionPruebas() {
  const { tests, addTest, updateTest, deleteTest } = useData();
  const [activeCategory, setActiveCategory] = useState<TestCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<string | null>(null);
  const [isExternal, setIsExternal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    abbreviation: '',
    category: 'hematologia' as TestCategory,
    price: '',
    derivedPrice: '',
    durationHours: '',
  });

  const filteredTests = tests.filter(test => {
    const matchesCategory = activeCategory === 'all' || test.category === activeCategory;
    const matchesSearch = test.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || (!isExternal && !form.price)) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    const testData = {
      name: form.name,
      abbreviation: form.abbreviation || undefined,
      category: form.category,
      price: form.price ? Number(form.price) : 0,
      derivedPrice: form.derivedPrice ? Number(form.derivedPrice) : undefined,
      durationHours: form.durationHours ? Number(form.durationHours) : undefined,
      isExternal,
    };

    if (editingTest) {
      updateTest(editingTest, testData);
      toast.success('Prueba actualizada');
    } else {
      addTest(testData);
      toast.success('Prueba creada');
    }

    setForm({ name: '', abbreviation: '', category: 'hematologia', price: '', derivedPrice: '', durationHours: '' });
    setIsExternal(false);
    setEditingTest(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (test: typeof tests[0]) => {
    setForm({
      name: test.name,
      abbreviation: test.abbreviation || '',
      category: test.category,
      price: test.price ? String(test.price) : '',
      derivedPrice: test.derivedPrice ? String(test.derivedPrice) : '',
      durationHours: test.durationHours ? String(test.durationHours) : '',
    });
    setIsExternal(test.isExternal || false);
    setEditingTest(test.id);
    setIsDialogOpen(true);
  };


  const handleDelete = (id: string) => {
    deleteTest(id);
    toast.success('Prueba eliminada');
  };

  const openNewDialog = () => {
    setForm({ name: '', abbreviation: '', category: 'hematologia', price: '', derivedPrice: '', durationHours: '' });
    setIsExternal(false);
    setEditingTest(null);
    setIsDialogOpen(true);
  };

  return (
    <PageLayout title="Gestión de Pruebas" subtitle="Catálogo de pruebas del laboratorio">
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pruebas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Prueba
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTest ? 'Editar Prueba' : 'Nueva Prueba'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la prueba</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej: Hemograma Completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abbreviation">Abreviación</Label>
                  <Input
                    id="abbreviation"
                    value={form.abbreviation}
                    onChange={(e) => setForm({ ...form, abbreviation: e.target.value })}
                    placeholder="Ej: HGC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) => setForm({ ...form, category: value as TestCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEST_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 border">
                  <div className="space-y-0.5">
                    <Label htmlFor="isExternal" className="text-sm font-medium cursor-pointer">
                      Prueba externa (no la hacemos)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Usará precios de otros laboratorios
                    </p>
                  </div>
                  <Switch
                    id="isExternal"
                    checked={isExternal}
                    onCheckedChange={setIsExternal}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Precio (Bs) {!isExternal && <span className="text-destructive">*</span>}</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder={isExternal ? "Opcional" : "0.00"}
                    disabled={isExternal}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="derivedPrice">Precio Derivado (Bs)</Label>
                  <Input
                    id="derivedPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.derivedPrice}
                    onChange={(e) => setForm({ ...form, derivedPrice: e.target.value })}
                    placeholder={isExternal ? "Opcional" : "Precio más bajo (opcional)"}
                    disabled={isExternal}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationHours">Tiempo de demora (horas)</Label>
                  <Input
                    id="durationHours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.durationHours}
                    onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
                    placeholder="Ej: 24"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTest ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('all')}
          >
            Todas
          </Button>
          {TEST_CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Tests List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              Pruebas ({filteredTests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No se encontraron pruebas</p>
            ) : (
              <div className="divide-y divide-border">
                {filteredTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium text-foreground">{test.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {TEST_CATEGORIES.find(c => c.value === test.category)?.label}
                        {test.durationHours && ` • ${test.durationHours}h`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-primary">Bs {test.price}</span>
                        {test.derivedPrice && (
                          <span className="text-xs text-muted-foreground">Derivado: Bs {test.derivedPrice}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(test)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(test.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
