import { Router } from "express";
import { container } from "tsyringe";
import { TaskServices } from "../services/task.services";
import { ValidateBody } from "../middlewares/validateBody.middleware";
import { createTaskBodySchema, updateTaskBodySchema } from "../schemas/task.schemas";
import { TaskControllers } from "../controllers/task.controllers";
import { createCategoryBodySchema } from "../schemas/category.schema";
import { verifyToken } from "../middlewares/verifyToken.middleware";
import { verifyOwnership } from "../middlewares/verifyOwnership.middleware";

container.registerSingleton("TaskServices", TaskServices);
const taskControllers = container.resolve(TaskControllers);

export const taskRouter = Router();

taskRouter.post("/", verifyToken.execute,
    ValidateBody.execute(createTaskBodySchema), (req, res) =>
    taskControllers.createTask(req, res))

taskRouter.get("/", verifyToken.execute,
    (req, res) => taskControllers.getAllTasks(req, res))

taskRouter.get("/:id", verifyToken.execute, 
    (req, res) => taskControllers.getTaskById(req, res));

taskRouter.patch("/:id", verifyToken.execute, verifyOwnership("task"),
    ValidateBody.execute(updateTaskBodySchema), (req, res) => taskControllers.updateTask(req, res));

taskRouter.delete("/:id", verifyToken.execute, verifyOwnership("task"),
    (req, res) => taskControllers.deleteTask(req, res));
