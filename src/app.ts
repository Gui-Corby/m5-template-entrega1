import "dotenv/config";
import "express-async-errors";
import express, { json } from "express";
import "reflect-metadata";
import cors from "cors"
import helmet from "helmet";
import { taskRouter } from "./routes/task.routes";
import { HandleErrors } from "./middlewares/handleErrors.middleware";
import { categoryRouter } from "./routes/category.routes";
import { userRouter } from "./routes/user.routes";

export const app = express();

app.use(cors());

app.use(helmet());

app.use(json());


app.use("/tasks", taskRouter);
app.use("/categories", categoryRouter);
app.use("/users", userRouter)

app.get("/", (req, res) => {
    res.send("Welcome to my API! The server is up and running.");
})

app.use(HandleErrors.execute);