import { Router } from "express";

const router = Router();

const movers = [
  { ticker: "NVDA", companyName: "NVIDIA Corporation", price: 887.54, changePercent: 4.82, volume: 48200000, sector: "Technology" },
  { ticker: "TSLA", companyName: "Tesla Inc.", price: 178.21, changePercent: -3.14, volume: 112000000, sector: "Consumer Discretionary" },
  { ticker: "META", companyName: "Meta Platforms Inc.", price: 512.35, changePercent: 2.67, volume: 21500000, sector: "Communication Services" },
  { ticker: "AMD", companyName: "Advanced Micro Devices", price: 162.87, changePercent: 3.41, volume: 56700000, sector: "Technology" },
  { ticker: "AMZN", companyName: "Amazon.com Inc.", price: 191.45, changePercent: 1.93, volume: 32100000, sector: "Consumer Discretionary" },
  { ticker: "GOOGL", companyName: "Alphabet Inc.", price: 178.92, changePercent: 2.15, volume: 24800000, sector: "Communication Services" },
  { ticker: "MSFT", companyName: "Microsoft Corporation", price: 424.68, changePercent: 0.87, volume: 18900000, sector: "Technology" },
  { ticker: "AAPL", companyName: "Apple Inc.", price: 211.45, changePercent: -0.42, volume: 52300000, sector: "Technology" },
];

router.get("/movers", async (req, res) => {
  const shuffled = [...movers].map((m) => ({
    ...m,
    price: m.price * (1 + (Math.random() * 0.002 - 0.001)),
    changePercent: m.changePercent + (Math.random() * 0.2 - 0.1),
  }));
  res.json(shuffled);
});

export default router;
