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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex items-center justify-between px-4 py-4 md:px-6">
          {/* Left: Back button + Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link to="/">
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0 h-10 w-10 rounded-xl hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate hidden sm:block">{subtitle}</p>
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
      <main className="flex-1 p-4 md:p-6">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
