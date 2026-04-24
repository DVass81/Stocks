import { useState } from "react";
import { 
  useListPositions, 
  useClosePosition, 
  useUpdatePosition, 
  useCreatePosition 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getListPositionsQueryKey } from "@workspace/api-client-react";

export default function Positions() {
  const { data: positions, isLoading } = useListPositions();
  const closePosition = useClosePosition();
  const updatePosition = useUpdatePosition();
  const createPosition = useCreatePosition();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ ticker: "", companyName: "", shares: "", avgCostBasis: "" });

  const [trimState, setTrimState] = useState<{ id: number; currentShares: number; amount: string } | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createPosition.mutate({
      data: {
        ticker: createForm.ticker.toUpperCase(),
        companyName: createForm.companyName,
        shares: Number(createForm.shares),
        avgCostBasis: Number(createForm.avgCostBasis)
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPositionsQueryKey() });
        setIsCreateOpen(false);
        setCreateForm({ ticker: "", companyName: "", shares: "", avgCostBasis: "" });
        toast({ title: "Position Opened", description: `Successfully opened ${createForm.ticker}` });
      }
    });
  };

  const handleClose = (id: number, ticker: string) => {
    if (confirm(`Are you sure you want to close the position for ${ticker}?`)) {
      closePosition.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPositionsQueryKey() });
          toast({ title: "Position Closed", description: `Successfully closed ${ticker}` });
        }
      });
    }
  };

  const handleTrim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimState) return;
    const newShares = trimState.currentShares - Number(trimState.amount);
    if (newShares <= 0) {
      handleClose(trimState.id, "position");
      setTrimState(null);
      return;
    }
    
    updatePosition.mutate({
      id: trimState.id,
      data: { shares: newShares }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPositionsQueryKey() });
        setTrimState(null);
        toast({ title: "Position Trimmed", description: `Successfully trimmed shares` });
      }
    });
  };

  const getStrengthBadge = (strength: string) => {
    switch (strength) {
      case "strong": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">Strong</Badge>;
      case "weak": return <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Weak</Badge>;
      default: return <Badge variant="outline" className="text-muted-foreground border-border hover:bg-white/5">Neutral</Badge>;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const activePositions = positions?.filter(p => p.status === 'active' || p.status === 'trimmed') || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Active Positions</h1>
          <p className="text-muted-foreground text-sm">Manage open trades and tactical exits.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wide w-full sm:w-auto">
              NEW POSITION
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-border bg-card">
            <DialogHeader>
              <DialogTitle>Open New Position</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticker">Ticker</Label>
                  <Input id="ticker" value={createForm.ticker} onChange={e => setCreateForm({...createForm, ticker: e.target.value})} placeholder="AAPL" required className="font-mono uppercase bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shares">Shares</Label>
                  <Input id="shares" type="number" step="0.001" value={createForm.shares} onChange={e => setCreateForm({...createForm, shares: e.target.value})} placeholder="100" required className="font-mono bg-background" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" value={createForm.companyName} onChange={e => setCreateForm({...createForm, companyName: e.target.value})} placeholder="Apple Inc." required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avgCostBasis">Average Cost Basis ($)</Label>
                <Input id="avgCostBasis" type="number" step="0.01" value={createForm.avgCostBasis} onChange={e => setCreateForm({...createForm, avgCostBasis: e.target.value})} placeholder="150.00" required className="font-mono bg-background" />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={createPosition.isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                  {createPosition.isPending ? "EXECUTING..." : "EXECUTE TRADE"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/20">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[100px] font-semibold tracking-wider text-xs">TICKER</TableHead>
                <TableHead className="font-semibold tracking-wider text-xs">SIZE & AVG COST</TableHead>
                <TableHead className="text-right font-semibold tracking-wider text-xs">MKT VALUE</TableHead>
                <TableHead className="text-right font-semibold tracking-wider text-xs">TOTAL P&L</TableHead>
                <TableHead className="text-right font-semibold tracking-wider text-xs w-[100px]">WEIGHT</TableHead>
                <TableHead className="text-right font-semibold tracking-wider text-xs w-[80px]">RSI</TableHead>
                <TableHead className="text-center font-semibold tracking-wider text-xs w-[100px]">SIGNAL</TableHead>
                <TableHead className="text-right font-semibold tracking-wider text-xs w-[140px]">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-border/50">
                    <TableCell><Skeleton className="h-5 w-12 bg-background/50" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 bg-background/50" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 bg-background/50 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-24 bg-background/50 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-12 bg-background/50 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-8 bg-background/50 ml-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-16 bg-background/50 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 bg-background/50 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : activePositions.length === 0 ? (
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No active positions found. Execute a trade to deploy capital.
                  </TableCell>
                </TableRow>
              ) : (
                <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="contents">
                  {activePositions.map((pos) => (
                    <motion.tr key={pos.id} variants={itemVariants} className="border-border/50 hover:bg-white/5 transition-colors group">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="font-mono text-sm font-bold">{pos.ticker}</span>
                          <span className="text-[10px] text-muted-foreground truncate w-20">{pos.companyName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-sm">{pos.shares} shs</span>
                          <span className="font-mono text-xs text-muted-foreground">@ {formatCurrency(pos.avgCostBasis)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-sm">{formatCurrency(pos.marketValue)}</span>
                          <span className="font-mono text-xs text-muted-foreground">{formatCurrency(pos.currentPrice)}/sh</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={cn("flex flex-col items-end", pos.gainLoss >= 0 ? "text-green-500" : "text-destructive")}>
                          <span className="font-mono text-sm flex items-center gap-1 font-medium">
                            {pos.gainLoss >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {formatCurrency(Math.abs(pos.gainLoss))}
                          </span>
                          <span className="font-mono text-xs font-medium">
                            {pos.gainLoss > 0 ? "+" : ""}{formatPercent(pos.gainLossPercent)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-full bg-background h-1.5 rounded-full overflow-hidden max-w-[40px]">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(pos.portfolioWeight, 100)}%` }} />
                          </div>
                          <span className="font-mono text-xs text-muted-foreground w-9">{formatPercent(pos.portfolioWeight)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn("font-mono text-xs font-medium", pos.rsiValue > 70 ? "text-destructive" : pos.rsiValue < 30 ? "text-green-500" : "text-muted-foreground")}>
                          {pos.rsiValue.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStrengthBadge(pos.strength)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Dialog open={trimState?.id === pos.id} onOpenChange={(open) => !open && setTrimState(null)}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-7 text-xs px-2 bg-background border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30" onClick={() => setTrimState({ id: pos.id, currentShares: pos.shares, amount: "" })}>
                                TRIM
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[325px] border-border bg-card">
                              <DialogHeader>
                                <DialogTitle>Trim Position: {pos.ticker}</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleTrim} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <Label htmlFor="trimAmount">Shares to Sell</Label>
                                    <span className="text-muted-foreground font-mono text-xs">Max: {pos.shares}</span>
                                  </div>
                                  <Input id="trimAmount" type="number" step="0.001" max={pos.shares} value={trimState?.amount || ""} onChange={e => setTrimState(prev => prev ? {...prev, amount: e.target.value} : null)} placeholder="0.00" required className="font-mono bg-background" />
                                </div>
                                <DialogFooter>
                                  <Button type="button" variant="outline" onClick={() => setTrimState(null)} className="border-border">CANCEL</Button>
                                  <Button type="submit" disabled={updatePosition.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                                    {updatePosition.isPending ? "EXECUTING..." : "CONFIRM TRIM"}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm" className="h-7 text-xs px-2 bg-background border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" onClick={() => handleClose(pos.id, pos.ticker)} disabled={closePosition.isPending}>
                            CLOSE
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </motion.tbody>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
