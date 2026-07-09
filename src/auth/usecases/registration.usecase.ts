import { ConflictException, Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { PrismaService } from "src/utils/prisma.service";
import { RegisterDto } from "../dto/auth.dto";

@Injectable()
export class RegistrationUsecase {
    constructor(private prisma: PrismaService) {}

    async createUser(userData: RegisterDto) {
        if (await this.checkUserExist(userData.username)) {
            throw new ConflictException('Username is already taken');
        }

        const hash = await bcrypt.hash(userData.password, 10);

        await this.prisma.user.create({
            data: {
                username: userData.username,
                password: hash
            }
        })

        return true;
    }

    async checkUserExist(username: string) {
        const check = await this.prisma.user.findUnique({
            where: { username }
        })

        if (check) return true
        else return false
    }
}