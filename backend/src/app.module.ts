import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { ConfigModule } from '@nestjs/config';
import { usecases } from './auth/usecases';
import { PrismaService } from './utils/prisma.service';
import { SessionAuthGuard } from './auth/guards/session-auth.guards';


@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
  controllers: [AuthController],
  providers: [...usecases, PrismaService, SessionAuthGuard],
})
export class AppModule {}
