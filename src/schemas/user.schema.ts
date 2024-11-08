import { z } from "zod";

export const userSchema = z.object({
    id: z.number(),
    name: z.string().min(1),
    email: z.string().min(1),
    password: z.string().min(1),
});

export const returnUserBodySchema = userSchema.pick({
    id: true,
    name: true,
    email: true,
})

export const loginUserBodySchema = userSchema.pick({
    email: true,
    password: true
})


export const createUserBodySchema = userSchema.omit({ id: true });

export type TLoginUserSchema = z.infer<typeof loginUserBodySchema>

export type TCreateUserSchema = z.infer<typeof createUserBodySchema>

export type TUserReturn = z.infer<typeof returnUserBodySchema>

export type TUserReturnAll = z.infer<typeof userSchema>
