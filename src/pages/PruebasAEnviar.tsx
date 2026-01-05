import { useData } from '@/context/DataContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PageLayout } from '@/components/layout/PageLayout';
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

interface LabPrices {
  [testId: string]: {
    [labId: string]: number | null;
  };
}

interface LabAssignment {
  [key: string]: string; // saleId-testId -> labId
}

export default function PruebasAEnviar() {
  const { sales, tests, clients, derivados } = useData();
  const [labPrices] = useLocalStorage<LabPrices>('lab-prices', {});
  const [labAssignments, setLabAssignments] = useLocalStorage<LabAssignment>('lab-assignments', {});

  // Get external tests (those without price - we don't do them)
  const externalTestIds = tests
    .filter(t => t.price === 0 || t.isExternal)
    .map(t => t.id);

  // Get all external test records from sales
  const externalTestRecords = sales.flatMap(sale => {
    const client = clients.find(c => c.id === sale.clientId);
    return sale.tests
      .filter(saleTest => externalTestIds.includes(saleTest.testId))
      .map(saleTest => {
        const test = tests.find(t => t.id === saleTest.testId);
        const testLabPrices = labPrices[saleTest.testId] || {};
        
        // Find the lab with the highest price
        let bestLabId = '';
        let highestPrice = 0;
        derivados.forEach(lab => {
          const price = testLabPrices[lab.id];
          if (price && price > highestPrice) {
            highestPrice = price;
            bestLabId = lab.id;
          }
        });

        const assignmentKey = `${sale.id}-${saleTest.testId}`;
        const assignedLabId = labAssignments[assignmentKey] || bestLabId;

        return {
          saleId: sale.id,
          saleDate: sale.createdAt,
          clientName: client?.name || sale.clientName,
          clientCode: client?.clientCode || sale.clientCode,
          testId: saleTest.testId,
          testName: saleTest.testName,
          assignedLabId,
          assignmentKey,
        };
      });
  });

  const handleLabChange = (assignmentKey: string, labId: string) => {
    setLabAssignments(prev => ({
      ...prev,
      [assignmentKey]: labId,
    }));
  };

  // Get labs that have a price for a specific test
  const getAvailableLabs = (testId: string) => {
    const testLabPrices = labPrices[testId] || {};
    return derivados.filter(lab => {
      const price = testLabPrices[lab.id];
      return price !== null && price !== undefined && price > 0;
    });
  };

  return (
    <PageLayout title="Pruebas A Enviar">
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="relative overflow-auto" style={{ maxHeight: '500px' }}>
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Código Paciente</TableHead>
                <TableHead>Prueba</TableHead>
                <TableHead>Laboratorio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {externalTestRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No hay pruebas externas registradas
                  </TableCell>
                </TableRow>
              ) : (
                externalTestRecords.map((record, index) => {
                  const availableLabs = getAvailableLabs(record.testId);
                  return (
                    <TableRow key={`${record.assignmentKey}-${index}`}>
                      <TableCell>{record.saleDate}</TableCell>
                      <TableCell className="font-medium">{record.clientName}</TableCell>
                      <TableCell>{record.clientCode}</TableCell>
                      <TableCell>{record.testName}</TableCell>
                      <TableCell>
                        <Select
                          value={record.assignedLabId}
                          onValueChange={(value) => handleLabChange(record.assignmentKey, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar lab" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableLabs.map(lab => {
                              const price = labPrices[record.testId]?.[lab.id];
                              return (
                                <SelectItem key={lab.id} value={lab.id}>
                                  {lab.name} {price ? `(Bs ${price})` : ''}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  );
}
