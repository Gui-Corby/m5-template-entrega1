import express, { json } from "express";
import "reflect-metadata";
import "express-async-errors";
import cors from "cors"
import helmet from "helmet";
import { taskRouter } from "./routes/task.routes";
import { HandleErrors } from "./middlewares/handleErrors.middleware";

export const app = express();

app.use(cors());

app.use(helmet());

app.use(json());

console.log("Routes registered")
app.use("/tasks", taskRouter);

app.use(HandleErrors.execute);