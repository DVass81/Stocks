import { useEffect, useState, useRef } from "react";
import { useGetStrategy, useUpdateStrategy, useApplyStrategyPreset } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatPercent } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Settings, ShieldAlert, Zap, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getGetStrategyQueryKey } from "@workspace/api-client-react";

export default function Strategy() {
  const { data: strategy, isLoading } = useGetStrategy();
  const updateStrategy = useUpdateStrategy();
  const applyPreset = useApplyStrategyPreset();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState<any>(null);
  const initializedRef = useRef<number | null>(null);

  useEffect(() => {
    if (strategy && strategy.id !== initializedRef.current) {
      setForm({ ...strategy });
      initializedRef.current = strategy.id;
    }
  }, [strategy]);

  const handleApplyPreset = (preset: "balanced" | "conservative") => {
    applyPreset.mutate({ data: { preset } }, {
      onSuccess: (updatedStrategy) => {
        setForm({ ...updatedStrategy });
        queryClient.invalidateQueries({ queryKey: getGetStrategyQueryKey() });
        toast({ title: "Preset Applied", description: `Applied ${preset.replace('_', ' ')} settings.` });
      }
    });
  };

  const handleSave = () => {
    if (!form) return;
    
    // Prepare the update payload
    const updateData = {
      preset: "custom", // Any manual save converts it to custom
      riskMode: form.riskMode,
      minCashReserve: Number(form.minCashReserve),
      absoluteMinTrade: Number(form.absoluteMinTrade),
      maxTradePercent: Number(form.maxTradePercent),
      allocationTolerance: Number(form.allocationTolerance),
      starterFillPercent: Number(form.starterFillPercent),
      ownedAddFillPercent: Number(form.ownedAddFillPercent),
      watchBuyScaler: Number(form.watchBuyScaler),
      trimProfitPercent: Number(form.trimProfitPercent),
      hardExitLossPercent: Number(form.hardExitLossPercent),
      tacticalExitLossPercent: Number(form.tacticalExitLossPercent),
      tacticalExitRequiredSignals: Number(form.tacticalExitRequiredSignals),
      tacticalExitRsiMax: Number(form.tacticalExitRsiMax),
      tacticalExitRangePositionMax: Number(form.tacticalExitRangePositionMax),
      tacticalExitOffHighMinPercent: Number(form.tacticalExitOffHighMinPercent),
    };

    updateStrategy.mutate({ data: updateData }, {
      onSuccess: (updatedStrategy) => {
        setForm({ ...updatedStrategy });
        queryClient.invalidateQueries({ queryKey: getGetStrategyQueryKey() });
        toast({ title: "Strategy Updated", description: "Custom parameters saved and applied." });
      }
    });
  };

  if (isLoading || !form) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 bg-background/50" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full bg-card" />
          <Skeleton className="h-96 w-full bg-card" />
        </div>
      </div>
    );
  }

  const isBalancedActive = form.preset === 'balanced';
  const isConservativeActive = form.preset === 'conservative';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Strategy Engine</h1>
        <p className="text-muted-foreground text-sm">Configure quantitative parameters for automated position sizing and risk management.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Balanced Preset Card */}
        <Card className={`bg-card border-2 transition-all duration-300 relative overflow-hidden ${isBalancedActive ? 'border-primary shadow-[0_0_15px_rgba(255,165,0,0.1)]' : 'border-border opacity-70 hover:opacity-100'}`}>
          {isBalancedActive && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg">
              Active Profile
            </div>
          )}
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className={isBalancedActive ? "text-primary" : "text-muted-foreground"} /> 
              Balanced Growth
            </CardTitle>
            <CardDescription>Faster deployment, tighter trims</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Owned Add Fill</span>
              <span className="font-bold">60%</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Starter Fill</span>
              <span className="font-bold">75%</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Trim Trigger</span>
              <span className="font-bold text-green-500">12% Profit</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Hard Stop</span>
              <span className="font-bold text-destructive">-8% Loss</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-muted-foreground">Cash Reserve</span>
              <span className="font-bold">15% Min</span>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              variant={isBalancedActive ? "secondary" : "default"}
              className={`w-full ${isBalancedActive ? 'bg-white/5 pointer-events-none' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
              onClick={() => handleApplyPreset('balanced')}
              disabled={isBalancedActive || applyPreset.isPending}
            >
              {isBalancedActive ? "ACTIVE" : "APPLY BALANCED PRESET"}
            </Button>
          </CardFooter>
        </Card>

        {/* Conservative Preset Card */}
        <Card className={`bg-card border-2 transition-all duration-300 relative overflow-hidden ${isConservativeActive ? 'border-primary shadow-[0_0_15px_rgba(255,165,0,0.1)]' : 'border-border opacity-70 hover:opacity-100'}`}>
          {isConservativeActive && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg">
              Active Profile
            </div>
          )}
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldAlert className={isConservativeActive ? "text-primary" : "text-muted-foreground"} /> 
              Conservative Growth
            </CardTitle>
            <CardDescription>Slower deployment, wider trims</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Owned Add Fill</span>
              <span className="font-bold">35%</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Starter Fill</span>
              <span className="font-bold">50%</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Trim Trigger</span>
              <span className="font-bold text-green-500">14% Profit</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Hard Stop</span>
              <span className="font-bold text-destructive">-7% Loss</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-muted-foreground">Cash Reserve</span>
              <span className="font-bold">25% Min</span>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              variant={isConservativeActive ? "secondary" : "default"}
              className={`w-full ${isConservativeActive ? 'bg-white/5 pointer-events-none' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
              onClick={() => handleApplyPreset('conservative')}
              disabled={isConservativeActive || applyPreset.isPending}
            >
              {isConservativeActive ? "ACTIVE" : "APPLY CONSERVATIVE PRESET"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex items-center gap-4 my-8">
        <div className="h-[1px] flex-1 bg-border" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest px-2">Manual Override</span>
        <div className="h-[1px] flex-1 bg-border" />
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
          <div>
            <CardTitle className="text-lg">Detailed Parameters</CardTitle>
            <CardDescription>Fine-tune individual constraints. Modifying these will switch to a Custom profile.</CardDescription>
          </div>
          <div className="flex items-center gap-3 bg-background border border-border px-4 py-2 rounded-md">
            <Label htmlFor="riskMode" className="font-mono text-xs cursor-pointer">Auto Trade Execution</Label>
            <Switch 
              id="riskMode" 
              checked={form.riskMode === 'auto'} 
              onCheckedChange={(c) => setForm({...form, riskMode: c ? 'auto' : 'manual'})}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          
          {/* Section: Sizing Rules */}
          <div>
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Position Sizing Engine
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Starter Fill (%)</Label>
                <div className="relative">
                  <Input type="number" value={form.starterFillPercent} onChange={e => setForm({...form, starterFillPercent: e.target.value})} className="font-mono bg-background border-border/50" />
                  <span className="absolute right-3 top-2.5 text-muted-foreground text-xs">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Owned Add Fill (%)</Label>
                <div className="relative">
                  <Input type="number" value={form.ownedAddFillPercent} onChange={e => setForm({...form, ownedAddFillPercent: e.target.value})} className="font-mono bg-background border-border/50" />
                  <span className="absolute right-3 top-2.5 text-muted-foreground text-xs">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Max Trade Size (%)</Label>
                <div className="relative">
                  <Input type="number" value={form.maxTradePercent} onChange={e => setForm({...form, maxTradePercent: e.target.value})} className="font-mono bg-background border-border/50" />
                  <span className="absolute right-3 top-2.5 text-muted-foreground text-xs">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[1px] w-full bg-border/50" />

          {/* Section: Risk & Exits */}
          <div>
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Risk & Exit Triggers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Trim Profit Target (%)</Label>
                <div className="relative">
                  <Input type="number" value={form.trimProfitPercent} onChange={e => setForm({...form, trimProfitPercent: e.target.value})} className="font-mono text-green-500 bg-background border-border/50" />
                  <span className="absolute right-3 top-2.5 text-muted-foreground text-xs">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Hard Stop Loss (%)</Label>
                <div className="relative">
                  <Input type="number" value={form.hardExitLossPercent} onChange={e => setForm({...form, hardExitLossPercent: e.target.value})} className="font-mono text-destructive bg-background border-border/50" />
                  <span className="absolute right-3 top-2.5 text-muted-foreground text-xs">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Min Cash Reserve (%)</Label>
                <div className="relative">
                  <Input type="number" value={form.minCashReserve} onChange={e => setForm({...form, minCashReserve: e.target.value})} className="font-mono bg-background border-border/50" />
                  <span className="absolute right-3 top-2.5 text-muted-foreground text-xs">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[1px] w-full bg-border/50" />

          {/* Section: Tactical Exits */}
          <div className="opacity-80">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Tactical Exit Conditions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Required Signals</Label>
                <Input type="number" value={form.tacticalExitRequiredSignals} onChange={e => setForm({...form, tacticalExitRequiredSignals: e.target.value})} className="font-mono bg-background border-border/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">RSI Max</Label>
                <Input type="number" value={form.tacticalExitRsiMax} onChange={e => setForm({...form, tacticalExitRsiMax: e.target.value})} className="font-mono bg-background border-border/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Range Pos Max</Label>
                <Input type="number" value={form.tacticalExitRangePositionMax} onChange={e => setForm({...form, tacticalExitRangePositionMax: e.target.value})} className="font-mono bg-background border-border/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Off High Min (%)</Label>
                <div className="relative">
                  <Input type="number" value={form.tacticalExitOffHighMinPercent} onChange={e => setForm({...form, tacticalExitOffHighMinPercent: e.target.value})} className="font-mono bg-background border-border/50" />
                  <span className="absolute right-3 top-2.5 text-muted-foreground text-xs">%</span>
                </div>
              </div>
            </div>
          </div>

        </CardContent>
        <CardFooter className="pt-6 border-t border-border/50 bg-black/10 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={updateStrategy.isPending}
            className="bg-white text-black hover:bg-white/90 font-medium px-8"
          >
            {updateStrategy.isPending ? "SAVING..." : "SAVE CUSTOM PARAMETERS"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
