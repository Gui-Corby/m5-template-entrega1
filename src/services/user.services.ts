import jwt, { TokenExpiredError } from "jsonwebtoken";
import { prisma } from "../database/prisma";
import { injectable } from "tsyringe";
import bcrypt from "bcrypt";
import { TCreateUserSchema, TLoginUserSchema, TUserReturn, TUserReturnAll, returnUserBodySchema } from "../schemas/user.schema";
import { AppError } from "../errors/appError";
import { Response, Request } from "express";
import { User } from "@prisma/client";

interface CustomResponse extends Response {
    locals: {
        user?: User | { id: number }
    }
};

@injectable()
export class UserServices {

    async createUser(body: TCreateUserSchema): Promise<TUserReturn> {
        const userAlreadyCreated = await prisma.user.findFirst(
            {
                where: { email: body.email }
            }
        )

        if (userAlreadyCreated) {
            throw new AppError("This email is already registered", 409);
        }

        // hash the password before storing
        const hashedPassword = await bcrypt.hash(body.password, 10);

        const newUser = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword,
            }
        });

        return returnUserBodySchema.parse(newUser)
    }

    async login(body: TLoginUserSchema): Promise<{ accessToken: string; user: TUserReturn }> {


        const user = await prisma.user.findFirst(
            {
                where: { email: body.email }
            }
        ) as TUserReturnAll

        if (!user) {
            throw new AppError("User not exists", 404)
        }

        // Compare provided password with stored hashed password
        const isPasswordValid = await bcrypt.compare(body.password, user?.password);
        if (!isPasswordValid) {
            throw new AppError("Email and password doesn't match", 401);
        }

        // Generate JWT token with user ID
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: "24h" });

        return {
            accessToken: token, user: returnUserBodySchema.parse(user)

        }
    }

    async autoLogin(decodedUser: { id: number }): Promise<TUserReturn> {

        const user = await prisma.user.findUnique({
            where: { id: decodedUser.id },
            select: {
                id: true,
                name: true,
                email: true,
            }
        }) 

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return returnUserBodySchema.parse(user)
        
    }

}

