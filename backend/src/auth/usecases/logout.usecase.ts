import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { CustomLogger } from "../../config/config.logger";

@Injectable()
export class LogoutUsecase {
    private readonly logger = new CustomLogger(LogoutUsecase.name);
    async logout(req: Request) {
        this.logger.log('Deleting user session...')
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