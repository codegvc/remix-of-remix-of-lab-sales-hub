import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { DollarSign, Save, Building2 } from 'lucide-react';
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
  const { tests, derivados, updateTest } = useData();
  const [labPrices, setLabPrices] = useLocalStorage<LabPrices>('lab-prices', {});
  const [localPrices, setLocalPrices] = useState<LabPrices>({});
  const [localTestPrices, setLocalTestPrices] = useState<TestPrices>({});
  const [hasChanges, setHasChanges] = useState(false);

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

  if (derivados.length === 0) {
    return (
      <PageLayout 
        title="Precios Laboratorios" 
        subtitle="Tabla de precios por laboratorio externo"
      >
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No hay laboratorios registrados</h3>
            <p className="text-muted-foreground">
              Primero debes registrar laboratorios externos en la sección de Gestión de Derivados
            </p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Precios Laboratorios" 
      subtitle="Tabla de precios por laboratorio externo"
      headerRight={
        <Button 
          onClick={handleSave} 
          size="sm" 
          className="gap-2"
          disabled={!hasChanges}
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px] sticky left-0 bg-background z-10">
                      Prueba
                    </TableHead>
                    <TableHead className="min-w-[110px] text-center bg-primary/5">
                      Precio
                    </TableHead>
                    <TableHead className="min-w-[110px] text-center bg-emerald-500/5">
                      P. Derivado
                    </TableHead>
                    {derivados.map((lab) => (
                      <TableHead key={lab.id} className="min-w-[120px] text-center">
                        {lab.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium sticky left-0 bg-background z-10">
                        <div>
                          <p>{test.name}</p>
                          {test.abbreviation && (
                            <p className="text-xs text-muted-foreground">({test.abbreviation})</p>
                          )}
                        </div>
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
                      {derivados.map((lab) => (
                        <TableCell key={lab.id} className="p-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="--"
                            value={getPrice(test.id, lab.id)}
                            onChange={(e) => handlePriceChange(test.id, lab.id, e.target.value)}
                            className="w-full text-center h-9"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
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
