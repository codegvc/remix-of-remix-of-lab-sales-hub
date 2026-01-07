import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { TEST_CATEGORIES, SaleTest, Client, TestCategory, PaymentInfo } from '@/types';
import { toast } from 'sonner';
import { UserPlus, ShoppingCart, Search, FileText, Receipt, X, Clock, Calendar, Stethoscope, Plus, Building2 } from 'lucide-react';
import { format, addHours } from 'date-fns';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface LabPrices {
  [testId: string]: {
    [labId: string]: number | null;
  };
}
import { PaymentModal } from '@/components/PaymentModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type Mode = 'sale' | 'quote';

interface SelectedTestWithDate {
  testId: string;
  deliveryDate: string;
}

export default function NewSale() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clients, tests, doctors, quotes, derivados, deleteQuote, addClient, addSale, addQuote, updateDoctorEarnings, addDoctor, addDerivado, updateDerivadoEarnings } = useData();
  const [labPrices] = useLocalStorage<LabPrices>('lab-prices', {});
  
  const [mode, setMode] = useState<Mode>('sale');
  const [clientMode, setClientMode] = useState<'new' | 'existing'>('new');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDerivadoId, setSelectedDerivadoId] = useState('');
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    age: '',
  });
  const [selectedTests, setSelectedTests] = useState<SelectedTestWithDate[]>([]);
  const [activeCategory, setActiveCategory] = useState<TestCategory | 'all'>('all');
  const [useDerivedPrice, setUseDerivedPrice] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingSaleData, setPendingSaleData] = useState<{ client: Client; saleTests: SaleTest[]; doctorId?: string } | null>(null);
  const [quoteExpirationDate, setQuoteExpirationDate] = useState('');
  
  // Doctor modal state
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    licenseNumber: '',
    phone: '',
    address: '',
  });
  
  // Derivado modal state
  const [showDerivadoModal, setShowDerivadoModal] = useState(false);
  const [derivadoForm, setDerivadoForm] = useState({
    name: '',
    phone: '',
  });
  
  const [quoteIdFromUrl, setQuoteIdFromUrl] = useState<string | null>(null);

  const calculateDeliveryDate = (testId: string) => {
    const test = tests.find(t => t.id === testId);
    const hours = test?.durationHours || 24;
    return format(addHours(new Date(), hours), "yyyy-MM-dd'T'HH:mm");
  };

  // Effect to load quote data from URL parameter
  useEffect(() => {
    const quoteId = searchParams.get('quoteId');
    if (quoteId && quoteId !== quoteIdFromUrl) {
      setQuoteIdFromUrl(quoteId);
      const quote = quotes.find(q => q.id === quoteId);
      if (quote) {
        // Pre-fill selected tests from the quote
        const testsFromQuote: SelectedTestWithDate[] = quote.tests.map(t => ({
          testId: t.testId,
          deliveryDate: t.deliveryDate || calculateDeliveryDate(t.testId),
        }));
        setSelectedTests(testsFromQuote);
        setMode('sale'); // Force sale mode when converting from quote
      }
    }
  }, [searchParams, quotes, quoteIdFromUrl]);

  const generateClientCode = (document: string, name: string) => {
    const docDigits = document.replace(/\D/g, '').substring(0, 3).padEnd(3, '0');
    const nameLetters = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X');
    return `${docDigits}-${nameLetters}`;
  };

  const clientCode = useMemo(() => {
    if (clientMode === 'new') {
      return generateClientCode(clientForm.document, clientForm.name);
    } else {
      const existingClient = clients.find(c => c.id === selectedClientId);
      return existingClient?.clientCode || '';
    }
  }, [clientForm.document, clientForm.name, clientMode, selectedClientId, clients]);

  const handleTestToggle = (testId: string) => {
    setSelectedTests(prev => {
      const exists = prev.find(t => t.testId === testId);
      if (exists) {
        return prev.filter(t => t.testId !== testId);
      } else {
        return [...prev, { testId, deliveryDate: calculateDeliveryDate(testId) }];
      }
    });
  };

  const updateDeliveryDate = (testId: string, date: string) => {
    setSelectedTests(prev =>
      prev.map(t => t.testId === testId ? { ...t, deliveryDate: date } : t)
    );
  };

  const removeSelectedTest = (testId: string) => {
    setSelectedTests(prev => prev.filter(t => t.testId !== testId));
  };

  // Get all lab prices for a test (same logic as PreciosLaboratorios)
  const getLabPricesForTest = (testId: string): number[] => {
    return derivados
      .map(lab => labPrices[testId]?.[lab.id])
      .filter((p): p is number => p !== null && p !== undefined && p > 0);
  };

  // Calculate price for external tests using lab prices
  const getCalculatedPrice = (test: typeof tests[0], forDerived: boolean = false): number => {
    // If test has its own price (not external), use it
    if (test.price > 0) {
      if (forDerived && test.derivedPrice) {
        return test.derivedPrice;
      }
      return test.price;
    }
    
    // For external tests, calculate from lab prices
    const labPricesArr = getLabPricesForTest(test.id);
    if (labPricesArr.length > 0) {
      const maxLabPrice = Math.max(...labPricesArr);
      return forDerived ? (maxLabPrice + 10) : (maxLabPrice + 30);
    }
    
    return 0;
  };

  const getTestPrice = (test: typeof tests[0]) => {
    if (useDerivedPrice) {
      return getCalculatedPrice(test, true);
    }
    return getCalculatedPrice(test, false);
  };

  const calculateTotal = () => {
    return selectedTests.reduce((total, selected) => {
      const test = tests.find(t => t.id === selected.testId);
      return total + (test ? getTestPrice(test) : 0);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTests.length === 0) {
      toast.error('Selecciona al menos una prueba');
      return;
    }

    const saleTests: SaleTest[] = selectedTests.map(selected => {
      const test = tests.find(t => t.id === selected.testId)!;
      return {
        id: `st-${Date.now()}-${selected.testId}`,
        testId: test.id,
        testName: test.name,
        category: test.category,
        status: 'pending',
        deliveryDate: selected.deliveryDate,
      };
    });

    if (mode === 'quote') {
      addQuote({
        tests: saleTests,
        total: calculateTotal(),
        expirationDate: quoteExpirationDate || undefined,
      });
      toast.success('Cotización registrada correctamente');
      navigate('/cotizaciones');
      return;
    }

    // Sale mode - requires client data
    let client: Client;

    if (clientMode === 'new') {
      if (!clientForm.name || !clientForm.document) {
        toast.error('Completa los datos del cliente');
        return;
      }
      const code = generateClientCode(clientForm.document, clientForm.name);
      client = addClient({
        ...clientForm,
        clientCode: code,
        age: clientForm.age ? Number(clientForm.age) : undefined,
      });
    } else {
      const existingClient = clients.find(c => c.id === selectedClientId);
      if (!existingClient) {
        toast.error('Selecciona un cliente');
        return;
      }
      client = existingClient;
    }

    // Store data and show payment modal
    setPendingSaleData({ client, saleTests, doctorId: selectedDoctorId || undefined });
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = (payment: PaymentInfo) => {
    if (!pendingSaleData) return;

    const { client, saleTests, doctorId } = pendingSaleData;
    const total = calculateTotal();
    const doctor = doctorId ? doctors.find(d => d.id === doctorId) : null;
    const doctorCommission = doctor ? (total * doctor.commissionPercentage / 100) : 0;

    const derivado = selectedDerivadoId ? derivados.find(d => d.id === selectedDerivadoId) : null;

    addSale({
      clientId: client.id,
      clientName: client.name,
      clientCode: client.clientCode,
      doctorId: doctor?.id,
      doctorName: doctor?.name,
      doctorCommission: doctorCommission,
      derivadoId: derivado?.id,
      derivadoName: derivado?.name,
      tests: saleTests,
      total,
      status: 'active',
      payment,
    });

    // Update doctor earnings
    if (doctor) {
      updateDoctorEarnings(doctor.id, doctorCommission);
    }

    // Update derivado earnings
    if (derivado) {
      updateDerivadoEarnings(derivado.id, total);
    }

    // If converting from a quote, delete the quote
    if (quoteIdFromUrl) {
      deleteQuote(quoteIdFromUrl);
    }

    setShowPaymentModal(false);
    toast.success('Venta registrada correctamente');
    navigate('/ventas');
  };

  const filteredTests = tests.filter(test => {
    const matchesCategory = activeCategory === 'all' || test.category === activeCategory;
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedTestIds = selectedTests.map(t => t.testId);

  return (
    <PageLayout 
      title={mode === 'sale' ? 'Nueva Venta' : 'Nueva Cotización'} 
      subtitle={mode === 'sale' ? 'Registrar orden de pruebas' : 'Crear cotización'}
      headerRight={
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            type="button"
            size="sm"
            variant={mode === 'sale' ? 'default' : 'ghost'}
            onClick={() => setMode('sale')}
            className="gap-1 h-8 px-3"
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Venta</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === 'quote' ? 'default' : 'ghost'}
            onClick={() => setMode('quote')}
            className="gap-1 h-8 px-3"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Cotización</span>
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-2 animate-fade-in lg:h-full lg:flex lg:flex-col">
        {/* Client Section - Only show in sale mode */}
        {mode === 'sale' && (
          <Card className="lg:py-0">
            <CardHeader className="py-3 lg:py-2 px-4">
              <CardTitle className="flex items-center gap-2 text-base lg:text-sm">
                <UserPlus className="h-4 w-4 text-primary" />
                Datos del Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-2 py-2 lg:py-1 px-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={clientMode === 'new' ? 'default' : 'outline'}
                  onClick={() => setClientMode('new')}
                  className="h-7 text-xs"
                >
                  Nuevo Paciente
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={clientMode === 'existing' ? 'default' : 'outline'}
                  onClick={() => setClientMode('existing')}
                  className="h-7 text-xs"
                >
                  Paciente Existente
                </Button>
              </div>

              {clientMode === 'new' ? (
                <div className="grid gap-2 lg:gap-1.5 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs">Nombre *</Label>
                    <Input
                      id="name"
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      placeholder="Nombre"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="document" className="text-xs">CI *</Label>
                    <Input
                      id="document"
                      value={clientForm.document}
                      onChange={(e) => setClientForm({ ...clientForm, document: e.target.value })}
                      placeholder="Documento"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="clientCode" className="text-xs">Código</Label>
                    <Input
                      id="clientCode"
                      value={clientCode}
                      readOnly
                      className="bg-muted font-mono h-8 text-sm"
                      placeholder="Auto"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="age" className="text-xs">Edad</Label>
                    <Input
                      id="age"
                      type="number"
                      min="0"
                      max="150"
                      value={clientForm.age}
                      onChange={(e) => setClientForm({ ...clientForm, age: e.target.value })}
                      placeholder="Años"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      placeholder="correo@ej.com"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs">Teléfono</Label>
                    <Input
                      id="phone"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      placeholder="Teléfono"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm h-8"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                  >
                    <option value="">Seleccione un paciente...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.clientCode} - {client.name}
                      </option>
                    ))}
                  </select>
                  {selectedClientId && (
                    <span className="font-mono text-xs font-semibold text-primary whitespace-nowrap">{clientCode}</span>
                  )}
                </div>
              )}

              {/* Doctor & Derivado inline */}
              <div className="flex gap-2 lg:gap-3 flex-wrap lg:flex-nowrap pt-2 border-t">
                <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
                  <Stethoscope className="h-3.5 w-3.5 text-primary shrink-0" />
                  <select
                    className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs h-7"
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                  >
                    <option value="">Sin doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowDoctorModal(true)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
                  <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <select
                    className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs h-7"
                    value={selectedDerivadoId}
                    onChange={(e) => setSelectedDerivadoId(e.target.value)}
                  >
                    <option value="">Sin derivado</option>
                    {derivados.map((derivado) => (
                      <option key={derivado.id} value={derivado.id}>
                        {derivado.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowDerivadoModal(true)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tests Section */}
        <div className="grid gap-3 lg:gap-2 lg:grid-cols-2 lg:flex-1 lg:min-h-0">
          {/* Left: Test Selection */}
          <Card className="lg:flex lg:flex-col lg:overflow-hidden">
            <CardHeader className="py-2 lg:py-1.5 px-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-1.5 text-sm lg:text-xs">
                  <ShoppingCart className="h-4 w-4 lg:h-3.5 lg:w-3.5 text-primary" />
                  Seleccionar Pruebas
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <Checkbox
                    id="useDerivedPrice"
                    checked={useDerivedPrice}
                    onCheckedChange={(checked) => setUseDerivedPrice(checked === true)}
                    className="h-3.5 w-3.5"
                  />
                  <Label htmlFor="useDerivedPrice" className="cursor-pointer text-xs text-muted-foreground">
                    Precios derivados
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 lg:space-y-1.5 py-2 lg:py-1 px-3 lg:flex lg:flex-col lg:flex-1 lg:min-h-0">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar pruebas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-7 text-xs"
                />
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant={activeCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory('all')}
                  className="h-6 text-xs px-2"
                >
                  Todas
                </Button>
                {TEST_CATEGORIES.map((cat) => (
                  <Button
                    key={cat.value}
                    type="button"
                    variant={activeCategory === cat.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory(cat.value)}
                    className="h-6 text-xs px-2"
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>

              {/* Tests Grid */}
              <div className="grid gap-1.5 lg:flex-1 lg:overflow-y-auto max-h-[300px] lg:max-h-none">
                {filteredTests.map((test) => (
                  <label
                    key={test.id}
                    className={`flex items-center gap-2 rounded-md border p-2 lg:p-1.5 cursor-pointer transition-all ${
                      selectedTestIds.includes(test.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Checkbox
                      checked={selectedTestIds.includes(test.id)}
                      onCheckedChange={() => handleTestToggle(test.id)}
                      className="h-3.5 w-3.5"
                    />
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{test.name}</p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        Bs {getTestPrice(test)}
                        {test.durationHours && (
                          <span className="ml-1 text-[10px]">
                            ({test.durationHours}h)
                          </span>
                        )}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {filteredTests.length === 0 && (
                <p className="text-center text-muted-foreground py-4 text-xs">
                  No se encontraron pruebas
                </p>
              )}
            </CardContent>
          </Card>

          {/* Right: Selected Tests with Delivery Dates */}
          <Card className="lg:flex lg:flex-col lg:overflow-hidden">
            <CardHeader className="py-2 lg:py-1.5 px-3">
              <CardTitle className="flex items-center gap-1.5 text-sm lg:text-xs">
                <Calendar className="h-4 w-4 lg:h-3.5 lg:w-3.5 text-primary" />
                Seleccionadas ({selectedTests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 lg:py-1 px-3 lg:flex-1 lg:overflow-hidden">
              {selectedTests.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 text-xs">
                  Selecciona pruebas
                </p>
              ) : (
                <div className="space-y-1.5 lg:overflow-y-auto lg:max-h-full max-h-[250px]">
                  {selectedTests.map((selected) => {
                    const test = tests.find(t => t.id === selected.testId);
                    if (!test) return null;
                    return (
                      <div key={selected.testId} className="p-2 lg:p-1.5 border rounded-md flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{test.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">Bs {getTestPrice(test)}</span>
                            <Input
                              type="datetime-local"
                              value={selected.deliveryDate}
                              onChange={(e) => updateDeliveryDate(selected.testId, e.target.value)}
                              className="h-6 text-[10px] px-1 flex-1"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => removeSelectedTest(selected.testId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quote Expiration Date - Only for quotes */}
        {mode === 'quote' && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <Label htmlFor="expirationDate" className="text-xs whitespace-nowrap">Vencimiento:</Label>
            <Input
              id="expirationDate"
              type="date"
              value={quoteExpirationDate}
              onChange={(e) => setQuoteExpirationDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="h-7 text-xs flex-1 max-w-[160px]"
            />
          </div>
        )}

        {/* Summary + Actions */}
        <div className="flex items-center justify-between gap-4 p-3 lg:p-2 bg-primary/5 border border-primary/20 rounded-lg lg:mt-auto">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Pruebas</p>
              <p className="text-sm font-semibold text-foreground">{selectedTests.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl lg:text-lg font-bold text-primary">Bs {calculateTotal()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => navigate('/')} className="h-8 text-xs">
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="h-8 text-xs px-4">
              {mode === 'sale' ? 'Registrar Venta' : 'Registrar Cotización'}
            </Button>
          </div>
        </div>
      </form>

      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        total={calculateTotal()}
      />

      {/* Doctor Registration Modal */}
      <Dialog open={showDoctorModal} onOpenChange={setShowDoctorModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Doctor</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!doctorForm.name.trim()) {
              toast.error('El nombre es requerido');
              return;
            }
            const newDoctor = addDoctor({
              name: doctorForm.name.trim(),
              licenseNumber: doctorForm.licenseNumber.trim(),
              phone: doctorForm.phone.trim(),
              address: doctorForm.address.trim(),
              commissionPercentage: 20,
              totalEarned: 0,
            });
            setSelectedDoctorId(newDoctor.id);
            setDoctorForm({ name: '', licenseNumber: '', phone: '', address: '' });
            setShowDoctorModal(false);
            toast.success('Doctor registrado correctamente');
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctorName">Nombre *</Label>
              <Input
                id="doctorName"
                value={doctorForm.name}
                onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                placeholder="Nombre del doctor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorLicense">Matrícula</Label>
              <Input
                id="doctorLicense"
                value={doctorForm.licenseNumber}
                onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
                placeholder="Código profesional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorPhone">Teléfono</Label>
              <Input
                id="doctorPhone"
                value={doctorForm.phone}
                onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                placeholder="Número de teléfono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorAddress">Dirección</Label>
              <Input
                id="doctorAddress"
                value={doctorForm.address}
                onChange={(e) => setDoctorForm({ ...doctorForm, address: e.target.value })}
                placeholder="Dirección"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDoctorModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Registrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Derivado Registration Modal */}
      <Dialog open={showDerivadoModal} onOpenChange={setShowDerivadoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Derivado</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!derivadoForm.name.trim()) {
              toast.error('El nombre es requerido');
              return;
            }
            const newDerivado = addDerivado({
              name: derivadoForm.name.trim(),
              phone: derivadoForm.phone.trim(),
            });
            setSelectedDerivadoId(newDerivado.id);
            setDerivadoForm({ name: '', phone: '' });
            setShowDerivadoModal(false);
            toast.success('Derivado registrado correctamente');
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="derivadoName">Nombre *</Label>
              <Input
                id="derivadoName"
                value={derivadoForm.name}
                onChange={(e) => setDerivadoForm({ ...derivadoForm, name: e.target.value })}
                placeholder="Nombre del laboratorio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="derivadoPhone">Teléfono</Label>
              <Input
                id="derivadoPhone"
                value={derivadoForm.phone}
                onChange={(e) => setDerivadoForm({ ...derivadoForm, phone: e.target.value })}
                placeholder="Número de teléfono"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDerivadoModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Registrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
