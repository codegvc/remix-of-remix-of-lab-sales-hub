import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  FlaskConical, 
  PlusCircle,
  FileText,
  Stethoscope,
  Building2,
  Activity,
  DollarSign,
  Send
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const routes = [
  { 
    path: '/dashboard', 
    label: 'Dashboard', 
    description: 'Resumen general del laboratorio',
    icon: LayoutDashboard,
    color: 'from-blue-500 to-blue-600',
  },
  { 
    path: '/nueva-venta', 
    label: 'Nueva Venta', 
    description: 'Registrar una nueva orden de pruebas',
    icon: PlusCircle,
    color: 'from-green-500 to-green-600',
  },
  { 
    path: '/ventas', 
    label: 'Ventas', 
    description: 'Historial de órdenes y ventas',
    icon: ShoppingCart,
    color: 'from-cyan-500 to-cyan-600',
  },
  { 
    path: '/cotizaciones', 
    label: 'Cotizaciones', 
    description: 'Gestionar presupuestos',
    icon: FileText,
    color: 'from-violet-500 to-violet-600',
  },
  { 
    path: '/clientes', 
    label: 'Clientes', 
    description: 'Administrar pacientes',
    icon: Users,
    color: 'from-teal-500 to-teal-600',
  },
  { 
    path: '/pruebas', 
    label: 'Pruebas Pendientes', 
    description: 'Estado de las pruebas activas',
    icon: FlaskConical,
    color: 'from-orange-500 to-orange-600',
  },
  { 
    path: '/gestion-pruebas', 
    label: 'Gestión Pruebas', 
    description: 'Catálogo de tipos de pruebas',
    icon: Activity,
    color: 'from-indigo-500 to-indigo-600',
  },
  { 
    path: '/gestion-doctores', 
    label: 'Gestión Doctores', 
    description: 'Administrar médicos referentes',
    icon: Stethoscope,
    color: 'from-purple-500 to-purple-600',
  },
  { 
    path: '/gestion-derivados', 
    label: 'Gestión Derivados', 
    description: 'Administrar fuentes de derivación',
    icon: Building2,
    color: 'from-emerald-500 to-emerald-600',
  },
  { 
    path: '/precios-laboratorios', 
    label: 'Precios Laboratorios', 
    description: 'Precios por laboratorio externo',
    icon: DollarSign,
    color: 'from-amber-500 to-amber-600',
  },
  { 
    path: '/pruebas-a-enviar', 
    label: 'Pruebas A Enviar', 
    description: 'Pruebas externas pendientes de envío',
    icon: Send,
    color: 'from-rose-500 to-rose-600',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">LabManager</h1>
              <p className="text-primary-foreground/80">Sistema de Laboratorio Clínico</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">Bienvenido</h2>
          <p className="text-muted-foreground mt-2">Selecciona una sección para comenzar</p>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {routes.map((route) => {
            const Icon = route.icon;
            return (
              <Card 
                key={route.path}
                title={route.description}
                className="group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                onClick={() => navigate(route.path)}
              >
                <CardContent className="flex flex-col items-center justify-center py-6 px-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${route.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-center">{route.label}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6">
        <p className="text-xs text-muted-foreground text-center">
          © 2024 LabManager - Sistema de Laboratorio Clínico
        </p>
      </footer>
    </div>
  );
}
