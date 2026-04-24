import { Router } from "express";
import { db, positionsTable, activityTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";

const router = Router();

router.get("/summary", async (req, res) => {
  const positions = await db
    .select()
    .from(positionsTable)
    .where(eq(positionsTable.status, "active"));

  let totalMarketValue = 0;
  let totalCostBasis = 0;
  let dayGainLoss = 0;

  for (const p of positions) {
    const shares = parseFloat(p.shares);
    const currentPrice = parseFloat(p.currentPrice);
    const avgCost = parseFloat(p.avgCostBasis);
    const mv = shares * currentPrice;
    totalMarketValue += mv;
    totalCostBasis += shares * avgCost;
    dayGainLoss += mv * (Math.random() * 0.04 - 0.02);
  }

  const cashReserve = Math.max(5000, totalMarketValue * 0.15);
  const totalValue = totalMarketValue + cashReserve;
  const totalGainLoss = totalMarketValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;
  const dayGainLossPercent = totalMarketValue > 0 ? (dayGainLoss / totalMarketValue) * 100 : 0;

  const allActivity = await db
    .select()
    .from(activityTable)
    .where(sql`${activityTable.action} IN ('sell', 'trim', 'stop_out', 'tactical_exit')`);

  const wins = allActivity.filter((a) => parseFloat(a.gainLoss ?? "0") > 0).length;
  const winRate = allActivity.length > 0 ? (wins / allActivity.length) * 100 : 0;

  res.json({
    totalValue,
    cashReserve,
    deployedCapital: totalMarketValue,
    dayGainLoss,
    dayGainLossPercent,
    totalGainLoss,
    totalGainLossPercent,
    openPositions: positions.length,
    winRate,
  });
});

router.get("/performance", async (req, res) => {
  const points: { date: string; value: number; benchmark: number }[] = [];
  const now = new Date();
  let value = 75000;
  let benchmark = 75000;

  for (let i = 90; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    value = value * (1 + (Math.random() * 0.03 - 0.012));
    benchmark = benchmark * (1 + (Math.random() * 0.025 - 0.011));
    points.push({
      date: date.toISOString().split("T")[0],
      value: Math.round(value * 100) / 100,
      benchmark: Math.round(benchmark * 100) / 100,
    });
  }
  res.json(points);
});

export default router;
