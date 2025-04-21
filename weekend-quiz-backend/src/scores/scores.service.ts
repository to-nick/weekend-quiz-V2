import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ViewScoresDto } from './dto/view-scores.dto';
import { KnexService } from '../database/knex/knex.service';
import { Knex as KnexType } from 'knex';

@Injectable()
export class ScoresService {
  private knex: KnexType;
  constructor(private knexService: KnexService) {
    this.knex = this.knexService.getKnexInstance();
  }

  //GET route for retreiving weekly and total user scores on the leaderboard page
  async viewScores(viewScoresDto: ViewScoresDto) {
    const {leagueId, currentWeek} = viewScoresDto;


    try{
      //Finding all user ID's of users within the requested league
      const leagueParticipants: {user_id: number}[] = await this.knex('user_leagues')
        .select('user_id')
        .where('league_id', leagueId);

      //Mapping user ID's to get data on all of them
      const userIds: number[] = leagueParticipants.map((participant) => participant.user_id); 

      ////Handling edge case - No users in the rquested league
      if(userIds.length === 0){
        throw new NotFoundException('No participants found in this league');
      }

      /*Query to find the amount of weekly wins each user has had within their league. The weekly winner is the user who had the most
          correct answers of any user for that week*/
      const weeklyWinsTally = await this.knex('submission')
        .select('player_name', 'user_id')
        .count('* as weekly_wins')
        .whereIn('week', function(){
          this.select('week')
              .from('submission')
              .whereIn('user_id', userIds)
              .groupBy('week')
              .havingRaw('Max(score) = score')
            })
            .groupBy('user_id', 'player_name')
            .orderBy('weekly_wins', 'desc') as {player_name: string, user_id: number, weekly_wins: number}[];

      /*Query to find the total score of all users within the selected league. 
        Total scores are the cumulative scores of a user across the whole year*/
      const totalScores = await this.knex('submission')
        .select('player_name', 'user_id')
        .sum('score as total_score')
        .whereIn('user_id', userIds)
        .groupBy('user_id', 'player_name')
        .orderBy('total_score', 'desc') as {player_name: string, user_id: number, total_score: number}[];

      const currentWeekScore = await this.knex('submission')
        .select('user_id', 'score')
        .whereIn("user_id", userIds)
        .andWhere("week", currentWeek) as { user_id: number, score: number}[];
      
      console.log("CurrentWeekScore:", currentWeekScore)

      //Combining the total scores and weekly winner tally's into one object
      const combinedScores: {player_name: string, user_id: number, total_score: number, weeklyWins: number}[] = totalScores.map((score) => {
        const weeklyWinsEntry = weeklyWinsTally.find((entry) => entry.user_id === score.user_id);
        return {
          ...score,
          weeklyWins: weeklyWinsEntry ? weeklyWinsEntry.weekly_wins : 0,
        };
      });

      console.log('Combined Scores:', combinedScores);
      
      const scoresToReturn: {player_name: string, user_id: number, total_score: number, weeklyWins: number, currentWeekScore: number|string}[] = combinedScores.map((score) => {
        const scoreEntry = currentWeekScore.find(entry => entry.user_id === score.user_id)
        return {
          ...score,
          currentWeekScore: scoreEntry ? scoreEntry.score : "-"
        }
      });

      console.log("Scores To Return:", scoresToReturn)
      
      //Query to find the highest single week score of the year, by a user
      const highScore = await this.knex('submission')
        .select('user_id', 'player_name', 'week', 'score as highScore')
        .whereIn('user_id', userIds)
        .orderBy('score', 'desc')
        .limit(1) as {user_id: number, player_name: string, week: number, highScore: number}[];

        

      return {
          scoresToReturn,
          highScore,
      };
    } catch (error) {
      if(error instanceof NotFoundException){
        throw error;
      }
      throw new InternalServerErrorException('Error fetching scores');
    }
  }
}
