import { injectable } from "tsyringe";
import { prisma } from "../database/prisma";
import { TCreateTaskSchema, TTaskReturn, TUpdateTaskSchema, updateTaskBodySchema, taskSchema } from "../schemas/task.schemas";
import { AppError } from "../errors/appError";
import { TCategoryReturn, TCreateCategorySchema, TTaskReturnWithCategory, categorySchema, createCategoryBodySchema, taskWithCategorySchema } from "../schemas/category.schema";
import { ZodError } from "zod";

@injectable()
export class TaskServices {
    async createTask(body: TCreateTaskSchema): Promise<TTaskReturn> {
    
        if (body.categoryId) {
            const category = await prisma.category.findUnique({ where: { id: body.categoryId } })

            if (!category) {
                throw new AppError("Category not found", 404);
            }
        }
        const newTask = await prisma.task.create({
            data: {
                title: body.title,
                content: body.content,
                categoryId: body.categoryId || null,
                finished: false,
            }
        })

        return taskSchema.parse(newTask)
    }

    async deleteTask(taskId: number) {

        const taskToDelete = await prisma.task.findFirst({ where: { id: taskId } });

        if (!taskToDelete) {
            throw new AppError("Task not found", 404);
        }

        await prisma.task.delete({ where: { id: taskId } })
    }

    async createCategory(body: TCreateCategorySchema): Promise<TCategoryReturn> {
       
        try {
            const validateCategory = createCategoryBodySchema.parse(body)

            const newCategory = await prisma.category.create({
                data: validateCategory,
            });
            // console.log("Category created in database:", newCategory);

            return categorySchema.parse(newCategory)

        } catch (error) {
            if (error instanceof ZodError) {
                throw new AppError(`Message:${error.errors.map(e => e.message).join(", ")}`, 400)
            }

            throw error;
        }
    }

    async deleteCategory(categoryId: number) {
        const categoryToDelete = await prisma.category.findFirst({ where: { id: categoryId } });

        if (!categoryToDelete) {
            throw new AppError("Category not found", 404);
        }

        await prisma.category.delete({ where: { id: categoryId } });
    }

    async getTaskById(taskId: number): Promise<TTaskReturnWithCategory> {

        const taskWithCategory = await prisma.task.findUnique({
            where: { id: taskId },
            include: { category: true },
        });

        if (!taskWithCategory) {
            throw new AppError("Task not found", 404);
        }

        const { categoryId, ...taskWithoutCategoryId } = taskWithCategory;

        return taskWithCategorySchema.parse(taskWithoutCategoryId);
    }

    async getTasksByCategory(categoryName: string): Promise<TTaskReturnWithCategory[]> {

        const taskWithCategory = await prisma.task.findMany({
            where: { category: { name: categoryName} },
            include: { category: true },
        })

        const tasksWithoutCategoryId = taskWithCategory.map(task => {
            const { categoryId, ...taskWithoutCategoryId } = task;
            return taskWithoutCategoryId;
        })

        return tasksWithoutCategoryId.map(task => taskWithCategorySchema.parse(task));

    }

    async getAllTasks(): Promise<TTaskReturnWithCategory[]> {
        const tasksWithCategory = await prisma.task.findMany({
            include: {
                category: true
            }
        });

        const tasksWithoutCategoryId = tasksWithCategory.map(task => {
            const {categoryId, ...taskWithoutCategoryId} = task;
            return taskWithoutCategoryId;
        })

        return tasksWithoutCategoryId.map(task => taskWithCategorySchema.parse(task))
    }

    async updateTask(taskId: number, body: TUpdateTaskSchema): Promise<TTaskReturn> {

        const taskToUpdate = await prisma.task.findFirst({
            where: { id: taskId }

        })


        if (!taskToUpdate) {
            throw new AppError("Task not found", 404)
        }

        if (body.categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: body.categoryId },
            });

            if (!category) {
                throw new AppError("Category not found", 404)
            }
        }


        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                ...body,
            }
        })


        return taskSchema.parse(updatedTask);
    }


}
