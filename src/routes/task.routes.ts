import { Router } from "express";
import { container } from "tsyringe";
import { TaskServices } from "../services/task.services";
import { ValidateBody } from "../middlewares/validateBody.middleware";
import { createTaskBodySchema, updateTaskBodySchema } from "../schemas/task.schemas";
import { TaskControllers } from "../controllers/task.controllers";
import { createCategoryBodySchema } from "../schemas/category.schema";

container.registerSingleton("TaskServices", TaskServices);
const taskControllers = container.resolve(TaskControllers);

export const taskRouter = Router();

taskRouter.post("/tasks", ValidateBody.execute(createTaskBodySchema), (req, res) =>
    taskControllers.createTask(req, res))

taskRouter.get("/tasks", (req, res) => taskControllers.getAllTasks(req, res))

taskRouter.get("/tasks/:id", (req, res) => taskControllers.getTaskById(req, res));

taskRouter.patch("/tasks/:id", ValidateBody.execute(updateTaskBodySchema), (req, res) => taskControllers.updateTask(req, res));

taskRouter.delete("/tasks/:id", (req, res) => taskControllers.deleteTask(req, res));

console.log("Categories route registered");

taskRouter.post("/categories", ValidateBody.execute(createCategoryBodySchema), 
(req, res) => {
    taskControllers.createCategory(req, res);
})

taskRouter.delete("/categories/:id", (req, res) => taskControllers.deleteCategory(req, res));