import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const watchlistTable = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  companyName: text("company_name").notNull(),
  currentPrice: numeric("current_price", { precision: 18, scale: 4 }).notNull(),
  dayChangePercent: numeric("day_change_percent", { precision: 10, scale: 4 }).notNull().default("0"),
  targetBuyPrice: numeric("target_buy_price", { precision: 18, scale: 4 }),
  rsiValue: numeric("rsi_value", { precision: 6, scale: 2 }).notNull().default("50"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWatchlistSchema = createInsertSchema(watchlistTable).omit({ id: true, createdAt: true });
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Watchlist = typeof watchlistTable.$inferSelect;
