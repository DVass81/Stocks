import { useGetPortfolioSummary, useGetPortfolioPerformance, useGetMarketMovers, useListActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetPortfolioSummary();
  const { data: performance, isLoading: isLoadingPerformance } = useGetPortfolioPerformance();
  const { data: movers, isLoading: isLoadingMovers } = useGetMarketMovers();
  const { data: activity, isLoading: isLoadingActivity } = useListActivity({ limit: 5 });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio Dashboard</h1>
        <p className="text-muted-foreground text-sm">Real-time overview of your quantitative strategies and performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingSummary ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full bg-card" />)
        ) : summary ? (
          <>
            <motion.div variants={itemVariants}>
              <Card className="bg-card border-border overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-bold">{formatCurrency(summary.totalValue)}</div>
                  <div className="flex items-center mt-1">
                    <span className={cn("text-xs font-mono font-medium flex items-center", summary.dayGainLoss >= 0 ? "text-green-500" : "text-destructive")}>
                      {summary.dayGainLoss >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {formatCurrency(Math.abs(summary.dayGainLoss))} ({formatPercent(summary.dayGainLossPercent)})
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">Today</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Deployed Capital</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-bold">{formatCurrency(summary.deployedCapital)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatPercent(summary.deployedCapital / summary.totalValue)} of portfolio
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Cash Reserve</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-bold">{formatCurrency(summary.cashReserve)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatPercent(summary.cashReserve / summary.totalValue)} of portfolio
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-bold text-primary">{formatPercent(summary.winRate)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Across all closed positions</p>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <motion.div variants={itemVariants} className="md:col-span-5">
          <Card className="bg-card border-border h-full">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingPerformance ? (
                <Skeleton className="w-full h-full bg-background/50" />
              ) : performance ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performance} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontFamily: 'monospace' }}
                      formatter={(val: number) => formatCurrency(val)}
                      labelFormatter={(val) => new Date(val).toLocaleDateString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="bg-card border-border h-full">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Market Movers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMovers ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full bg-background/50" />)}
                </div>
              ) : movers ? (
                <div className="space-y-4">
                  {movers.map((mover) => (
                    <div key={mover.ticker} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <div>
                        <div className="font-mono font-bold text-sm">{mover.ticker}</div>
                        <div className="text-xs text-muted-foreground truncate w-24">{mover.companyName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm">{formatCurrency(mover.price)}</div>
                        <div className={cn("text-xs font-mono font-medium", mover.changePercent >= 0 ? "text-green-500" : "text-destructive")}>
                          {mover.changePercent > 0 ? "+" : ""}{formatPercent(mover.changePercent)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-background/50" />)}
              </div>
            ) : activity ? (
              <div className="space-y-3">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-md bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.action.includes('buy') || item.action === 'add' ? "bg-green-500" : 
                        item.action.includes('sell') || item.action === 'trim' ? "bg-primary" : "bg-destructive"
                      )} />
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono font-bold">{item.ticker}</span>
                          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{item.action.replace('_', ' ')}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">{item.shares} shs @ {formatCurrency(item.price)}</div>
                      <div className="text-xs font-medium text-muted-foreground mt-0.5">Value: {formatCurrency(item.totalValue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No recent activity</div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
