import { Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "../dto/auth.dto";
import { PrismaService } from "src/utils/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class LoginUsecase {
    constructor(private readonly prisma: PrismaService) {}

    async login(userData: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                username: userData.username
            }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!await bcrypt.compare(userData.password, user.password)) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return {
            id: user.id,
            username: user.username
        }
    }
}