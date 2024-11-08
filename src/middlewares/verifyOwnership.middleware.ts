import { NextFunction, Request, Response } from "express"
import { AppError } from "../errors/appError";
import { prisma } from "../database/prisma";

export const verifyOwnership = (resourceType: "task" |  "category") => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { user } = res.locals;
        const resourceId = parseInt(req.params.id, 10);

        if  (!resourceId) {
            return next(new AppError("Invalid resource ID", 400));
        }

        let resource;
        if (resourceType === "task") {
            resource = await prisma.task.findUnique({ where: { id: resourceId }});
        } else if (resourceType === "category") {
            resource = await prisma.category.findUnique({ where: { id: resourceId } });
        }

        if (!resource) {
            return next(new AppError(`${resourceType} not found`, 404))
        }

        if (resource.userId !== user.id) {
            return next(new AppError(`This user is not the ${resourceType} owner`, 403))
        }

        next();
    }
}