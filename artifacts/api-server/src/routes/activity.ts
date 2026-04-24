import { Router } from "express";
import { db, activityTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { ListActivityQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const query = ListActivityQueryParams.parse({ limit: req.query.limit ? Number(req.query.limit) : 20 });
  const items = await db
    .select()
    .from(activityTable)
    .orderBy(desc(activityTable.createdAt))
    .limit(query.limit ?? 20);

  res.json(
    items.map((a) => ({
      id: a.id,
      ticker: a.ticker,
      action: a.action,
      shares: parseFloat(a.shares),
      price: parseFloat(a.price),
      totalValue: parseFloat(a.totalValue),
      gainLoss: a.gainLoss ? parseFloat(a.gainLoss) : undefined,
      gainLossPercent: a.gainLossPercent ? parseFloat(a.gainLossPercent) : undefined,
      reason: a.reason,
      createdAt: a.createdAt.toISOString(),
    }))
  );
});

export default router;
