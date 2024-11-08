
import { Router } from "express";
import { container } from "tsyringe";
import { UserControllers } from "../controllers/user.controllers";
import { verifyToken } from "../middlewares/verifyToken.middleware";
import { UserServices } from "../services/user.services";
import { ValidateBody } from "../middlewares/validateBody.middleware";
import { createUserBodySchema, loginUserBodySchema } from "../schemas/user.schema";

container.registerSingleton("UserServices", UserServices)
const userControllers = container.resolve(UserControllers)

export const userRouter = Router();


userRouter.post("/login", ValidateBody.execute(loginUserBodySchema), (req, res) =>
    userControllers.login(req, res))

userRouter.post("/", ValidateBody.execute(createUserBodySchema), (req, res) =>
    userControllers.createUser(req, res));

userRouter.get("/profile", verifyToken.execute, (req, res) => 
    userControllers.autoLogin(req, res));