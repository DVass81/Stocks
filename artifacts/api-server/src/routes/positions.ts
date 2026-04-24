import { Router } from "express";
import { db, positionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreatePositionBody,
  UpdatePositionBody,
  GetPositionParams,
  UpdatePositionParams,
  ClosePositionParams,
} from "@workspace/api-zod";

const router = Router();

function formatPosition(p: typeof positionsTable.$inferSelect) {
  const shares = parseFloat(p.shares);
  const avgCost = parseFloat(p.avgCostBasis);
  const currentPrice = parseFloat(p.currentPrice);
  const marketValue = shares * currentPrice;
  const gainLoss = marketValue - shares * avgCost;
  const gainLossPercent = avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0;
  return {
    id: p.id,
    ticker: p.ticker,
    companyName: p.companyName,
    shares,
    avgCostBasis: avgCost,
    currentPrice,
    marketValue,
    gainLoss,
    gainLossPercent,
    portfolioWeight: 0,
    rsiValue: parseFloat(p.rsiValue),
    status: p.status,
    strength: p.strength,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const positions = await db.select().from(positionsTable);

  const totalValue = positions
    .filter((p) => p.status === "active")
    .reduce((sum, p) => sum + parseFloat(p.shares) * parseFloat(p.currentPrice), 0);

  const result = positions.map((p) => {
    const mv = parseFloat(p.shares) * parseFloat(p.currentPrice);
    return { ...formatPosition(p), portfolioWeight: totalValue > 0 ? (mv / totalValue) * 100 : 0 };
  });

  res.json(result);
});

router.post("/", async (req, res) => {
  const body = CreatePositionBody.parse(req.body);
  const [position] = await db
    .insert(positionsTable)
    .values({
      ticker: body.ticker,
      companyName: body.companyName,
      shares: body.shares.toString(),
      avgCostBasis: body.avgCostBasis.toString(),
      currentPrice: body.avgCostBasis.toString(),
    })
    .returning();
  res.status(201).json(formatPosition(position));
});

router.get("/:id", async (req, res) => {
  const { id } = GetPositionParams.parse({ id: parseInt(req.params.id) });
  const [position] = await db.select().from(positionsTable).where(eq(positionsTable.id, id));
  if (!position) return res.status(404).json({ error: "Not found" });
  res.json(formatPosition(position));
});

router.put("/:id", async (req, res) => {
  const { id } = UpdatePositionParams.parse({ id: parseInt(req.params.id) });
  const body = UpdatePositionBody.parse(req.body);
  const updates: Partial<typeof positionsTable.$inferInsert> = {};
  if (body.shares != null) updates.shares = body.shares.toString();
  if (body.avgCostBasis != null) updates.avgCostBasis = body.avgCostBasis.toString();
  if (body.currentPrice != null) updates.currentPrice = body.currentPrice.toString();
  const [updated] = await db.update(positionsTable).set(updates).where(eq(positionsTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(formatPosition(updated));
});

router.delete("/:id", async (req, res) => {
  const { id } = ClosePositionParams.parse({ id: parseInt(req.params.id) });
  const [closed] = await db
    .update(positionsTable)
    .set({ status: "closed" })
    .where(eq(positionsTable.id, id))
    .returning();
  if (!closed) return res.status(404).json({ error: "Not found" });
  res.json(formatPosition(closed));
});

export default router;
