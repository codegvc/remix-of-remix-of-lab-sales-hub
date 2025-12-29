import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, ArrowRight, Trash2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Quotes() {
  const navigate = useNavigate();
  const { quotes, deleteQuote } = useData();

  const handleDeleteQuote = (quoteId: string) => {
    deleteQuote(quoteId);
    toast.success('Cotización eliminada');
  };

  return (
    <PageLayout title="Cotizaciones" subtitle="Presupuestos pendientes">
      <div className="space-y-6">
        {quotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay cotizaciones registradas</p>
              <Button className="mt-4" onClick={() => navigate('/nueva-venta')}>
                Crear Cotización
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Cotizaciones</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pruebas</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => {
                    const isExpired = quote.expirationDate && new Date(quote.expirationDate) < new Date();
                    return (
                      <TableRow key={quote.id}>
                        <TableCell className="font-mono text-sm">{quote.id.slice(-6)}</TableCell>
                        <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {quote.expirationDate 
                            ? new Date(quote.expirationDate).toLocaleDateString() 
                            : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          {isExpired ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Vencido
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Vigente</Badge>
                          )}
                        </TableCell>
                        <TableCell>{quote.tests.length} pruebas</TableCell>
                        <TableCell className="font-semibold">Bs {quote.total}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/nueva-venta?quoteId=${quote.id}`)}
                          >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Convertir
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteQuote(quote.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
