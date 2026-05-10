import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import tripsRouter from "./trips";
import stopsRouter from "./stops";
import activitiesRouter from "./activities";
import budgetRouter from "./budget";
import packingRouter from "./packing";
import notesRouter from "./notes";
import citiesRouter from "./cities";
import dashboardRouter from "./dashboard";
import aiRouter from "./ai";
import geminiRouter from "./gemini";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(tripsRouter);
router.use(stopsRouter);
router.use(activitiesRouter);
router.use(budgetRouter);
router.use(packingRouter);
router.use(notesRouter);
router.use(citiesRouter);
router.use(dashboardRouter);
router.use(aiRouter);
router.use(geminiRouter);

export default router;
