import { useState } from "react";
import { useListWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Trash2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getListWatchlistQueryKey } from "@workspace/api-client-react";

function RsiBadge({ rsi }: { rsi: number }) {
  if (rsi > 70) return <span className="font-mono text-[11px] text-[#ef4444] font-semibold">{rsi.toFixed(1)} <span className="text-[9px] opacity-70">OB</span></span>;
  if (rsi < 30) return <span className="font-mono text-[11px] text-[#22c55e] font-semibold">{rsi.toFixed(1)} <span className="text-[9px] opacity-70">OS</span></span>;
  return <span className="font-mono text-[11px] text-muted-foreground">{rsi.toFixed(1)}</span>;
}

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
        notes: form.notes || undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWatchlistQueryKey() });
        setIsOpen(false);
        setForm({ ticker: "", companyName: "", targetBuyPrice: "", notes: "" });
        toast({ title: "Added to Watchlist", description: `Now tracking ${form.ticker.toUpperCase()}` });
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

  const COL = "text-[10px] font-mono font-bold tracking-[0.12em] text-muted-foreground uppercase py-2 px-3 border-b border-border bg-black/20";

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-mono font-bold tracking-[0.1em] text-foreground uppercase">Watchlist</h1>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Technical setups and target entry prices under surveillance.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-[11px] tracking-[0.1em] h-8 px-4 gap-2">
              <Plus className="w-3.5 h-3.5" /> ADD TICKER
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px] border-border bg-card rounded-none">
            <DialogHeader>
              <DialogTitle className="font-mono text-sm tracking-wider uppercase">Add to Watchlist</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Ticker</Label>
                  <Input value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value })}
                    placeholder="MSFT" required className="font-mono uppercase bg-background rounded-none text-sm h-8" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Target Buy ($)</Label>
                  <Input type="number" step="0.01" value={form.targetBuyPrice} onChange={e => setForm({ ...form, targetBuyPrice: e.target.value })}
                    placeholder="350.00" className="font-mono bg-background rounded-none text-sm h-8" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Company Name</Label>
                <Input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })}
                  placeholder="Microsoft Corp." required className="bg-background rounded-none text-sm h-8" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Notes</Label>
                <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Watching for RSI crossover..." className="bg-background rounded-none text-sm h-8" />
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={addWatchlist.isPending}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-[11px] tracking-widest rounded-none h-9">
                  {addWatchlist.isPending ? "ADDING..." : "ADD TICKER"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className={cn(COL, "text-left w-40")}>TICKER</th>
                <th className={cn(COL, "text-right")}>PRICE</th>
                <th className={cn(COL, "text-right")}>DAY CHG</th>
                <th className={cn(COL, "text-right")}>TARGET BUY</th>
                <th className={cn(COL, "text-right")}>DISTANCE</th>
                <th className={cn(COL, "text-center")}>RSI</th>
                <th className={cn(COL, "text-left px-4")}>NOTES</th>
                <th className={cn(COL, "text-center w-12")}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    {Array(8).fill(0).map((__, j) => (
                      <td key={j} className="px-3 py-3">
                        <Skeleton className="h-4 w-full bg-background/50" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : watchlist?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted-foreground font-mono text-xs tracking-wider">
                    NO TICKERS UNDER SURVEILLANCE
                  </td>
                </tr>
              ) : (
                watchlist?.map((item, idx) => {
                  const isUp = item.dayChangePercent >= 0;
                  const atTarget = item.targetBuyPrice != null && item.currentPrice <= item.targetBuyPrice;
                  const distance = item.targetBuyPrice != null
                    ? (item.currentPrice - item.targetBuyPrice) / item.targetBuyPrice
                    : null;

                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b border-border/40 hover:bg-white/2 transition-colors group"
                    >
                      {/* Ticker */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-0.5 h-7 shrink-0", isUp ? "bg-[#22c55e]/60" : "bg-[#ef4444]/60")} />
                          <div>
                            <div className="font-mono font-bold text-[13px] text-foreground">{item.ticker}</div>
                            <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[100px]">{item.companyName}</div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-3 py-3 text-right">
                        <span className="font-mono text-[13px] text-foreground">{formatCurrency(item.currentPrice)}</span>
                      </td>

                      {/* Day change */}
                      <td className="px-3 py-3 text-right">
                        <span className={cn("font-mono text-[12px] font-semibold", isUp ? "text-[#22c55e]" : "text-[#ef4444]")}>
                          {isUp ? "▲" : "▼"} {formatPercent(Math.abs(item.dayChangePercent))}
                        </span>
                      </td>

                      {/* Target buy */}
                      <td className="px-3 py-3 text-right">
                        {item.targetBuyPrice != null ? (
                          <span className={cn("font-mono text-[12px]", atTarget ? "text-[#22c55e] font-bold" : "text-muted-foreground")}>
                            {formatCurrency(item.targetBuyPrice)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Distance from target */}
                      <td className="px-3 py-3 text-right">
                        {distance != null ? (
                          <span className={cn("font-mono text-[11px]", atTarget ? "text-[#22c55e] font-semibold" : "text-muted-foreground")}>
                            {atTarget ? "✓ AT TARGET" : `${formatPercent(Math.abs(distance))} away`}
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* RSI */}
                      <td className="px-3 py-3 text-center">
                        <RsiBadge rsi={item.rsiValue} />
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-[11px] text-muted-foreground italic">
                          {item.notes ? `"${item.notes}"` : "—"}
                        </span>
                      </td>

                      {/* Remove */}
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleRemove(item.id, item.ticker)}
                          disabled={removeWatchlist.isPending}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-[#ef4444]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
