import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { ConfigModule } from '@nestjs/config';
import { usecases } from './auth/usecases';
import { PrismaService } from './utils/prisma.service';
import { SessionAuthGuard } from './auth/guards/session-auth.guards';
import { MatchController } from './match/match.controller';
import { MatchService } from './match/match.service';


@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
  controllers: [AuthController, MatchController],
  providers: [...usecases, PrismaService, SessionAuthGuard, MatchService],
})
export class AppModule {}
