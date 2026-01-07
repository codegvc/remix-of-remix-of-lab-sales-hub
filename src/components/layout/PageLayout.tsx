import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
}

export function PageLayout({ children, title, subtitle, headerRight }: PageLayoutProps) {
  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-background flex flex-col lg:overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex items-center justify-between px-4 py-3 lg:py-2 md:px-6">
          {/* Left: Back button + Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link to="/">
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0 h-9 w-9 lg:h-8 lg:w-8 rounded-xl hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg lg:text-base font-semibold text-foreground truncate">{title}</h1>
              {subtitle && (
                <p className="text-sm lg:text-xs text-muted-foreground truncate hidden sm:block">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          {headerRight && (
            <div className="shrink-0 ml-4">
              {headerRight}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-3 lg:overflow-auto">
        <div className="animate-fade-in h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
