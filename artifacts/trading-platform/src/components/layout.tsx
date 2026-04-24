import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Briefcase, 
  Settings2, 
  LineChart,
  History,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/positions", label: "Positions", icon: Briefcase },
  { href: "/strategy", label: "Strategy", icon: Settings2 },
  { href: "/watchlist", label: "Watchlist", icon: LineChart },
  { href: "/activity", label: "Activity", icon: History },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex shrink-0 z-20 shadow-2xl relative">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-bold tracking-wider text-lg">
            <Activity className="w-5 h-5 text-primary" />
            <span>QUANT<span className="text-foreground">TRADER</span></span>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary border-l-2 border-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground border-l-2 border-transparent"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground opacity-70")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="bg-white/5 rounded-md p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-mono text-green-500">MARKET OPEN</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden h-14 border-b border-border bg-card flex items-center justify-between px-4 z-20">
          <div className="flex items-center gap-2 text-primary font-bold tracking-wider">
            <Activity className="w-4 h-4" />
            <span>QUANT<span className="text-foreground">TRADER</span></span>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
