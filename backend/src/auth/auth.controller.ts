import { Body, ConflictException, Controller, Get, Post, Req, Res, Session, UnauthorizedException, UseGuards } from '@nestjs/common';
import { RegistrationUsecase } from './usecases/registration.usecase';
import { LoginUsecase } from './usecases/login.usecase';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import type { Request, Response } from 'express';
import { LogoutUsecase } from './usecases/logout.usecase';
import { SessionAuthGuard } from './guards/session-auth.guards';
import { PrismaService } from '../utils/prisma.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerUsecase: RegistrationUsecase,
        private readonly loginUsecase: LoginUsecase,
        private readonly logoutUsecase: LogoutUsecase,
        private readonly prisma: PrismaService
    ) {}

    @Post('registration')
    async registerUser(@Body() userData: RegisterDto) {
        try {
            if(await this.registerUsecase.createUser(userData)) {
                return {
                    message: 'User has been created',
                    statusCode: 201
                }
            }
        } catch(err) {
            if (err instanceof ConflictException) {
                throw err;
            }
            throw err;
        }
    }

    @Post('login')
    async loginUser(@Body() userData: LoginDto, @Req() request: Request) {
        try {
            const user = await this.loginUsecase.login(userData);

            request.session.userId = user.id;
            request.session.username = user.username;

            return {
                message: 'Success',
                statusCode: 200,
                user
            };
        } catch (err) {
            if (err instanceof UnauthorizedException) {
                throw err;
            }
            throw err;
        }
    }

    @Post('logout')
    async logoutUser(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ) {
        try {
            await this.logoutUsecase.logout(request);

            response.clearCookie('sid');

            return {
                message: 'Logged out',
                statusCode: 200
            };
        } catch (err) {
            throw err;
        }
    }

    @Get('me')
    async me(@Req() req: Request) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: req.session.userId },
                select: {
                    id: true,
                    username: true,
                    CreatedAt: true,
                },
            });

            return {
                message: 'Success',
                statusCode: 200,
                user
            };
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
