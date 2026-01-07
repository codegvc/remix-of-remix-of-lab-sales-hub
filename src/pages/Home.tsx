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
    <div className="min-h-screen bg-slate-700">
      {/* Header */}
      <header className="bg-cyan-500 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Laboratorio Magnus
          </h1>
          <p className="text-white/90 text-sm mt-1">{today}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {routes.map((route) => {
            const Icon = route.icon;
            return (
              <div
                key={route.path}
                title={route.description}
                className="group bg-white rounded shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-slate-600 hover:border-cyan-500"
                onClick={() => navigate(route.path)}
              >
                <div className="flex flex-col items-center justify-center py-5 px-3">
                  <Icon className="w-8 h-8 text-slate-500 group-hover:text-cyan-600 transition-colors mb-3" strokeWidth={1.5} />
                  <span className="text-xs md:text-sm font-medium text-center text-slate-700 group-hover:text-cyan-600 transition-colors leading-tight">
                    {route.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
