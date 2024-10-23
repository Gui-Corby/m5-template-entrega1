import { z } from "zod";


export const categorySchema = z.object({
    id: z.number(),
    name: z.string().min(1),
});

export const taskWithCategorySchema = z.object({
    id: z.number(),
    title: z.string().min(1),
    content: z.string().min(1),
    finished: z.boolean(),
    category: categorySchema.nullable(),
})

export const createCategoryBodySchema = categorySchema.omit({ id: true });

export type TCreateCategorySchema = z.infer<typeof createCategoryBodySchema>

export type TCategoryReturn = z.infer<typeof categorySchema>

export type TTaskReturnWithCategory = z.infer<typeof taskWithCategorySchema>

