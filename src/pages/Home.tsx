import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  FlaskConical, 
  PlusCircle,
  FileText,
  Stethoscope,
  Building2,
  Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const routes = [
  { 
    path: '/dashboard', 
    label: 'Dashboard', 
    description: 'Resumen general del laboratorio',
    icon: LayoutDashboard,
    color: 'bg-primary/10 text-primary',
    borderColor: 'border-primary/20 hover:border-primary/40'
  },
  { 
    path: '/nueva-venta', 
    label: 'Nueva Venta', 
    description: 'Registrar una nueva orden de pruebas',
    icon: PlusCircle,
    color: 'bg-success/10 text-success',
    borderColor: 'border-success/20 hover:border-success/40'
  },
  { 
    path: '/ventas', 
    label: 'Ventas', 
    description: 'Historial de órdenes y ventas',
    icon: ShoppingCart,
    color: 'bg-accent/10 text-accent',
    borderColor: 'border-accent/20 hover:border-accent/40'
  },
  { 
    path: '/cotizaciones', 
    label: 'Cotizaciones', 
    description: 'Gestionar presupuestos',
    icon: FileText,
    color: 'bg-warning/10 text-warning',
    borderColor: 'border-warning/20 hover:border-warning/40'
  },
  { 
    path: '/clientes', 
    label: 'Clientes', 
    description: 'Administrar pacientes',
    icon: Users,
    color: 'bg-info/10 text-info',
    borderColor: 'border-info/20 hover:border-info/40'
  },
  { 
    path: '/pruebas', 
    label: 'Pruebas Pendientes', 
    description: 'Estado de las pruebas activas',
    icon: FlaskConical,
    color: 'bg-destructive/10 text-destructive',
    borderColor: 'border-destructive/20 hover:border-destructive/40'
  },
  { 
    path: '/gestion-pruebas', 
    label: 'Gestión Pruebas', 
    description: 'Catálogo de tipos de pruebas',
    icon: Activity,
    color: 'bg-primary/10 text-primary',
    borderColor: 'border-primary/20 hover:border-primary/40'
  },
  { 
    path: '/gestion-doctores', 
    label: 'Gestión Doctores', 
    description: 'Administrar médicos referentes',
    icon: Stethoscope,
    color: 'bg-accent/10 text-accent',
    borderColor: 'border-accent/20 hover:border-accent/40'
  },
  { 
    path: '/gestion-derivados', 
    label: 'Gestión Derivados', 
    description: 'Administrar fuentes de derivación',
    icon: Building2,
    color: 'bg-success/10 text-success',
    borderColor: 'border-success/20 hover:border-success/40'
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">LabManager</h1>
            <p className="text-sm text-muted-foreground">Sistema de Laboratorio Clínico</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground">¿Qué deseas hacer?</h2>
          <p className="text-muted-foreground mt-1">Selecciona una opción para continuar</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => {
            const Icon = route.icon;
            return (
              <Link key={route.path} to={route.path}>
                <Card 
                  className={`h-full border-2 ${route.borderColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-xl p-3 ${route.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{route.label}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {route.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <p className="text-xs text-muted-foreground text-center">
            © 2024 LabManager - Sistema de Laboratorio Clínico
          </p>
        </div>
      </footer>
    </div>
  );
}
