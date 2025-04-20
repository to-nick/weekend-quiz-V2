import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { LeaguesService } from './leagues.service';
import { CombinedData } from './leagues.service';
import { CreateLeagueDto } from './dto/create-league/create-league.decorator';
import { JoinLeagueDto } from './dto/join-league/join-league.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
@Controller('leagues')
@UseGuards(JwtAuthGuard)
export class LeaguesController {
    constructor(private readonly leaguesService: LeaguesService) {}

    @Get('display-leagues/:userId')
    async displayLeagues(@Param('userId') userId: number): Promise<CombinedData[]> {
        const result = await this.leaguesService.displayLeagues(userId);
        return result;
    }

    @Post('create-league')
    async createLeague(@Body() createLeagueDto: CreateLeagueDto){
        const result = await this.leaguesService.createLeague(createLeagueDto);
        return result;
    }

    @Post('join-league')
    async joinLeague(@Body() joinLeagueDto: JoinLeagueDto){
        const result = await this.leaguesService.joinLeague(joinLeagueDto);
        return result;
    }

    @Delete('leave-league')
    async leaveLeague(@Query('userId') userId: number, @Query('leagueId') leagueId: number){
        const result = await this.leaguesService.leaveLeague(userId, leagueId);
        return result;
    }
}