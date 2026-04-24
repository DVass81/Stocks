import { useListActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, CornerUpLeft, Minimize2, XCircle } from "lucide-react";

export default function Activity() {
  const { data: activity, isLoading } = useListActivity();

  const getActionInfo = (action: string) => {
    switch (action) {
      case 'buy': 
      case 'add':
        return { color: "text-green-500", bg: "bg-green-500/10 border-green-500/20", icon: CornerUpLeft, label: action.toUpperCase() };
      case 'sell':
        return { color: "text-primary", bg: "bg-primary/10 border-primary/20", icon: ArrowUpRight, label: "SELL" };
      case 'trim':
        return { color: "text-primary", bg: "bg-primary/10 border-primary/20", icon: Minimize2, label: "TRIM" };
      case 'stop_out':
      case 'tactical_exit':
        return { color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", icon: XCircle, label: action.replace('_', ' ').toUpperCase() };
      default:
        return { color: "text-muted-foreground", bg: "bg-white/5 border-border", icon: ArrowUpRight, label: action.toUpperCase() };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-mono font-bold tracking-[0.1em] text-foreground uppercase">Trade Activity</h1>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Complete log of all automated and manual trade executions.</p>
        </div>
      </div>

      <Card className="bg-card border-border overflow-hidden rounded-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/25">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[180px] font-mono tracking-[0.12em] text-[10px] text-muted-foreground">TIME</TableHead>
                <TableHead className="w-[130px] font-mono tracking-[0.12em] text-[10px] text-muted-foreground">ACTION</TableHead>
                <TableHead className="w-[100px] font-mono tracking-[0.12em] text-[10px] text-muted-foreground">TICKER</TableHead>
                <TableHead className="text-right font-mono tracking-[0.12em] text-[10px] text-muted-foreground">EXECUTION</TableHead>
                <TableHead className="text-right font-mono tracking-[0.12em] text-[10px] text-muted-foreground">TOTAL VALUE</TableHead>
                <TableHead className="text-right font-mono tracking-[0.12em] text-[10px] text-muted-foreground">REALIZED P&L</TableHead>
                <TableHead className="font-mono tracking-[0.12em] text-[10px] text-muted-foreground w-[300px] pl-8">REASON / NOTES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(10).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-border/50">
                    <TableCell><Skeleton className="h-5 w-32 bg-background/50" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 bg-background/50 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12 bg-background/50" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-24 bg-background/50 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 bg-background/50 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 bg-background/50 ml-auto" /></TableCell>
                    <TableCell className="pl-8"><Skeleton className="h-4 w-48 bg-background/50" /></TableCell>
                  </TableRow>
                ))
              ) : activity?.length === 0 ? (
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No trading activity found.
                  </TableCell>
                </TableRow>
              ) : (
                <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="contents">
                  {activity?.map((log) => {
                    const info = getActionInfo(log.action);
                    const ActionIcon = info.icon;
                    return (
                      <motion.tr key={log.id} variants={itemVariants} className="border-border/50 hover:bg-white/5 transition-colors">
                        <TableCell className="text-muted-foreground text-xs font-mono">
                          {new Date(log.createdAt).toLocaleString(undefined, { 
                            month: 'short', day: '2-digit', 
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-sm flex items-center gap-1.5 w-fit border", info.bg, info.color)}>
                            <ActionIcon className="w-3 h-3" />
                            {info.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm font-bold">
                          {log.ticker}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-mono text-sm">{log.shares} shs</span>
                            <span className="font-mono text-xs text-muted-foreground">@ {formatCurrency(log.price)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatCurrency(log.totalValue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {log.gainLoss !== undefined ? (
                            <div className={cn("flex flex-col items-end", log.gainLoss >= 0 ? "text-green-500" : "text-destructive")}>
                              <span className="font-mono text-sm font-medium">
                                {log.gainLoss > 0 ? "+" : ""}{formatCurrency(log.gainLoss)}
                              </span>
                              {log.gainLossPercent !== undefined && (
                                <span className="font-mono text-xs font-medium">
                                  {log.gainLossPercent > 0 ? "+" : ""}{formatPercent(log.gainLossPercent)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground font-mono text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="pl-8 text-xs text-muted-foreground">
                          {log.reason || "-"}
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </motion.tbody>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
