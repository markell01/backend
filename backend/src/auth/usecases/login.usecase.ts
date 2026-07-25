import { Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "../dto/auth.dto";
import { PrismaService } from "../../utils/prisma.service";
import * as bcrypt from "bcrypt";
import { CustomLogger } from "../../config/config.logger";

@Injectable()
export class LoginUsecase {
    private readonly logger = new CustomLogger(LoginUsecase.name);
    constructor(private readonly prisma: PrismaService) {}

    async login(userData: LoginDto) {
        this.logger.log(`Trying to log in user: ${userData.username}`);
        const user = await this.prisma.user.findUnique({
            where: {
                username: userData.username
            }
        });

        if (!user) {
            this.logger.error(`User ${userData.username} hasnt been found`);
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!await bcrypt.compare(userData.password, user.password)) {
            this.logger.error('Wrong password');
            throw new UnauthorizedException('Invalid credentials');
        }

        this.logger.log(`User is logged in`);
        return {
            id: user.id,
            username: user.username
        }
    }
}