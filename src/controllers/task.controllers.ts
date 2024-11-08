import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { TaskServices } from "../services/task.services";
import { TTaskReturn } from "../schemas/task.schemas";
import { TCategoryReturn, TTaskReturnWithCategory } from "../schemas/category.schema";


@injectable()
export class TaskControllers {
    constructor(@inject("TaskServices") private taskService: TaskServices) {}

    async createTask(req: Request, res: Response): Promise<Response<TTaskReturn>> {
        const { user } = res.locals;

        const response = await this.taskService.createTask(req.body, user.id);

        return res.status(201).json(response);
    }

    async deleteTask(req: Request, res: Response): Promise<Response> {
        // const { user } = res.locals

        const response = await this.taskService.deleteTask(Number(req.params.id));

        return res.status(204).send()
    }

    async createCategory(req: Request, res: Response): Promise<Response<TCategoryReturn>> {
        const { user } = res.locals

        const response = await this.taskService.createCategory(req.body, user.id);


        return res.status(201).json(response);


    }

    async deleteCategory(req: Request, res: Response) {
        const { user } = res.locals

        const response = await this.taskService.deleteCategory(Number(req.params.id), user.id);

        return res.status(204).send();
    }

    async getTaskById(req: Request, res: Response): Promise<Response<TTaskReturnWithCategory>> {

        const { user } = res.locals

        const response = await this.taskService.getTaskById(Number(req.params.id), user.id );

        return res.status(200).json(response)

    }

    async getAllTasks(req: Request, res: Response): Promise<Response<TTaskReturnWithCategory[]>> {
        console.log("Fetching all tasks");
        const { user } = res.locals

        const category = req.query.category as string;

        if (category) {
            const response = await this.taskService.getTasksByCategory(category, user.id);
            return res.status(200).json(response)
        }

        const response = await this.taskService.getAllTasks(user.id);
        
        return res.status(200).json(response);
    }

    async updateTask(req: Request, res: Response): Promise<Response<TTaskReturn>> {
        const { user } = res.locals

        const response = await this.taskService.updateTask(Number(req.params.id), req.body, user.id);

        return res.status(200).json(response)
    }
}
