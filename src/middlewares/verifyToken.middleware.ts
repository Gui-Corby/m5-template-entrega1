import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError";
import jwt from "jsonwebtoken";

export class verifyToken {
    static execute(req: Request, res: Response, next: NextFunction) {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("Token is required", 401)
        }

        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET as string;

        try {
            const decoded = jwt.verify(token, secret);
            res.locals.user = decoded;
            next();
        } catch (error) {
            throw new AppError("Invalid or expired token", 401)
        }
    }
}
