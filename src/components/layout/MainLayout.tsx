import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

export interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
}

export function MainLayout({ children, title, subtitle, headerRight }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="border-b border-border bg-card px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {headerRight && <div>{headerRight}</div>}
          </div>
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
