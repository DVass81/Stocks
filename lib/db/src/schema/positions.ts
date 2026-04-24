import { pgTable, serial, text, numeric, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const positionStatusEnum = pgEnum("position_status", ["active", "trimmed", "stopped_out", "closed"]);
export const positionStrengthEnum = pgEnum("position_strength", ["strong", "weak", "neutral"]);

export const positionsTable = pgTable("positions", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  companyName: text("company_name").notNull(),
  shares: numeric("shares", { precision: 18, scale: 6 }).notNull(),
  avgCostBasis: numeric("avg_cost_basis", { precision: 18, scale: 4 }).notNull(),
  currentPrice: numeric("current_price", { precision: 18, scale: 4 }).notNull(),
  rsiValue: numeric("rsi_value", { precision: 6, scale: 2 }).notNull().default("50"),
  status: positionStatusEnum("status").notNull().default("active"),
  strength: positionStrengthEnum("strength").notNull().default("neutral"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPositionSchema = createInsertSchema(positionsTable).omit({ id: true, createdAt: true });
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positionsTable.$inferSelect;
