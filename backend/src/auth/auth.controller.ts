import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { RegistrationUsecase } from './usecases/registration.usecase';
import { LoginUsecase } from './usecases/login.usecase';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import type { Request, Response } from 'express';
import { LogoutUsecase } from './usecases/logout.usecase';
import { PrismaService } from '../config/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUsecase: RegistrationUsecase,
    private readonly loginUsecase: LoginUsecase,
    private readonly logoutUsecase: LogoutUsecase,
    private readonly prisma: PrismaService,
  ) {}

  @Post('registration')
  async registerUser(@Body() userData: RegisterDto) {
    if (await this.registerUsecase.createUser(userData)) {
      return {
        message: 'User has been created',
        statusCode: 201,
      };
    }
  }

  @Post('login')
  async loginUser(@Body() userData: LoginDto, @Req() request: Request) {
    const user = await this.loginUsecase.login(userData);

    request.session.userId = user.id;
    request.session.username = user.username;

    return {
      message: 'Success',
      statusCode: 200,
      user,
    };
  }

  @Post('logout')
  async logoutUser(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.logoutUsecase.logout(request);

    response.clearCookie('sid');

    return {
      message: 'Logged out',
      statusCode: 200,
    };
  }

  @Get('me')
  async me(@Req() req: Request) {
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
      user,
    };
  }
}
