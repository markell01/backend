import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { ConfigModule } from '@nestjs/config';
import { usecases } from './auth/usecases';
import { PrismaService } from './utils/prisma.service';
import { SessionAuthGuard } from './common/guards/session-auth.guards';
import { MatchController } from './match/match.controller';
import { MatchService } from './match/match.service';
import { CustomLogger } from './config/config.logger';


@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
  controllers: [AuthController, MatchController],
  providers: [...usecases, PrismaService, SessionAuthGuard, MatchService, CustomLogger],
})
export class AppModule {}
