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
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary/80">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide text-white drop-shadow-lg">
            Laboratorio Clínico Magnus S.R.L.
          </h1>
          <div className="mt-3 space-y-0.5">
            <p className="text-white/80 text-sm">
              Av. Oquendo entre Av. Heroinas y calle Colombia acera oeste
            </p>
            <p className="text-white/80 text-sm font-medium">72266960 • Cochabamba - Bolivia</p>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <div className="bg-black/10 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-2 flex justify-between items-center text-white/90 text-sm font-medium">
          <span className="bg-white/10 px-3 py-1 rounded-full text-xs">Ver. 1.0.0</span>
          <span className="bg-white/10 px-3 py-1 rounded-full text-xs">{today}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 md:p-8">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {routes.map((route, index) => {
            const Icon = route.icon;
            return (
              <div
                key={route.path}
                title={route.description}
                className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(route.path)}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex flex-col items-center justify-center p-4 md:p-5">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 shadow-sm">
                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-primary group-hover:text-primary/90 transition-colors" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-center text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
                    {route.label}
                  </span>
                </div>

                {/* Bottom accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6">
        <p className="text-sm text-white/60 text-center">
          © 2024 Laboratorio Clínico Magnus S.R.L.
        </p>
      </footer>
    </div>
  );
}
