import { Router } from "express";
import { db, watchlistTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AddToWatchlistBody, RemoveFromWatchlistParams } from "@workspace/api-zod";

const router = Router();

function formatItem(w: typeof watchlistTable.$inferSelect) {
  return {
    id: w.id,
    ticker: w.ticker,
    companyName: w.companyName,
    currentPrice: parseFloat(w.currentPrice),
    dayChangePercent: parseFloat(w.dayChangePercent),
    targetBuyPrice: w.targetBuyPrice ? parseFloat(w.targetBuyPrice) : undefined,
    rsiValue: parseFloat(w.rsiValue),
    notes: w.notes,
    createdAt: w.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const items = await db.select().from(watchlistTable);
  res.json(items.map(formatItem));
});

router.post("/", async (req, res) => {
  const body = AddToWatchlistBody.parse(req.body);
  const [item] = await db
    .insert(watchlistTable)
    .values({
      ticker: body.ticker,
      companyName: body.companyName,
      currentPrice: "0",
      targetBuyPrice: body.targetBuyPrice?.toString(),
      notes: body.notes,
    })
    .returning();
  res.status(201).json(formatItem(item));
});

router.delete("/:id", async (req, res) => {
  const { id } = RemoveFromWatchlistParams.parse({ id: parseInt(req.params.id) });
  await db.delete(watchlistTable).where(eq(watchlistTable.id, id));
  res.json({ success: true });
});

export default router;
