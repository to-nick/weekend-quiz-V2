import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { ViewScoresDto } from './dto/view-scores.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('scores')
@UseGuards(JwtAuthGuard)
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Get('display-scores/:leagueId')
  displayScores(@Param() viewScoresDto: ViewScoresDto) {
    return this.scoresService.viewScores(viewScoresDto);
  }
}