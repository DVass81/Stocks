import { useState } from "react";
import { useListWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Trash2, TrendingUp, TrendingDown, Target, Activity as ActivityIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getListWatchlistQueryKey } from "@workspace/api-client-react";

export default function Watchlist() {
  const { data: watchlist, isLoading } = useListWatchlist();
  const addWatchlist = useAddToWatchlist();
  const removeWatchlist = useRemoveFromWatchlist();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ ticker: "", companyName: "", targetBuyPrice: "", notes: "" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addWatchlist.mutate({
      data: {
        ticker: form.ticker.toUpperCase(),
        companyName: form.companyName,
        targetBuyPrice: form.targetBuyPrice ? Number(form.targetBuyPrice) : undefined,
        notes: form.notes || undefined
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWatchlistQueryKey() });
        setIsOpen(false);
        setForm({ ticker: "", companyName: "", targetBuyPrice: "", notes: "" });
        toast({ title: "Added to Watchlist", description: `Successfully tracking ${form.ticker}` });
      }
    });
  };

  const handleRemove = (id: number, ticker: string) => {
    removeWatchlist.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWatchlistQueryKey() });
        toast({ title: "Removed", description: `Stopped tracking ${ticker}` });
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground text-sm">Monitor technical setups and target buy prices.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wide w-full sm:w-auto">
              ADD TICKER
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-border bg-card">
            <DialogHeader>
              <DialogTitle>Add to Watchlist</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticker">Ticker</Label>
                  <Input id="ticker" value={form.ticker} onChange={e => setForm({...form, ticker: e.target.value})} placeholder="MSFT" required className="font-mono uppercase bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetBuyPrice">Target Buy ($)</Label>
                  <Input id="targetBuyPrice" type="number" step="0.01" value={form.targetBuyPrice} onChange={e => setForm({...form, targetBuyPrice: e.target.value})} placeholder="350.00" className="font-mono bg-background" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} placeholder="Microsoft Corp." required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Waiting for RSI crossover..." className="bg-background" />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={addWatchlist.isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                  {addWatchlist.isPending ? "ADDING..." : "ADD TICKER"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full bg-card rounded-lg" />
          ))}
        </div>
      ) : watchlist?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-lg border border-border border-dashed">
          <ActivityIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">Watchlist is empty</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">Start tracking technical setups by adding tickers you want to monitor for entry signals.</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {watchlist?.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <Card className="bg-card border-border hover:border-border/80 transition-colors group relative overflow-hidden h-full">
                <div className={cn("absolute top-0 left-0 w-1 h-full", item.dayChangePercent >= 0 ? "bg-green-500/50" : "bg-destructive/50")} />
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemove(item.id, item.ticker)}
                  disabled={removeWatchlist.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4 pr-6">
                    <div>
                      <h3 className="font-mono text-xl font-bold">{item.ticker}</h3>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">{item.companyName}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold">{formatCurrency(item.currentPrice)}</div>
                      <div className={cn("flex items-center justify-end gap-1 text-xs font-mono font-medium", item.dayChangePercent >= 0 ? "text-green-500" : "text-destructive")}>
                        {item.dayChangePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {item.dayChangePercent > 0 ? "+" : ""}{formatPercent(item.dayChangePercent)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                        <Target className="w-3 h-3" /> Target Buy
                      </p>
                      <div className="font-mono text-sm">
                        {item.targetBuyPrice ? (
                          <span className={item.currentPrice <= item.targetBuyPrice ? "text-green-500 font-bold" : ""}>
                            {formatCurrency(item.targetBuyPrice)}
                          </span>
                        ) : <span className="text-muted-foreground">-</span>}
                      </div>
                      {item.targetBuyPrice && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatPercent((item.currentPrice - item.targetBuyPrice) / item.targetBuyPrice)} away
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                        <ActivityIcon className="w-3 h-3" /> Daily RSI
                      </p>
                      <div className={cn(
                        "font-mono text-sm", 
                        item.rsiValue > 70 ? "text-destructive" : item.rsiValue < 30 ? "text-green-500 font-bold" : ""
                      )}>
                        {item.rsiValue.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.rsiValue > 70 ? "Overbought" : item.rsiValue < 30 ? "Oversold" : "Neutral"}
                      </div>
                    </div>
                  </div>
                  
                  {item.notes && (
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground italic leading-relaxed">"{item.notes}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
