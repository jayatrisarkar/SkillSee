import { Router, type IRouter } from "express";
import healthRouter from "./health";
import libraryRouter from "./library";
import playlistRouter from "./playlist";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/library", libraryRouter);
router.use("/playlist", playlistRouter);

export default router;
