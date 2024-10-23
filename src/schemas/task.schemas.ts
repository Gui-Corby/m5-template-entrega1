import { z } from "zod";

export const taskSchema = z.object({
    id: z.number(),
    title: z.string().min(1),
    content: z.string().min(1),
    finished: z.boolean(),
    categoryId: z.number()
})

export const createTaskBodySchema = taskSchema.omit({ id: true, finished: true,}).extend({
    categoryId: z.number().optional(),
});

export const updateTaskBodySchema = taskSchema.pick({
    title: true,
    content: true, 
    finished: true,
    categoryId: true
}).partial();

export type TCreateTaskSchema = z.infer<typeof createTaskBodySchema>

export type TTaskReturn = z.infer<typeof taskSchema>

export type TUpdateTaskSchema = z.infer<typeof updateTaskBodySchema>

