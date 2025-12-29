import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  FlaskConical, 
  PlusCircle,
  Activity,
  FileText,
  Stethoscope,
  Building2
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/nueva-venta', label: 'Nueva Venta', icon: PlusCircle },
  { path: '/ventas', label: 'Ventas', icon: ShoppingCart },
  { path: '/cotizaciones', label: 'Cotizaciones', icon: FileText },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/pruebas', label: 'Pruebas Pendientes', icon: FlaskConical },
  { path: '/gestion-pruebas', label: 'Gestión Pruebas', icon: Activity },
  { path: '/gestion-doctores', label: 'Gestión Doctores', icon: Stethoscope },
  { path: '/gestion-derivados', label: 'Gestión Derivados', icon: Building2 },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <Activity className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">LabManager</h1>
            <p className="text-xs text-sidebar-foreground/60">Sistema de Laboratorio</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/50 text-center">
            © 2024 LabManager
          </p>
        </div>
      </div>
    </aside>
  );
}
