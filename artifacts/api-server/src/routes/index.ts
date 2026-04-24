import { Router, type IRouter } from "express";
import healthRouter from "./health";
import portfolioRouter from "./portfolio";
import positionsRouter from "./positions";
import strategyRouter from "./strategy";
import activityRouter from "./activity";
import watchlistRouter from "./watchlist";
import marketRouter from "./market";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/portfolio", portfolioRouter);
router.use("/positions", positionsRouter);
router.use("/strategy", strategyRouter);
router.use("/activity", activityRouter);
router.use("/watchlist", watchlistRouter);
router.use("/market", marketRouter);

export default router;
