import { Router } from "express";
import { container } from "tsyringe";
import { TaskServices } from "../services/task.services";
import { TaskControllers } from "../controllers/task.controllers";
import { ValidateBody } from "../middlewares/validateBody.middleware";
import { createCategoryBodySchema } from "../schemas/category.schema";
import { verifyToken } from "../middlewares/verifyToken.middleware";
import { verifyOwnership } from "../middlewares/verifyOwnership.middleware";

container.registerSingleton("CategoryServices", TaskServices);
const taskControllers = container.resolve(TaskControllers);

export const categoryRouter = Router();

categoryRouter.post("/", verifyToken.execute, ValidateBody.execute(createCategoryBodySchema),
    (req, res) => {
        taskControllers.createCategory(req, res);
    }
)

categoryRouter.delete("/:id", verifyToken.execute, verifyOwnership("category"),
    (req, res) => taskControllers.deleteCategory(req, res));