import { Router } from "express";
import { db, strategyTable } from "@workspace/db";
import { UpdateStrategyBody, ApplyStrategyPresetBody } from "@workspace/api-zod";

const router = Router();

function formatStrategy(s: typeof strategyTable.$inferSelect) {
  return {
    id: s.id,
    preset: s.preset,
    riskMode: s.riskMode,
    minCashReserve: parseFloat(s.minCashReserve),
    absoluteMinTrade: parseFloat(s.absoluteMinTrade),
    maxTradePercent: parseFloat(s.maxTradePercent),
    allocationTolerance: parseFloat(s.allocationTolerance),
    starterFillPercent: parseFloat(s.starterFillPercent),
    ownedAddFillPercent: parseFloat(s.ownedAddFillPercent),
    watchBuyScaler: parseFloat(s.watchBuyScaler),
    trimProfitPercent: parseFloat(s.trimProfitPercent),
    hardExitLossPercent: parseFloat(s.hardExitLossPercent),
    tacticalExitLossPercent: parseFloat(s.tacticalExitLossPercent),
    tacticalExitRequiredSignals: s.tacticalExitRequiredSignals,
    tacticalExitRsiMax: s.tacticalExitRsiMax,
    tacticalExitRangePositionMax: s.tacticalExitRangePositionMax,
    tacticalExitOffHighMinPercent: parseFloat(s.tacticalExitOffHighMinPercent),
    updatedAt: s.updatedAt.toISOString(),
  };
}

async function getOrCreateStrategy() {
  const [existing] = await db.select().from(strategyTable).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(strategyTable).values({}).returning();
  return created;
}

router.get("/", async (req, res) => {
  const strategy = await getOrCreateStrategy();
  res.json(formatStrategy(strategy));
});

router.put("/", async (req, res) => {
  const body = UpdateStrategyBody.parse(req.body);
  const strategy = await getOrCreateStrategy();
  const updates: Partial<typeof strategyTable.$inferInsert> = { updatedAt: new Date() };
  if (body.preset != null) updates.preset = body.preset as "balanced" | "conservative" | "custom";
  if (body.riskMode != null) updates.riskMode = body.riskMode as "auto" | "manual";
  if (body.minCashReserve != null) updates.minCashReserve = body.minCashReserve.toString();
  if (body.absoluteMinTrade != null) updates.absoluteMinTrade = body.absoluteMinTrade.toString();
  if (body.maxTradePercent != null) updates.maxTradePercent = body.maxTradePercent.toString();
  if (body.allocationTolerance != null) updates.allocationTolerance = body.allocationTolerance.toString();
  if (body.starterFillPercent != null) updates.starterFillPercent = body.starterFillPercent.toString();
  if (body.ownedAddFillPercent != null) updates.ownedAddFillPercent = body.ownedAddFillPercent.toString();
  if (body.watchBuyScaler != null) updates.watchBuyScaler = body.watchBuyScaler.toString();
  if (body.trimProfitPercent != null) updates.trimProfitPercent = body.trimProfitPercent.toString();
  if (body.hardExitLossPercent != null) updates.hardExitLossPercent = body.hardExitLossPercent.toString();
  if (body.tacticalExitLossPercent != null) updates.tacticalExitLossPercent = body.tacticalExitLossPercent.toString();
  if (body.tacticalExitRequiredSignals != null) updates.tacticalExitRequiredSignals = body.tacticalExitRequiredSignals;
  if (body.tacticalExitRsiMax != null) updates.tacticalExitRsiMax = body.tacticalExitRsiMax;
  if (body.tacticalExitRangePositionMax != null) updates.tacticalExitRangePositionMax = body.tacticalExitRangePositionMax;
  if (body.tacticalExitOffHighMinPercent != null) updates.tacticalExitOffHighMinPercent = body.tacticalExitOffHighMinPercent.toString();

  const { eq } = await import("drizzle-orm");
  const [updated] = await db.update(strategyTable).set(updates).where(eq(strategyTable.id, strategy.id)).returning();
  res.json(formatStrategy(updated));
});

router.post("/apply-preset", async (req, res) => {
  const { preset } = ApplyStrategyPresetBody.parse(req.body);
  const strategy = await getOrCreateStrategy();

  const presets = {
    balanced: {
      preset: "balanced" as const,
      minCashReserve: "25",
      absoluteMinTrade: "5",
      maxTradePercent: "0.75",
      allocationTolerance: "1.0",
      starterFillPercent: "0.75",
      ownedAddFillPercent: "0.60",
      watchBuyScaler: "1.00",
      trimProfitPercent: "12.0",
      hardExitLossPercent: "-8.0",
      tacticalExitLossPercent: "-6.0",
      tacticalExitRequiredSignals: 3,
      tacticalExitRsiMax: 45,
      tacticalExitRangePositionMax: 35,
      tacticalExitOffHighMinPercent: "8",
    },
    conservative: {
      preset: "conservative" as const,
      minCashReserve: "40",
      absoluteMinTrade: "5",
      maxTradePercent: "0.50",
      allocationTolerance: "1.5",
      starterFillPercent: "0.50",
      ownedAddFillPercent: "0.35",
      watchBuyScaler: "0.85",
      trimProfitPercent: "14.0",
      hardExitLossPercent: "-7.0",
      tacticalExitLossPercent: "-5.0",
      tacticalExitRequiredSignals: 2,
      tacticalExitRsiMax: 47,
      tacticalExitRangePositionMax: 40,
      tacticalExitOffHighMinPercent: "7",
    },
  };

  const { eq } = await import("drizzle-orm");
  const [updated] = await db
    .update(strategyTable)
    .set({ ...presets[preset], updatedAt: new Date() })
    .where(eq(strategyTable.id, strategy.id))
    .returning();
  res.json(formatStrategy(updated));
});

export default router;
