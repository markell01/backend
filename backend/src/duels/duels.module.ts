import { Module } from '@nestjs/common';
import { DuelsWebsocketGateway } from './duels.gateway';
import { TextGeneratorModule } from '../textGenerator/textGenerator.module';
import DuelsService from './duels.service';
import { PrismaService } from '../config/prisma.service';

@Module({
  imports: [TextGeneratorModule],
  providers: [DuelsWebsocketGateway, DuelsService, PrismaService],
})
export class DuelsModule {}
