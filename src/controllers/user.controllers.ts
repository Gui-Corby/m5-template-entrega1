import { Request, Response, response } from "express";
import { UserServices } from "../services/user.services";
import { inject, injectable } from "tsyringe";
import { TUserReturn } from "../schemas/user.schema";

@injectable()
export class UserControllers {
    constructor(@inject("UserServices") private userService: UserServices) {}

    async createUser(req: Request, res: Response): Promise<Response<TUserReturn>> {

        const response = await this.userService.createUser(req.body);

        return res.status(201).json(response);
    }

    async login(req: Request, res: Response): Promise<Response<TUserReturn>> {
        
        const response = await this.userService.login(req.body)

        return res.status(200).json(response);
    }

   async autoLogin(req: Request, res: Response): Promise<Response<TUserReturn>> {
    const decodedUser = res.locals.user 

    const response = await this.userService.autoLogin(decodedUser);

    return res.status(200).json(response);
   }
}