import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { KnexService } from '../database/knex/knex.service';
import { SubmitScoreDto } from './dto/submit-score/submit-score.decorator';
import { Knex as KnexType } from 'knex';

@Injectable()
export class SubmissionService {
    private knex: KnexType;
    constructor(private knexService: KnexService) {
        this.knex = this.knexService.getKnexInstance();
    }

    //Post route for weekly score submission
    async submitScore(submitScoreDto: SubmitScoreDto): Promise<{message: string}>{

        const {week, userId, playerName, score, players, year} = submitScoreDto;

        try{
            //Ensuring the user has not alredy submitted a score for the current week
            const duplicateCheck: {user_id: number} = await this.knex('submission')
            .select('user_id', 'week')
            .where('user_id', userId)
            .andWhere('week', week)
            .first();


            if(duplicateCheck){
                throw new BadRequestException('Score already submitted for this week');
            }

            //Building the submission object to match the database requirements
            const dataToInsert: {user_id: number, week: string, year: number, score: number, number_of_players: number, player_name: string} = {
                user_id: userId,
                week: week,
                year: year,
                score: score,
                number_of_players: players,
                player_name: playerName,
            }
            
            //Inserting the score into the database
            const submit: void = await this.knex('submission')
            .insert(dataToInsert);

            
            return {
                message: 'Score submitted successfully',
            }
        } catch (error) {
            console.error('Error:',error);
            if(error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException('Failed to submit score');
        }
    }
}

