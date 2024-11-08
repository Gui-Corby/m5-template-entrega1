
import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/appError";
import { ZodError } from "zod";
import { JsonWebTokenError } from "jsonwebtoken";

export class HandleErrors {
    static execute(error: Error, req: Request, res: Response, next: NextFunction) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });

        }


        if (error instanceof ZodError)  {
            const isTypeMismatchError = error.issues.some(issue =>
                issue.code === "invalid_type"
            )
             
            if (isTypeMismatchError) {
                return res.status(400).json({
                    errors: error.issues.map(issue => ({
                        path: issue.path,
                        message: issue.message
                    }))
                })
            }

            return res.status(400).json({
                errors: error.issues
            })
        }

        if (error instanceof JsonWebTokenError) {
            return res.status(401).json({ message: "Token is required" })
        }

        console.log(error)
        return res.status(500).json({ message: "Internal server error" });
    }
}