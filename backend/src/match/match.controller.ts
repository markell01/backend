import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { MatchService } from "./match.service";
import { MatchDto, MatchUpdateDto, SaveResultDto } from "./dto/match.dto";
import { SessionAuthGuard } from "../auth/guards/session-auth.guards";

@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) {}

    @Get('text')
    async getText() {
        try {
            const data = await this.matchService.textGenerator();
            return data;
        } catch (err) {
            throw err;
        }
    }

    @Post('create')
    async createMatch(@Body() body: MatchDto) {
        try {
            const match = await this.matchService.createMatch(body);
            return match;
        } catch (err) {
            throw err;
        }
    }

    @Patch(':id/update')
    async updateData(
        @Param('id') id: string,
        @Body() body: MatchUpdateDto
    ) {
        try {
            return await this.matchService.updateMatchData(body, id);
        } catch (err) {
            throw err;
        }
    }

    @Patch(':id/finish')
    async finish(
        @Param('id') id: string,
        @Body() body: SaveResultDto
    ) {
        try {
            return await this.matchService.saveResult(body, id);
        } catch (err) {
            throw err;
        }
    }
}
