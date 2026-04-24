import { useGetPortfolioSummary, useGetPortfolioPerformance, useGetMarketMovers, useListActivity } from "@workspace/api-client-react";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, BarChart2, DollarSign, ShieldCheck, Target } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
};

function StatCard({
  label, value, sub, subColor, accent, i
}: { label: string; value: string; sub?: string; subColor?: string; accent?: boolean; i: number }) {
  return (
    <motion.div custom={i} variants={fadeUp} initial="hidden" animate="show"
      className="bg-card border border-border p-4 flex flex-col gap-2 relative overflow-hidden">
      {accent && <div className="absolute top-0 left-0 w-full h-[2px] bg-primary" />}
      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.15em]">{label}</span>
      <span className={cn("font-mono text-xl font-bold leading-none", accent ? "text-primary" : "text-foreground")}>
        {value}
      </span>
      {sub && <span className={cn("text-[11px] font-mono mt-0.5", subColor ?? "text-muted-foreground")}>{sub}</span>}
    </motion.div>
  );
}

function SectionHeader({ title, tag }: { title: string; tag?: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[11px] font-mono font-bold tracking-[0.15em] text-muted-foreground uppercase">{title}</span>
      {tag && <span className="text-[9px] font-mono bg-primary/15 text-primary px-2 py-0.5 tracking-wider">{tag}</span>}
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetPortfolioSummary();
  const { data: performance, isLoading: isLoadingPerformance } = useGetPortfolioPerformance();
  const { data: movers, isLoading: isLoadingMovers } = useGetMarketMovers();
  const { data: activity, isLoading: isLoadingActivity } = useListActivity({ limit: 8 });

  return (
    <div className="space-y-5">

      {/* ── Page title ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-mono font-bold tracking-[0.1em] text-foreground uppercase">Portfolio Dashboard</h1>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Real-time quantitative strategy overview · QuantTrader v2</p>
        </div>
      </div>

      {/* ── KPI Row ── */}
      {isLoadingSummary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full bg-card" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <StatCard i={0} accent label="Total Portfolio Value"
            value={formatCurrency(summary.totalValue)}
            sub={`${summary.dayGainLoss >= 0 ? "▲" : "▼"} ${formatCurrency(Math.abs(summary.dayGainLoss))} (${formatPercent(summary.dayGainLossPercent)}) today`}
            subColor={summary.dayGainLoss >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}
          />
          <StatCard i={1} label="Deployed Capital"
            value={formatCurrency(summary.deployedCapital)}
            sub={`${formatPercent(summary.deployedCapital / summary.totalValue)} of AUM`}
          />
          <StatCard i={2} label="Cash Reserve"
            value={formatCurrency(summary.cashReserve)}
            sub={`${formatPercent(summary.cashReserve / summary.totalValue)} liquid`}
          />
          <StatCard i={3} label="Win Rate"
            value={formatPercent(summary.winRate)}
            sub="Closed positions"
            accent
          />
        </div>
      ) : null}

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">

        {/* Performance chart */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show"
          className="lg:col-span-5 bg-card border border-border p-4">
          <SectionHeader title="Portfolio Performance" tag="90D" />
          <div className="h-[260px]">
            {isLoadingPerformance ? (
              <Skeleton className="w-full h-full bg-background/50" />
            ) : performance ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performance} margin={{ top: 4, right: 0, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="hsl(35,100%,52%)" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="hsl(35,100%,52%)" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="hsl(240,4%,30%)" fontSize={10} tickLine={false} axisLine={false}
                    fontFamily="monospace"
                    tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="hsl(240,4%,30%)" fontSize={10} tickLine={false} axisLine={false}
                    fontFamily="monospace"
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0d0d14", border: "1px solid hsl(240,6%,14%)", borderRadius: 0, fontFamily: "monospace", fontSize: 11 }}
                    itemStyle={{ color: "hsl(35,100%,52%)" }}
                    formatter={(v: number) => [formatCurrency(v), "Value"]}
                    labelFormatter={(v) => new Date(v).toLocaleDateString()}
                  />
                  <Area type="monotone" dataKey="value"
                    stroke="hsl(35,100%,52%)" strokeWidth={1.5}
                    fill="url(#grad)"
                    dot={false}
                    activeDot={{ r: 3, fill: "hsl(35,100%,52%)", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </motion.div>

        {/* Market Movers */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show"
          className="lg:col-span-2 bg-card border border-border p-4">
          <SectionHeader title="Market Movers" tag="LIVE" />
          {isLoadingMovers ? (
            <div className="space-y-2">
              {Array(7).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full bg-background/50" />)}
            </div>
          ) : movers ? (
            <div className="divide-y divide-border/40">
              {movers.map((m) => (
                <div key={m.ticker} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-[12px] text-foreground">{m.ticker}</span>
                    <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[80px]">{m.companyName}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-[12px] text-foreground">{formatCurrency(m.price)}</div>
                    <div className={cn("font-mono text-[10px] font-semibold flex items-center justify-end gap-0.5", m.changePercent >= 0 ? "text-[#22c55e]" : "text-[#ef4444]")}>
                      {m.changePercent >= 0 ? "▲" : "▼"} {formatPercent(Math.abs(m.changePercent))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </motion.div>
      </div>

      {/* ── Quick Metrics Row ── */}
      {summary && (
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { icon: DollarSign, label: "Total P&L (All Time)", value: "+$14,058.07", color: "text-[#22c55e]" },
            { icon: BarChart2,  label: "Positions Open",       value: "12 positions", color: "text-foreground" },
            { icon: Target,     label: "Avg RSI (Portfolio)",  value: "52.4",         color: "text-primary" },
            { icon: ShieldCheck,label: "Strategy Profile",     value: "BALANCED",     color: "text-primary" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-card border border-border px-4 py-3 flex items-center gap-3">
              <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</div>
                <div className={cn("font-mono text-[13px] font-bold mt-0.5", color)}>{value}</div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Recent Activity ── */}
      <motion.div custom={7} variants={fadeUp} initial="hidden" animate="show"
        className="bg-card border border-border">
        <div className="px-4 pt-4 pb-2">
          <SectionHeader title="Recent Trade Activity" tag="LOG" />
        </div>
        {isLoadingActivity ? (
          <div className="px-4 pb-4 space-y-1">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-9 w-full bg-background/50" />)}
          </div>
        ) : activity?.length === 0 ? (
          <div className="px-4 pb-6 text-center text-muted-foreground font-mono text-xs">No activity</div>
        ) : (
          <div className="divide-y divide-border/40">
            {activity?.map((item) => {
              const isBuy  = item.action === "buy" || item.action === "add";
              const isExit = item.action === "tactical_exit" || item.action === "stop_out";
              const actionColor = isBuy ? "text-[#22c55e] bg-[#22c55e]/10" : isExit ? "text-[#ef4444] bg-[#ef4444]/10" : "text-primary bg-primary/10";
              return (
                <div key={item.id} className="flex items-center gap-5 px-4 py-2.5 hover:bg-white/2 transition-colors">
                  <span className={cn("font-mono text-[9px] font-bold tracking-widest px-2 py-0.5 uppercase shrink-0", actionColor)}>
                    {item.action.replace("_", " ")}
                  </span>
                  <span className="font-mono font-bold text-[13px] text-foreground w-14 shrink-0">{item.ticker}</span>
                  <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                    {item.shares} shs @ {formatCurrency(item.price)}
                  </span>
                  <span className="font-mono text-[11px] text-foreground font-semibold shrink-0">
                    {formatCurrency(item.totalValue)}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground truncate flex-1 min-w-0">
                    {item.reason || "–"}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                    {new Date(item.createdAt).toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

    </div>
  );
}
