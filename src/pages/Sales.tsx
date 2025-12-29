import { MainLayout } from '@/components/layout/MainLayout';
import { useData } from '@/context/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, Plus } from 'lucide-react';

export default function Sales() {
  const { sales } = useData();

  return (
    <MainLayout title="Ventas" subtitle="Listado de todas las ventas registradas">
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-end">
          <Link to="/nueva-venta">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Venta
            </Button>
          </Link>
        </div>

        {sales.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No hay ventas registradas</p>
              <Link to="/nueva-venta">
                <Button className="mt-4">Registrar Primera Venta</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Cliente
                  </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Pruebas
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Pago
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Fecha
                    </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sales.map((sale) => {
                  const completedTests = sale.tests.filter(t => t.status === 'completed').length;
                  const pendingTests = sale.tests.length - completedTests;
                  const amountPaid = sale.payment?.amountPaid || 0;
                  const amountOwed = sale.total - amountPaid;
                  
                  return (
                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {sale.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{sale.clientName}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <span className="text-success font-medium">{completedTests}</span>
                        <span className="text-muted-foreground"> ({pendingTests} pendientes)</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground">Bs {sale.total}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-success font-medium">Bs {amountPaid}</span>
                        {amountOwed > 0 && (
                          <span className="text-destructive ml-1">(Debe: Bs {amountOwed})</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={sale.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/ventas/${sale.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
