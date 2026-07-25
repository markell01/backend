import { ConflictException, Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { PrismaService } from "../../utils/prisma.service";
import { RegisterDto } from "../dto/auth.dto";
import { CustomLogger } from "../../config/config.logger";

@Injectable()
export class RegistrationUsecase {
    private readonly logger = new CustomLogger(RegistrationUsecase.name)
    constructor(
        private prisma: PrismaService,
    ) {}

    async createUser(userData: RegisterDto) {
        this.logger.log(`Creating user ${userData.username}`)
        if (await this.checkUserExist(userData.username)) {
            this.logger.error(`${userData.username} is already taken`);
            throw new ConflictException('Username is already taken');
        }

        const hash = await bcrypt.hash(userData.password, 10);

        const user = await this.prisma.user.create({
            data: {
                username: userData.username,
                password: hash
            }
        });

        this.logger.log(`User ${user.username} has been created`);
        return true;
    }

    async checkUserExist(username: string) {
        const check = await this.prisma.user.findUnique({
            where: { username }
        });

        if (check) return true;
        else return false;
    }
}