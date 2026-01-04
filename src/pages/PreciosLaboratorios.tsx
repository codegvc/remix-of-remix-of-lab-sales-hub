import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { DollarSign, Save, Building2, Plus } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface LabPrices {
  [testId: string]: {
    [labId: string]: number | null;
  };
}

interface TestPrices {
  [testId: string]: {
    price: number | null;
    derivedPrice: number | null;
  };
}

export default function PreciosLaboratorios() {
  const { tests, derivados, updateTest, addDerivado } = useData();
  const [labPrices, setLabPrices] = useLocalStorage<LabPrices>('lab-prices', {});
  const [localPrices, setLocalPrices] = useState<LabPrices>({});
  const [localTestPrices, setLocalTestPrices] = useState<TestPrices>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLab, setNewLab] = useState({ name: '', phone: '' });

  // Initialize local prices from storage and tests
  useEffect(() => {
    setLocalPrices(labPrices);
  }, [labPrices]);

  useEffect(() => {
    const testPrices: TestPrices = {};
    tests.forEach(test => {
      testPrices[test.id] = {
        price: test.price ?? null,
        derivedPrice: test.derivedPrice ?? null,
      };
    });
    setLocalTestPrices(testPrices);
  }, [tests]);

  const handlePriceChange = (testId: string, labId: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    
    setLocalPrices(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [labId]: numValue,
      }
    }));
    setHasChanges(true);
  };

  const handleTestPriceChange = (testId: string, field: 'price' | 'derivedPrice', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    
    setLocalTestPrices(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [field]: numValue,
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save lab prices
    setLabPrices(localPrices);
    
    // Save test prices to context
    Object.entries(localTestPrices).forEach(([testId, prices]) => {
      updateTest(testId, {
        price: prices.price ?? 0,
        derivedPrice: prices.derivedPrice ?? undefined,
      });
    });
    
    setHasChanges(false);
    toast.success('Precios actualizados correctamente');
  };

  const getPrice = (testId: string, labId: string): string => {
    const price = localPrices[testId]?.[labId];
    return price !== null && price !== undefined ? price.toString() : '';
  };

  const getTestPrice = (testId: string, field: 'price' | 'derivedPrice'): string => {
    const price = localTestPrices[testId]?.[field];
    return price !== null && price !== undefined ? price.toString() : '';
  };

  // Get all lab prices for a test
  const getLabPricesForTest = (testId: string): number[] => {
    return derivados
      .map(lab => localPrices[testId]?.[lab.id])
      .filter((p): p is number => p !== null && p !== undefined && p > 0);
  };

  // Calculate P. Establecido with derived price
  const getPrecioEstablecido = (testId: string): { precio: string; derivado: string; isFromLab: boolean } => {
    const testPrice = localTestPrices[testId]?.price;
    const testDerivedPrice = localTestPrices[testId]?.derivedPrice;
    
    if (testPrice !== null && testPrice !== undefined && testPrice > 0) {
      const derivadoValue = testDerivedPrice !== null && testDerivedPrice !== undefined && testDerivedPrice > 0
        ? testDerivedPrice.toString()
        : '--';
      return { precio: testPrice.toString(), derivado: derivadoValue, isFromLab: false };
    }
    
    const labPricesArr = getLabPricesForTest(testId);
    if (labPricesArr.length > 0) {
      const maxLabPrice = Math.max(...labPricesArr);
      return { 
        precio: (maxLabPrice + 30).toString(), 
        derivado: (maxLabPrice + 10).toString(), 
        isFromLab: true 
      };
    }
    
    return { precio: '--', derivado: '--', isFromLab: false };
  };

  // Get min and max lab prices for styling
  const getLabPriceStats = (testId: string): { min: number | null; max: number | null } => {
    const labPricesArr = getLabPricesForTest(testId);
    if (labPricesArr.length === 0) return { min: null, max: null };
    return {
      min: Math.min(...labPricesArr),
      max: Math.max(...labPricesArr),
    };
  };

  const handleAddLab = () => {
    if (!newLab.name.trim()) {
      toast.error('El nombre del laboratorio es requerido');
      return;
    }
    
    addDerivado({
      name: newLab.name.trim(),
      phone: newLab.phone.trim(),
    });
    
    setNewLab({ name: '', phone: '' });
    setIsDialogOpen(false);
    toast.success('Laboratorio agregado correctamente');
  };

  return (
    <PageLayout 
      title="Precios Laboratorios" 
      subtitle="Tabla de precios por laboratorio externo"
      headerRight={
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Agregar Lab</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Laboratorio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="lab-name">Nombre *</Label>
                  <Input
                    id="lab-name"
                    placeholder="Nombre del laboratorio"
                    value={newLab.name}
                    onChange={(e) => setNewLab(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-phone">Teléfono</Label>
                  <Input
                    id="lab-phone"
                    placeholder="Teléfono"
                    value={newLab.phone}
                    onChange={(e) => setNewLab(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddLab}>
                    Agregar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            onClick={handleSave} 
            size="sm" 
            className="gap-2"
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Pruebas</p>
                  <p className="text-2xl font-bold text-foreground">{tests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Building2 className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Laboratorios</p>
                  <p className="text-2xl font-bold text-foreground">{derivados.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precios Configurados</p>
                  <p className="text-2xl font-bold text-foreground">
                    {Object.values(localPrices).reduce((count, testPrices) => {
                      return count + Object.values(testPrices).filter(p => p !== null && p !== undefined).length;
                    }, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Tabla de Precios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-20 bg-background">
                  <TableRow>
                    <TableHead className="min-w-[200px] sticky left-0 bg-background z-30">
                      Prueba
                    </TableHead>
                    <TableHead className="min-w-[110px] text-center bg-amber-500/10">
                      P. Establecido
                    </TableHead>
                    <TableHead className="min-w-[110px] text-center bg-primary/5">
                      Precio
                    </TableHead>
                    <TableHead className="min-w-[110px] text-center bg-emerald-500/5">
                      P. Derivado
                    </TableHead>
                    {derivados.map((lab) => (
                      <TableHead key={lab.id} className="min-w-[120px] text-center bg-background">
                        {lab.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => {
                    const precioEstablecido = getPrecioEstablecido(test.id);
                    const labStats = getLabPriceStats(test.id);
                    
                    return (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium sticky left-0 bg-background z-10">
                          <div>
                            <p>{test.name}</p>
                            {test.abbreviation && (
                              <p className="text-xs text-muted-foreground">({test.abbreviation})</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-2 bg-amber-500/10 text-center">
                          <span className={`font-semibold ${precioEstablecido.isFromLab ? 'text-blue-600' : ''}`}>
                            {precioEstablecido.precio}
                            <span className="text-muted-foreground font-normal text-sm ml-1">
                              ({precioEstablecido.derivado})
                            </span>
                          </span>
                        </TableCell>
                        <TableCell className="p-2 bg-primary/5">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="--"
                            value={getTestPrice(test.id, 'price')}
                            onChange={(e) => handleTestPriceChange(test.id, 'price', e.target.value)}
                            className="w-full text-center h-9"
                          />
                        </TableCell>
                        <TableCell className="p-2 bg-emerald-500/5">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="--"
                            value={getTestPrice(test.id, 'derivedPrice')}
                            onChange={(e) => handleTestPriceChange(test.id, 'derivedPrice', e.target.value)}
                            className="w-full text-center h-9"
                          />
                        </TableCell>
                        {derivados.map((lab) => {
                          const priceValue = localPrices[test.id]?.[lab.id];
                          const isMax = priceValue !== null && priceValue !== undefined && priceValue === labStats.max;
                          const isMin = priceValue !== null && priceValue !== undefined && priceValue === labStats.min && labStats.min !== labStats.max;
                          
                          return (
                            <TableCell key={lab.id} className="p-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="--"
                                value={getPrice(test.id, lab.id)}
                                onChange={(e) => handlePriceChange(test.id, lab.id, e.target.value)}
                                className={`w-full text-center h-9 ${isMax ? 'text-blue-600 font-semibold' : ''} ${isMin ? 'text-green-600 font-semibold' : ''}`}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {hasChanges && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Tienes cambios sin guardar. Haz clic en "Actualizar" para guardar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
