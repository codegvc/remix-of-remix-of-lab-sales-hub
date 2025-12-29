import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { User, FileText, Package, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function SaleDetail() {
  const { id } = useParams();
  const { getSaleById, getClientById, updateTestStatus } = useData();

  const sale = getSaleById(id || '');
  const client = sale ? getClientById(sale.clientId) : null;

  const handleMarkDelivered = (testId: string) => {
    if (!sale) return;
    updateTestStatus(sale.id, testId, { delivered: true });
    toast.success('Prueba marcada como entregada');
  };

  if (!sale) {
    return (
      <PageLayout title="Venta no encontrada">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontró la venta</p>
          <Link to="/ventas">
            <Button className="mt-4">Volver a Ventas</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Venta ${sale.id.slice(0, 8)}`} subtitle="Detalle de la orden">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Client Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-semibold text-foreground">{sale.clientName}</p>
              {client && (
                <>
                  <p className="text-sm text-muted-foreground">Doc: {client.document}</p>
                  {client.email && (
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  )}
                  {client.phone && (
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Sale Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <StatusBadge status={sale.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha</span>
                <span className="font-medium text-foreground">
                  {new Date(sale.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pruebas</span>
                <span className="font-medium text-foreground">{sale.tests.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Total */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="flex flex-col items-center justify-center h-full py-8">
              <p className="text-sm text-muted-foreground mb-2">Total</p>
              <p className="text-4xl font-bold text-primary">Bs {sale.total}</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Info */}
        {sale.payment && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-primary" />
                Información de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Monto Pagado</p>
                  <p className="font-semibold text-success">Bs {sale.payment.amountPaid}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
                  <p className="font-semibold text-destructive">
                    Bs {sale.total - sale.payment.amountPaid}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Pago</p>
                  <p className="font-medium text-foreground capitalize">
                    {sale.payment.paymentType === 'completo' ? 'Completo' : 'Crédito'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método</p>
                  <p className="font-medium text-foreground capitalize">
                    {sale.payment.paymentMethod === 'efectivo' ? 'Efectivo' : 'Banco'}
                  </p>
                </div>
              </div>
              {sale.payment.observation && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Observación</p>
                  <p className="text-foreground">{sale.payment.observation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tests List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pruebas de la Venta</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="rounded-lg border border-border overflow-hidden min-w-[600px]">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Prueba</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Categoría</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Estado</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Resultado</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Entrega</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sale.tests.map((test) => (
                    <tr key={test.id}>
                      <td className="px-4 py-3 font-medium text-foreground">{test.testName}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{test.category}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={test.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{test.result || '-'}</td>
                      <td className="px-4 py-3">
                        {test.status === 'completed' ? (
                          test.delivered ? (
                            <span className="inline-flex items-center gap-1 text-success text-sm">
                              <Package className="h-4 w-4" />
                              Entregado
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkDelivered(test.id)}
                            >
                              <Package className="h-4 w-4 mr-1" />
                              Entregar
                            </Button>
                          )
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
