import { pgTable, serial, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tradeActionEnum = pgEnum("trade_action", ["buy", "sell", "trim", "add", "stop_out", "tactical_exit"]);

export const activityTable = pgTable("activity", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  action: tradeActionEnum("action").notNull(),
  shares: numeric("shares", { precision: 18, scale: 6 }).notNull(),
  price: numeric("price", { precision: 18, scale: 4 }).notNull(),
  totalValue: numeric("total_value", { precision: 18, scale: 2 }).notNull(),
  gainLoss: numeric("gain_loss", { precision: 18, scale: 2 }),
  gainLossPercent: numeric("gain_loss_percent", { precision: 10, scale: 4 }),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activityTable).omit({ id: true, createdAt: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activityTable.$inferSelect;
