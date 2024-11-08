import { injectable } from "tsyringe";
import { prisma } from "../database/prisma";
import { TCreateTaskSchema, TTaskReturn, TUpdateTaskSchema, updateTaskBodySchema, taskSchema, createTaskBodySchema } from "../schemas/task.schemas";
import { AppError } from "../errors/appError";
import { TCategoryReturn, TCreateCategorySchema, TTaskReturnWithCategory, categorySchema, createCategoryBodySchema, taskWithCategorySchema } from "../schemas/category.schema";


@injectable()
export class TaskServices {
    async createTask(body: Omit<TCreateTaskSchema, "userId">, userId: number): Promise<TTaskReturn> {

            const validateBodyTask = createTaskBodySchema.parse(body);

            if (body.categoryId !== undefined && body.categoryId !== null) {
                const category = await prisma.category.findUnique({ where: { id: body.categoryId } })

                if (!category) {
                    throw new AppError("Category not found", 404);
                }
            }

            const newTask = await prisma.task.create({
                data: {
                    userId,
                    title: validateBodyTask.title,
                    content: validateBodyTask.content,
                    categoryId: validateBodyTask.categoryId || null,
                    finished: false
                }
            })

            return taskSchema.parse(newTask)

    }

    async deleteTask(taskId: number) {

        const taskToDelete = await prisma.task.findUnique({
            where:
                { id: taskId }
        });


        if (!taskToDelete) {
            throw new AppError("Task not found", 404);
        }

        await prisma.task.delete({ where: { id: taskId } })

    }

    async createCategory(body: Omit<TCreateCategorySchema, "userId">, userId: number): Promise<TCategoryReturn> {


            const validateBodyCategory = createCategoryBodySchema.parse(body)

            const existingCategory = await prisma.category.findFirst({
                where: {
                    name: validateBodyCategory.name,
                    userId: userId,
                }
            })

            if (existingCategory) {

                throw new AppError("Category with this name already exists", 409);
            }

            const newCategory = await prisma.category.create({
                data: {
                    userId,
                    name: validateBodyCategory.name,

                }
            });

            console.log("Category created successfully:", newCategory);

            return categorySchema.parse(newCategory)
    }
    

    async deleteCategory(categoryId: number, userId: number) {
        const categoryToDelete = await prisma.category.findFirst({ where: { id: categoryId } });

        // if (!categoryToDelete || categoryToDelete.userId !== userId) {
        //     throw new AppError(
        //         !categoryToDelete ? "Category not found" : "This user is not the category owner",
        //         !categoryToDelete ? 404 : 403
        //     )
        // }
        if (!categoryToDelete) {
            throw new AppError("Category Not found", 404);
        }


        await prisma.category.delete({ where: { id: categoryId } });
    }

    async getTaskById(taskId: number, userId: number): Promise<TTaskReturnWithCategory> {

        const taskWithCategory = await prisma.task.findUnique({
            where: { id: taskId },
            include: { category: true },
        });

        // if (!taskWithCategory || taskWithCategory.userId !== userId) {
        //     throw new AppError(
        //         !taskWithCategory ? "Task not found" : "This user is not the task owner",
        //         !taskWithCategory ? 404 : 403
        //     )
        // }

        if (!taskWithCategory) {
            throw new AppError("Task Not found", 404);
        }

        const { categoryId, ...taskWithoutCategoryId } = taskWithCategory;

        return taskWithCategorySchema.parse(taskWithoutCategoryId);
    }

    async getTasksByCategory(categoryName: string, userId: number): Promise<TTaskReturnWithCategory[]> {

        const taskWithCategory = await prisma.task.findMany({
            where: { category: { name: categoryName }, userId },
            include: { category: true },
        })

        const tasksWithoutCategoryId = taskWithCategory.map(task => {
            const { categoryId, ...taskWithoutCategoryId } = task;
            return taskWithoutCategoryId;
        })

        return tasksWithoutCategoryId.map(task => taskWithCategorySchema.parse(task));

    }

    async getAllTasks(userId: number): Promise<TTaskReturnWithCategory[]> {
        const tasksWithCategory = await prisma.task.findMany({
            where: { userId },
            include: {
                category: true
            }
        });

        const tasksWithoutCategoryId = tasksWithCategory.map(task => {
            const { categoryId, ...taskWithoutCategoryId } = task;
            return taskWithoutCategoryId;
        })

        return tasksWithoutCategoryId.map(task => taskWithCategorySchema.parse(task))
    }

    async updateTask(taskId: number, body: TUpdateTaskSchema, userId: number): Promise<TTaskReturn> {

        const taskToUpdate = await prisma.task.findFirst({
            where: { id: taskId }

        })

        // if (!taskToUpdate || taskToUpdate?.userId !== userId) {
        //     throw new AppError(
        //         !taskToUpdate ? "Task not found" : "This user is not the task owner",
        //         !taskToUpdate ? 404 : 403
        //     )

        // }
        if (!taskToUpdate) {
            throw new AppError("Task Not found", 404);
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
