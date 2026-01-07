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

const routes = [
  // Ventas primero
  { 
    path: '/nueva-venta', 
    label: 'Nueva Venta', 
    description: 'Registrar una nueva orden de pruebas',
    icon: PlusCircle,
  },
  { 
    path: '/ventas', 
    label: 'Ventas', 
    description: 'Historial de órdenes y ventas',
    icon: ShoppingCart,
  },
  { 
    path: '/cotizaciones', 
    label: 'Cotizaciones', 
    description: 'Gestionar presupuestos',
    icon: FileText,
  },
  // Relacionado a ventas
  { 
    path: '/clientes', 
    label: 'Clientes', 
    description: 'Administrar pacientes',
    icon: Users,
  },
  { 
    path: '/gestion-doctores', 
    label: 'Gestión Doctores', 
    description: 'Administrar médicos referentes',
    icon: Stethoscope,
  },
  { 
    path: '/gestion-derivados', 
    label: 'Gestión Derivados', 
    description: 'Administrar fuentes de derivación',
    icon: Building2,
  },
  // Pruebas
  { 
    path: '/pruebas', 
    label: 'Pruebas Pendientes', 
    description: 'Estado de las pruebas activas',
    icon: FlaskConical,
  },
  { 
    path: '/gestion-pruebas', 
    label: 'Gestión Pruebas', 
    description: 'Catálogo de tipos de pruebas',
    icon: Activity,
  },
  { 
    path: '/pruebas-a-enviar', 
    label: 'Pruebas A Enviar', 
    description: 'Pruebas externas pendientes de envío',
    icon: Send,
  },
  // Laboratorios y Dashboard
  { 
    path: '/precios-laboratorios', 
    label: 'Precios Laboratorios', 
    description: 'Precios por laboratorio externo',
    icon: DollarSign,
  },
  { 
    path: '/dashboard', 
    label: 'Dashboard', 
    description: 'Resumen general del laboratorio',
    icon: LayoutDashboard,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-4">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide">Laboratorio Clínico Magnus S.R.L.</h1>
          <p className="text-primary-foreground/80 text-sm mt-2">
            Av. Oquendo entre Av. Heroinas y calle Colombia acera oeste
          </p>
          <p className="text-primary-foreground/80 text-sm">72266960</p>
          <p className="text-primary-foreground/80 text-sm">Cochabamba - Bolivia</p>
        </div>
      </header>

      {/* Navigation Bar */}
      <div className="bg-primary/80 border-y border-primary-foreground/20">
        <div className="max-w-6xl mx-auto px-6 py-2 flex justify-between items-center text-primary-foreground text-sm">
          <span>Ver.: 1.0.0</span>
          <span>{today}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {routes.map((route) => {
            const Icon = route.icon;
            return (
              <div
                key={route.path}
                title={route.description}
                className="bg-white rounded-sm shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-primary/50 aspect-square flex flex-col items-center justify-center p-3 group"
                onClick={() => navigate(route.path)}
              >
                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                  <Icon className="w-10 h-10 md:w-14 md:h-14 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-xs md:text-sm font-medium text-center text-foreground leading-tight">
                  {route.label}
                </span>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4">
        <p className="text-xs text-primary-foreground/60 text-center">
          © 2024 Laboratorio Clínico Magnus S.R.L.
        </p>
      </footer>
    </div>
  );
}
