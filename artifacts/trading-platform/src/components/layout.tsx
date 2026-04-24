import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Briefcase,
  Settings2,
  LineChart,
  History,
  Activity,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "DASHBOARD", icon: LayoutDashboard },
  { href: "/positions", label: "POSITIONS", icon: Briefcase },
  { href: "/strategy", label: "STRATEGY", icon: Settings2 },
  { href: "/watchlist", label: "WATCHLIST", icon: LineChart },
  { href: "/activity", label: "ACTIVITY", icon: History },
];

const TICKER_DATA = [
  { symbol: "SPY",    price: 547.32,  change: +1.24,  pct: +0.23 },
  { symbol: "QQQ",    price: 463.18,  change: +2.01,  pct: +0.44 },
  { symbol: "DIA",    price: 398.74,  change: -0.63,  pct: -0.16 },
  { symbol: "IWM",    price: 199.45,  change: -1.12,  pct: -0.56 },
  { symbol: "VIX",    price: 18.43,   change: +0.87,  pct: +4.96 },
  { symbol: "BTC",    price: 63420.50,change: +840.22, pct: +1.34 },
  { symbol: "ETH",    price: 3102.88, change: +44.10,  pct: +1.44 },
  { symbol: "NVDA",   price: 887.54,  change: +41.38,  pct: +4.89 },
  { symbol: "TSLA",   price: 178.21,  change: -5.56,   pct: -3.02 },
  { symbol: "AAPL",   price: 211.45,  change: -1.04,   pct: -0.49 },
  { symbol: "MSFT",   price: 424.66,  change: +3.54,   pct: +0.84 },
  { symbol: "META",   price: 512.35,  change: +12.88,  pct: +2.58 },
  { symbol: "AMZN",   price: 191.41,  change: +3.52,   pct: +1.87 },
  { symbol: "GOOGL",  price: 179.08,  change: +3.78,   pct: +2.16 },
  { symbol: "AMD",    price: 162.94,  change: +5.42,   pct: +3.44 },
  { symbol: "10Y",    price: 4.387,   change: +0.031,  pct: +0.71 },
  { symbol: "GLD",    price: 232.18,  change: +0.94,   pct: +0.41 },
  { symbol: "OIL",    price: 82.14,   change: -0.38,   pct: -0.46 },
];

function TickerItem({ symbol, price, change, pct }: typeof TICKER_DATA[0]) {
  const isUp = change >= 0;
  const priceStr = price >= 10000
    ? price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <span className="inline-flex items-center gap-2 px-5 border-r border-white/8 whitespace-nowrap shrink-0 h-full">
      <span className="font-mono font-bold text-[11px] text-white/80 tracking-wider">{symbol}</span>
      <span className="font-mono text-[11px] text-white/90">{priceStr}</span>
      <span className={cn("font-mono text-[10px] font-medium", isUp ? "text-[#22c55e]" : "text-[#ef4444]")}>
        {isUp ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
      </span>
    </span>
  );
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const date = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit", year: "numeric" });
  return (
    <div className="text-right">
      <div className="font-mono text-[13px] text-white/90 tracking-wider leading-none">{time}</div>
      <div className="font-mono text-[10px] text-white/40 mt-0.5 uppercase tracking-wide">{date}</div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const doubled = [...TICKER_DATA, ...TICKER_DATA];

  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground font-sans overflow-hidden">

      {/* ── Market Ticker Tape ── */}
      <div className="h-8 bg-[#080810] border-b border-white/6 overflow-hidden flex items-center shrink-0 relative z-30">
        <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-[#080810] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-[#080810] to-transparent z-10 pointer-events-none" />
        <div className="ticker-track h-full">
          {doubled.map((item, i) => (
            <TickerItem key={i} {...item} />
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="w-56 border-r border-border bg-card flex flex-col shrink-0 z-20 hidden md:flex">

          {/* Logo */}
          <div className="h-12 flex items-center px-5 border-b border-border bg-black/20">
            <div className="flex items-center gap-2 font-bold tracking-[0.15em] text-sm">
              <Activity className="w-4 h-4 text-primary shrink-0" />
              <span className="text-primary">QUANT</span><span className="text-foreground">TRADER</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-[11px] font-semibold tracking-[0.12em] transition-all duration-150",
                    isActive
                      ? "bg-primary/12 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-white/4 hover:text-foreground border-l-2 border-transparent"
                  )}
                >
                  <item.icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-primary" : "opacity-50")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Status Panel */}
          <div className="border-t border-border bg-black/20">
            <div className="px-4 py-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">Market</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-green-500 font-semibold">OPEN</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">Feed</span>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-mono text-primary font-semibold">LIVE</span>
                </div>
              </div>
              <div className="pt-1 border-t border-border/60">
                <LiveClock />
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 flex flex-col min-h-0 relative overflow-y-auto">

          {/* Mobile Header */}
          <header className="md:hidden h-12 border-b border-border bg-card flex items-center justify-between px-4 z-20 shrink-0">
            <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-sm">
              <Activity className="w-4 h-4" />
              <span>QUANT<span className="text-foreground">TRADER</span></span>
            </div>
          </header>

          {/* Page Header Bar */}
          <div className="hidden md:flex h-10 items-center justify-between px-6 border-b border-border/60 bg-black/10 shrink-0">
            <div className="flex items-center gap-6">
              {NAV_ITEMS.map((item) => {
                const isActive = location === item.href;
                return isActive ? (
                  <span key={item.href} className="text-[11px] font-mono font-semibold text-primary tracking-wider uppercase">
                    {item.label}
                  </span>
                ) : null;
              })}
            </div>
            <div className="flex items-center gap-6 text-[10px] font-mono text-muted-foreground tracking-wider">
              <span>NYSE · NASDAQ · CRYPTO</span>
              <span className="text-white/25">|</span>
              <span className="text-primary/70">AUTO-REFRESH 30s</span>
            </div>
          </div>

          <div className="flex-1 p-5 md:p-6 max-w-[1700px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
