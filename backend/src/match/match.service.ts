import { BadRequestException, Injectable } from "@nestjs/common";
import { readFile } from "fs/promises";
import { join } from "path";
import { MatchDto, SaveResultDto } from "./dto/match.dto";
import { PrismaService } from "../utils/prisma.service";
import { CustomLogger } from "../config/config.logger";

@Injectable()
export class MatchService {
    private readonly logger = new CustomLogger(MatchService.name);
    constructor(private readonly prisma: PrismaService) {}
   
    private async textGenerator() {
        const filePath = join(process.cwd(), 'public', 'text.txt');

        const text = (await readFile(filePath, 'utf8'))
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

        const words: string[] = [];
        const wordLimit = this.getWordLimit();
        
        while (words.length < wordLimit) {
            words.push(text[this.getRandomInt(text.length)]);
        }

        return words.join(' ');
    }

    private getWordLimit() {
        const limit = Number(process.env.WORD_LIMIT);

        if (!Number.isFinite(limit) || limit <= 0) {
            return 300;
        }

        return limit;
    }

    private getRandomInt(length: number) {
        return Math.floor(Math.random() * length)
    }

    async createMatch(data: MatchDto) {
        this.logger.log(`Generating text...`);
        const text = await this.textGenerator();
        this.logger.log(`Creating match for user: ${data.userId}...`);
        const match = await this.prisma.match.create({ data });
        this.logger.log(`Match has been created`);
        return {
            match,
            text
        }
    }

    async saveResult(data: SaveResultDto, id: string) {
        this.logger.log(`Saving result of the match: ${id} with data: ${JSON.stringify(data)}`);
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
        
        this.logger.log('Match has been saved');
        return saveResult;
    }

    async updateMatchData(matchId: string) {
        this.logger.log(`Updating match ${matchId}`)
        const result = await this.prisma.match.update({
            where: { id: matchId },
            data: { status: 'ACTIVE' }
        });

        if (!result) {
            this.logger.error('Invalid match id');
            throw new BadRequestException();
        }
        this.logger.log(`Match ${matchId} has been updated with status: ${result.status}`);
        return true;
    }

    async getBestUsers() {
        this.logger.log(`Getting best users`);
        return this.prisma.userResult.findMany({
            orderBy: [
                { wpm: 'desc' },
                { accuracy: 'desc' },
                { cpm: 'desc' },
            ],
            take: 10,
            include: {
                user: {
                    select: {
                        username: true,
                    },
                },
            },
        });
    }

    async userMatchHostory(userId: string) {
        return this.prisma.match.findMany({
            where: { 
                userId,
                status: 'FINISHED'
            },
            orderBy: [
                { updateAt: 'desc' }
            ]
        })
    }
}
