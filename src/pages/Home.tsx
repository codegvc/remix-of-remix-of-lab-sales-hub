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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4 md:p-8">
      {/* Floating Container */}
      <div className="w-full max-w-4xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-cyan-500 to-teal-500 py-6 px-6">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
              Laboratorio Magnus
            </h1>
            <p className="text-white/80 text-sm mt-1 font-medium">{today}</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 md:p-8">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {routes.map((route, index) => {
              const Icon = route.icon;
              // Assign gradient colors based on category
              const colorClasses = index < 3 
                ? 'from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600' 
                : index < 6 
                  ? 'from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600'
                  : index < 9
                    ? 'from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600'
                    : 'from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600';
              
              return (
                <div
                  key={route.path}
                  title={route.description}
                  className={`group bg-gradient-to-br ${colorClasses} rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer`}
                  onClick={() => navigate(route.path)}
                >
                  <div className="flex flex-col items-center justify-center py-6 px-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
                      <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-xs md:text-sm font-semibold text-center text-white leading-tight drop-shadow-sm">
                      {route.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
