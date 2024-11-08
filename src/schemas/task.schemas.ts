import { z } from "zod";

export const taskSchema = z.object({
    id: z.number(),
    userId: z.number(),
    title: z.string().min(1),
    content: z.string().min(1),
    finished: z.boolean(),
    categoryId: z.number().nullable().optional()
})

export const createTaskBodySchema = taskSchema.omit({ id: true, finished: true, userId: true})

export const updateTaskBodySchema = taskSchema.pick({
    title: true,
    content: true, 
    finished: true,
    categoryId: true
}).partial();

export type TCreateTaskSchema = z.infer<typeof createTaskBodySchema>

export type TTaskReturn = z.infer<typeof taskSchema>
// export type TTaskReturn = z.infer<typeof createTaskBodySchema>

export type TUpdateTaskSchema = z.infer<typeof updateTaskBodySchema>

