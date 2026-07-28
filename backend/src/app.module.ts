import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { ConfigModule } from '@nestjs/config';
import { usecases } from './auth/usecases';
import { PrismaService } from './config/prisma.service';
import { SessionAuthGuard } from './common/guards/session-auth.guards';
import { MatchController } from './match/match.controller';
import { MatchService } from './match/match.service';
import { CustomLogger } from './config/config.logger';
import { createKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { TextGeneratorService } from './textGenerator/textGenerator.service';
import { DuelsModule } from './duels/duels.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      useFactory: async () => ({
        stores: [
          createKeyv(process.env.REDIS_URL, {
            throwOnConnectError: true,
            throwOnErrors: true,
          })
        ],
        ttl: 60 * 1000,
      }),
    }),
    DuelsModule
  ],
  controllers: [AuthController, MatchController],
  providers: [
    ...usecases,
    PrismaService,
    SessionAuthGuard,
    MatchService,
    CustomLogger,
    TextGeneratorService
  ],
})
export class AppModule {}
