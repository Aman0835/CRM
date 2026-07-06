import cors from "cors";
import express from "express";
import morgan from "morgan";

import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import apiRouter from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Barber Shop Admin API is running"
  });
});

app.use("/api/v1", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
