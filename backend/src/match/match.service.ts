import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MatchDto, SaveResultDto } from './dto/match.dto';
import { PrismaService } from '../config/prisma.service';
import { CustomLogger } from '../config/config.logger';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { TextGeneratorService } from '../textGenerator/textGenerator.service';

@Injectable()
export class MatchService {
  private readonly logger = new CustomLogger(MatchService.name);
  constructor(
    private readonly textGeneratorService: TextGeneratorService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async createMatch(data: MatchDto) {
    this.logger.log(`Generating text...`);
    const text = await this.textGeneratorService.textGenerator();
    this.logger.log(`Creating match for user: ${data.userId}...`);
    const match = await this.prisma.match.create({ data });
    this.logger.log(`Match has been created`);
    return {
      match,
      text,
    };
  }

  async saveResult(data: SaveResultDto, id: string) {
    this.logger.log(
      `Saving result of the match: ${id} with data: ${JSON.stringify(data)}`,
    );
    const saveResult = await this.prisma.$transaction(async (tx) => {
      const result = await tx.userResult.create({ data });

      return tx.match.update({
        where: { id },
        data: {
          status: 'FINISHED',
          resultId: result.id,
        },
      });
    });
    await this.cacheManager.del('leaderboard:top10');
    this.logger.log('Match has been saved');
    return saveResult;
  }

  async updateMatchData(matchId: string) {
    this.logger.log(`Updating match ${matchId}`);
    const result = await this.prisma.match.update({
      where: { id: matchId },
      data: { status: 'ACTIVE' },
    });

    if (!result) {
      this.logger.error('Invalid match id');
      throw new BadRequestException();
    }
    this.logger.log(
      `Match ${matchId} has been updated with status: ${result.status}`,
    );
    return true;
  }

  async getBestUsers() {
    this.logger.log(`Getting best users`);
    const cache = await this.cacheManager.get('leaderboard:top10');
    console.log(cache);

    if (cache) {
      this.logger.log(`Returning data from cache: ${JSON.stringify(cache)}`);
      return cache;
    }

    const leaderboard = await this.prisma.userResult.findMany({
      orderBy: [{ wpm: 'desc' }, { accuracy: 'desc' }, { cpm: 'desc' }],
      take: 10,
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    await this.cacheManager.set('leaderboard:top10', leaderboard, 60000);

    const checkCache = await this.cacheManager.get('leaderboard:top10');
    this.logger.log(`Cache after set: ${JSON.stringify(checkCache)}`);

    this.logger.log(`Returning data from db: ${JSON.stringify(leaderboard)}`);
    return leaderboard;
  }

  async userMatchHostory(userId: string) {
    return this.prisma.match.findMany({
      where: {
        userId,
        status: 'FINISHED',
      },
      orderBy: [{ updateAt: 'desc' }],
    });
  }
}
