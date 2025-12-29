import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Test } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TEST_CATEGORIES, TestCategory, SaleTest, TEST_STATUS_LABELS, TestStatus } from '@/types';
import { toast } from 'sonner';
import { Check, Circle, CheckCircle2, Clock, Beaker, ChevronDown, Pencil, Save } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TestCell {
  saleId: string;
  test: SaleTest;
  clientName: string;
}

export default function Tests() {
  const { sales, tests, updateTestStatus } = useData();
  const [activeCategory, setActiveCategory] = useState<TestCategory | 'all'>('all');
  const [selectedTest, setSelectedTest] = useState<{ saleId: string; test: SaleTest } | null>(null);
  const [formData, setFormData] = useState({
    repetition: '',
    control: '',
    calibration: '',
    result: '',
  });
  const [editingTestName, setEditingTestName] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Record<string, { result: string; repetition: string; control: string }>>({});

  // Get all test entries from sales
  const allTestEntries = useMemo(() => {
    return sales.flatMap(sale =>
      sale.tests.map(test => ({
        saleId: sale.id,
        clientId: sale.clientId,
        clientName: sale.clientName,
        clientCode: sale.clientCode || sale.clientName.substring(0, 7),
        test,
      }))
    );
  }, [sales]);

  // Get unique clients that have tests
  const uniqueClients = useMemo(() => {
    const clientMap = new Map<string, { id: string; name: string; code: string }>();
    allTestEntries.forEach(entry => {
      if (!clientMap.has(entry.clientId)) {
        clientMap.set(entry.clientId, { id: entry.clientId, name: entry.clientName, code: entry.clientCode });
      }
    });
    return Array.from(clientMap.values());
  }, [allTestEntries]);

  // Create a lookup for test abbreviations
  const testAbbreviationMap = useMemo(() => {
    const map = new Map<string, string>();
    tests.forEach((test: Test) => {
      if (test.abbreviation) {
        map.set(test.name, test.abbreviation);
      }
    });
    return map;
  }, [tests]);

  // Get unique test names that exist in sales (only those that need to be done)
  const uniqueTestNames = useMemo(() => {
    const testMap = new Map<string, { name: string; category: TestCategory; abbreviation?: string }>();
    allTestEntries.forEach(entry => {
      const key = entry.test.testName;
      if (!testMap.has(key)) {
        testMap.set(key, { 
          name: entry.test.testName, 
          category: entry.test.category,
          abbreviation: testAbbreviationMap.get(entry.test.testName)
        });
      }
    });
    return Array.from(testMap.values());
  }, [allTestEntries, testAbbreviationMap]);

  // Filter tests by category
  const filteredTestNames = useMemo(() => {
    if (activeCategory === 'all') return uniqueTestNames;
    return uniqueTestNames.filter(t => t.category === activeCategory);
  }, [uniqueTestNames, activeCategory]);

  // Group tests by category
  const groupedTests = useMemo(() => {
    const groups: Record<TestCategory, { name: string; category: TestCategory; abbreviation?: string }[]> = {
      hematologia: [],
      copros: [],
      quimica: [],
      inmunologia: [],
      microbiologia: [],
      orina: [],
    };
    
    filteredTestNames.forEach(test => {
      groups[test.category].push(test);
    });
    
    return groups;
  }, [filteredTestNames]);

  // Build matrix lookup: testName -> clientId -> TestCell
  const matrixLookup = useMemo(() => {
    const lookup = new Map<string, Map<string, TestCell>>();
    
    allTestEntries.forEach(entry => {
      const testKey = entry.test.testName;
      if (!lookup.has(testKey)) {
        lookup.set(testKey, new Map());
      }
      lookup.get(testKey)!.set(entry.clientId, {
        saleId: entry.saleId,
        test: entry.test,
        clientName: entry.clientName,
      });
    });
    
    return lookup;
  }, [allTestEntries]);

  const handleOpenDialog = (cell: TestCell) => {
    setSelectedTest({ saleId: cell.saleId, test: cell.test });
    setFormData({
      repetition: cell.test.repetition?.toString() || '',
      control: cell.test.control?.toString() || '',
      calibration: cell.test.calibration?.toString() || '',
      result: cell.test.result || '',
    });
  };

  const handleStatusChange = (cell: TestCell, newStatus: TestStatus) => {
    if (newStatus === 'completed') {
      // Open dialog for finalizing
      handleOpenDialog(cell);
    } else {
      // Just update the status
      updateTestStatus(cell.saleId, cell.test.id, {
        status: newStatus,
      });
      toast.success(`Estado actualizado: ${TEST_STATUS_LABELS.find(s => s.value === newStatus)?.label}`);
    }
  };

  const handleSave = () => {
    if (!selectedTest) return;

    updateTestStatus(selectedTest.saleId, selectedTest.test.id, {
      repetition: formData.repetition ? Number(formData.repetition) : undefined,
      control: formData.control ? Number(formData.control) : undefined,
      calibration: formData.calibration ? Number(formData.calibration) : undefined,
      result: formData.result,
      status: 'in_progress',
    });

    toast.success('Datos guardados');
    setSelectedTest(null);
  };

  const handleComplete = () => {
    if (!selectedTest) return;

    updateTestStatus(selectedTest.saleId, selectedTest.test.id, {
      repetition: formData.repetition ? Number(formData.repetition) : undefined,
      control: formData.control ? Number(formData.control) : undefined,
      calibration: formData.calibration ? Number(formData.calibration) : undefined,
      result: formData.result,
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    toast.success('Prueba finalizada');
    setSelectedTest(null);
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'pending':
        return <Circle className="h-4 w-4 text-muted-foreground" />;
      case 'sample_taken':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'in_progress':
        return <Beaker className="h-4 w-4 text-primary" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
  };

  const truncateResult = (result: string | undefined) => {
    if (!result) return '';
    return result.length > 4 ? result.substring(0, 4) + '...' : result;
  };

  const categoriesToShow = activeCategory === 'all' 
    ? TEST_CATEGORIES 
    : TEST_CATEGORIES.filter(c => c.value === activeCategory);

  // Get tests grouped by category for column headers
  const columnTests = useMemo(() => {
    const result: { name: string; category: TestCategory; abbreviation?: string }[] = [];
    categoriesToShow.forEach(category => {
      const testsInCat = groupedTests[category.value];
      testsInCat.forEach(t => result.push(t));
    });
    return result;
  }, [categoriesToShow, groupedTests]);

  // Get entries for the editing table
  const editingTestEntries = useMemo(() => {
    if (!editingTestName) return [];
    return allTestEntries.filter(entry => entry.test.testName === editingTestName);
  }, [editingTestName, allTestEntries]);

  const handleEditTest = (testName: string) => {
    if (editingTestName === testName) {
      setEditingTestName(null);
      setEditingData({});
    } else {
      setEditingTestName(testName);
      // Initialize editing data for all entries of this test
      const entries = allTestEntries.filter(entry => entry.test.testName === testName);
      const initialData: Record<string, { result: string; repetition: string; control: string }> = {};
      entries.forEach(entry => {
        initialData[`${entry.saleId}-${entry.test.id}`] = {
          result: entry.test.result || '',
          repetition: entry.test.repetition?.toString() || '',
          control: entry.test.control?.toString() || '',
        };
      });
      setEditingData(initialData);
    }
  };

  const handleEditingDataChange = (key: string, field: 'result' | 'repetition' | 'control', value: string) => {
    setEditingData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleSaveEntry = (saleId: string, testId: string) => {
    const key = `${saleId}-${testId}`;
    const data = editingData[key];
    if (!data) return;

    updateTestStatus(saleId, testId, {
      result: data.result,
      repetition: data.repetition ? Number(data.repetition) : undefined,
      control: data.control ? Number(data.control) : undefined,
    });
    toast.success('Datos guardados');
  };

  const handleStatusChangeFromTable = (saleId: string, testId: string, newStatus: TestStatus) => {
    const key = `${saleId}-${testId}`;
    const data = editingData[key];
    
    updateTestStatus(saleId, testId, {
      status: newStatus,
      result: data?.result,
      repetition: data?.repetition ? Number(data.repetition) : undefined,
      control: data?.control ? Number(data.control) : undefined,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
    });
    toast.success(`Estado actualizado: ${TEST_STATUS_LABELS.find(s => s.value === newStatus)?.label}`);
  };

  return (
    <MainLayout title="Pruebas" subtitle="Matriz de pruebas por cliente">
      <div className="space-y-6 animate-fade-in">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
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

        {/* Matrix View */}
        {uniqueClients.length === 0 || filteredTestNames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay pruebas pendientes para mostrar</p>
          </div>
        ) : (
          <TooltipProvider>
            <ScrollArea className="w-full">
              <div className="min-w-max">
                <table className="w-full border-collapse">
                  {/* Header row with category grouping */}
                  <thead>
                    {/* Category row */}
                    <tr className="bg-muted/50">
                      <th className="sticky left-0 z-20 bg-muted/50 min-w-[180px] px-4 py-2 text-left text-sm font-semibold text-foreground border-b border-r border-border">
                        Paciente
                      </th>
                      {categoriesToShow.map(category => {
                        const testsInCat = groupedTests[category.value];
                        if (testsInCat.length === 0) return null;
                        return (
                          <th 
                            key={category.value}
                            colSpan={testsInCat.length}
                            className="px-2 py-2 text-center text-xs font-bold text-primary border-b border-border bg-muted/50"
                          >
                            {category.label}
                          </th>
                        );
                      })}
                    </tr>
                    {/* Test names row */}
                    <tr>
                      <th className="sticky left-0 z-20 bg-background min-w-[180px] px-4 py-2 text-left text-sm font-semibold text-foreground border-b border-r border-border">
                        
                      </th>
                      {columnTests.map((testInfo, idx) => (
                        <th 
                          key={`${testInfo.name}-${idx}`}
                          className="px-2 py-2 text-center text-xs font-medium text-foreground border-b border-border min-w-[80px] max-w-[100px]"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span className="truncate" title={testInfo.name}>
                              {testInfo.abbreviation || testInfo.name}
                            </span>
                            <button
                              onClick={() => handleEditTest(testInfo.name)}
                              className={`p-0.5 rounded hover:bg-muted transition-colors ${editingTestName === testInfo.name ? 'text-primary bg-muted' : 'text-muted-foreground'}`}
                              title="Editar prueba"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Client rows */}
                    {uniqueClients.map(client => (
                      <tr key={client.id} className="hover:bg-muted/30">
                        <td className="sticky left-0 z-10 bg-background px-4 py-2 text-sm font-medium text-foreground border-b border-r border-border">
                          <div className="truncate max-w-[160px] font-mono" title={client.name}>
                            {client.code}
                          </div>
                        </td>
                        {columnTests.map((testInfo, idx) => {
                          const cell = matrixLookup.get(testInfo.name)?.get(client.id);
                          
                          if (!cell) {
                            return (
                              <td 
                                key={`${testInfo.name}-${idx}`}
                                className="px-2 py-2 text-center border-b border-border"
                              >
                                <span className="text-muted-foreground/30">—</span>
                              </td>
                            );
                          }
                          
                          const isCompleted = cell.test.status === 'completed';
                          
                          return (
                            <td 
                              key={`${testInfo.name}-${idx}`}
                              className="px-2 py-2 text-center border-b border-border"
                            >
                              <DropdownMenu>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                      <button className="inline-flex items-center gap-1 transition-colors hover:opacity-80">
                                        {getStatusIcon(cell.test.status)}
                                        {isCompleted && (
                                          <span className="text-xs text-success font-medium">
                                            {truncateResult(cell.test.result)}
                                          </span>
                                        )}
                                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                      </button>
                                    </DropdownMenuTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{cell.clientName} - {cell.test.testName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {TEST_STATUS_LABELS.find(s => s.value === cell.test.status)?.label}
                                    </p>
                                    {isCompleted && cell.test.result && (
                                      <p className="text-xs text-muted-foreground">{cell.test.result}</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                                <DropdownMenuContent align="center" className="bg-popover z-50">
                                  {TEST_STATUS_LABELS.map((status) => (
                                    <DropdownMenuItem
                                      key={status.value}
                                      onClick={() => handleStatusChange(cell, status.value)}
                                      className={cell.test.status === status.value ? 'bg-accent' : ''}
                                    >
                                      {getStatusIcon(status.value)}
                                      <span className="ml-2">{status.label}</span>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TooltipProvider>
        )}

        {/* Editing Table */}
        {editingTestName && editingTestEntries.length > 0 && (
          <div className="border border-border rounded-lg p-4 bg-card animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Editando: {editingTestName}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setEditingTestName(null)}>
                Cerrar
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Código Paciente</TableHead>
                  <TableHead>Resultado Prueba</TableHead>
                  <TableHead className="w-[120px]">Cant. Repetición</TableHead>
                  <TableHead className="w-[120px]">Cant. Control</TableHead>
                  <TableHead className="w-[200px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editingTestEntries.map(entry => {
                  const key = `${entry.saleId}-${entry.test.id}`;
                  const data = editingData[key] || { result: '', repetition: '', control: '' };
                  
                  return (
                    <TableRow key={key}>
                      <TableCell className="font-mono font-medium">
                        {entry.clientCode}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={data.result}
                          onChange={(e) => handleEditingDataChange(key, 'result', e.target.value)}
                          placeholder="Resultado..."
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={data.repetition}
                          onChange={(e) => handleEditingDataChange(key, 'repetition', e.target.value)}
                          placeholder="0"
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={data.control}
                          onChange={(e) => handleEditingDataChange(key, 'control', e.target.value)}
                          placeholder="0"
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={entry.test.status}
                            onValueChange={(value: TestStatus) => handleStatusChangeFromTable(entry.saleId, entry.test.id, value)}
                          >
                            <SelectTrigger className="h-8 w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                              {TEST_STATUS_LABELS.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveEntry(entry.saleId, entry.test.id)}
                            className="h-8"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Guardar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Process Dialog */}
        <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Procesar Prueba</DialogTitle>
            </DialogHeader>
            {selectedTest && (
              <div className="space-y-4 pt-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="font-semibold text-foreground">{selectedTest.test.testName}</p>
                  <p className="text-sm text-muted-foreground capitalize">{selectedTest.test.category}</p>
                </div>

                <div className="grid gap-4 grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="repetition">Repetición</Label>
                    <Input
                      id="repetition"
                      type="number"
                      value={formData.repetition}
                      onChange={(e) => setFormData({ ...formData, repetition: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="control">Control</Label>
                    <Input
                      id="control"
                      type="number"
                      value={formData.control}
                      onChange={(e) => setFormData({ ...formData, control: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calibration">Calibración</Label>
                    <Input
                      id="calibration"
                      type="number"
                      value={formData.calibration}
                      onChange={(e) => setFormData({ ...formData, calibration: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="result">Resultado</Label>
                  <Textarea
                    id="result"
                    value={formData.result}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                    placeholder="Ingrese el resultado de la prueba..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={handleSave}>
                    Guardar
                  </Button>
                  <Button className="flex-1 bg-success hover:bg-success/90" onClick={handleComplete}>
                    <Check className="mr-2 h-4 w-4" />
                    Finalizar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
