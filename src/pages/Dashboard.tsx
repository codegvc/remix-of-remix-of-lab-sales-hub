import { PageLayout } from '@/components/layout/PageLayout';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, FlaskConical, Clock } from 'lucide-react';

export default function Dashboard() {
  const { clients, sales, getAllPendingTests } = useData();
  const pendingTests = getAllPendingTests();

  const stats = [
    {
      title: 'Total Clientes',
      value: clients.length,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Total Ventas',
      value: sales.length,
      icon: ShoppingCart,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      title: 'Pruebas Pendientes',
      value: pendingTests.length,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      title: 'Ventas Activas',
      value: sales.filter(s => s.status === 'active').length,
      icon: FlaskConical,
      color: 'text-success',
      bg: 'bg-success/10',
    },
  ];

  const recentSales = sales.slice(-5).reverse();

  return (
    <PageLayout title="Dashboard" subtitle="Resumen general del laboratorio">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-foreground mt-2">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.bg} rounded-full p-3`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ventas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSales.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay ventas registradas aún
                </p>
              ) : (
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div>
                        <p className="font-medium text-foreground">{sale.clientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {sale.tests.length} pruebas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">Bs {sale.total}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pruebas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay pruebas pendientes
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingTests.slice(0, 5).map(({ sale, test }) => (
                    <div
                      key={`${sale.id}-${test.id}`}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div>
                        <p className="font-medium text-foreground">{test.testName}</p>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {sale.clientName}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-warning/10 border border-warning/20 px-2.5 py-0.5 text-xs font-medium text-warning">
                        Pendiente
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
