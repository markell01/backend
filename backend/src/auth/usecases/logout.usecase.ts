import { Injectable } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class LogoutUsecase {
    async logout(req: Request) {
        await new Promise<void>((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    }
}