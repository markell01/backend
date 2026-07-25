import { Body, Controller, Get, Logger, Param, Patch, Post } from "@nestjs/common";
import { MatchService } from "./match.service";
import { MatchDto, SaveResultDto } from "./dto/match.dto";

@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) {}

    @Post('create')
    async createMatch(@Body() data: MatchDto) {
        return await this.matchService.createMatch(data);
    }

    @Patch(':id/start')
    async updateData(@Param('id') id: string) {
        return await this.matchService.updateMatchData(id);
    }

    @Patch(':id/finish')
    async finish(@Param('id') id: string, @Body() body: SaveResultDto) {
        return await this.matchService.saveResult(body, id);
    }

    @Get('leaderboard')
    async getUsers() {
        return { goats: await this.matchService.getBestUsers() }
    }

    @Get('user_history/:id')
    async matchHistory(@Param('id') id: string) {
        return this.matchService.userMatchHostory(id);
    }
}