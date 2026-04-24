import { pgTable, serial, text, numeric, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const strategyPresetEnum = pgEnum("strategy_preset", ["balanced", "conservative", "custom"]);
export const riskModeEnum = pgEnum("risk_mode", ["auto", "manual"]);

export const strategyTable = pgTable("strategy", {
  id: serial("id").primaryKey(),
  preset: strategyPresetEnum("preset").notNull().default("balanced"),
  riskMode: riskModeEnum("risk_mode").notNull().default("auto"),
  minCashReserve: numeric("min_cash_reserve", { precision: 10, scale: 2 }).notNull().default("25"),
  absoluteMinTrade: numeric("absolute_min_trade", { precision: 10, scale: 2 }).notNull().default("5"),
  maxTradePercent: numeric("max_trade_percent", { precision: 6, scale: 4 }).notNull().default("0.75"),
  allocationTolerance: numeric("allocation_tolerance", { precision: 6, scale: 4 }).notNull().default("1.0"),
  starterFillPercent: numeric("starter_fill_percent", { precision: 6, scale: 4 }).notNull().default("0.75"),
  ownedAddFillPercent: numeric("owned_add_fill_percent", { precision: 6, scale: 4 }).notNull().default("0.60"),
  watchBuyScaler: numeric("watch_buy_scaler", { precision: 6, scale: 4 }).notNull().default("1.00"),
  trimProfitPercent: numeric("trim_profit_percent", { precision: 6, scale: 2 }).notNull().default("12.0"),
  hardExitLossPercent: numeric("hard_exit_loss_percent", { precision: 6, scale: 2 }).notNull().default("-8.0"),
  tacticalExitLossPercent: numeric("tactical_exit_loss_percent", { precision: 6, scale: 2 }).notNull().default("-6.0"),
  tacticalExitRequiredSignals: integer("tactical_exit_required_signals").notNull().default(3),
  tacticalExitRsiMax: integer("tactical_exit_rsi_max").notNull().default(45),
  tacticalExitRangePositionMax: integer("tactical_exit_range_position_max").notNull().default(35),
  tacticalExitOffHighMinPercent: numeric("tactical_exit_off_high_min_percent", { precision: 6, scale: 2 }).notNull().default("8"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStrategySchema = createInsertSchema(strategyTable).omit({ id: true, updatedAt: true });
export type InsertStrategy = z.infer<typeof insertStrategySchema>;
export type Strategy = typeof strategyTable.$inferSelect;
