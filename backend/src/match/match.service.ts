import { BadRequestException, Injectable } from "@nestjs/common";
import { readFile } from "fs/promises";
import { join } from "path";
import { MATCH_UPDATE_STATUSES, MatchDto, MatchUpdateDto, SaveResultDto } from "./dto/match.dto";
import { PrismaService } from "../utils/prisma.service";

@Injectable()
export class MatchService {
    constructor(private readonly prisma: PrismaService) {}
   
    async textGenerator() {
        const filePath = join(process.cwd(), 'public', 'text.txt');

        const text = (await readFile(filePath, 'utf8'))
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

        const words: string[] = [];
        
        while (words.length < 1000) {
            words.push(text[this.getRandomInt(text.length)]);
        }

        return { text: words.join(' ') };
    }

    private getRandomInt(length: number) {
        return Math.floor(Math.random() * length)
    }

    async createMatch(data: MatchDto) {
        return await this.prisma.match.create({ data })
    }

    async saveResult(data: SaveResultDto, id: string) {
        return await this.prisma.$transaction(async (tx) => {
            const result = await tx.userResult.create({ data });

            return tx.match.update({
                where: { id },
                data: {
                    status: 'FINISHED',
                    resultId: result.id,
                },
            });
        });
    }

    async updateMatchData(data: MatchUpdateDto, matchId: string) {
        if (!MATCH_UPDATE_STATUSES.includes(data.status)) {
            throw new BadRequestException('Invalid match status');
        }

        const result = await this.prisma.match.update({
            where: {
                id: matchId
            },
            data: {
                status: data.status
            }
        })

        if (!result) {
            throw new BadRequestException();
        }

        return true;
    }
}
