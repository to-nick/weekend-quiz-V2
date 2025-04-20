import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException} from '@nestjs/common';
import { KnexService } from '../database/knex/knex.service';
import { Knex as KnexType } from 'knex';
import { CreateLeagueDto } from './dto/create-league/create-league.decorator';
import { JoinLeagueDto } from './dto/join-league/join-league.decorator';

interface LeagueDetials{
    id: number;
    league_name: string;
    created_by: number;
}

interface TotalPlayers{
    league_id: number;
    total_players: number;
}

export interface CombinedData{
    id: number;
    league_name: string;
    created_by: number;
    players: number;
}

@Injectable()
export class LeaguesService {
    private knex: KnexType;
    constructor(private knexService: KnexService) {
        this.knex = this.knexService.getKnexInstance();
    }
    
    //GET Route to display user leagues on the home profile page
    async displayLeagues(userId: number): Promise<CombinedData[]> {
        try{
            const leagues: {league_id: number}[] = await this.knex('user_leagues')
            .select('league_id')
            .where('user_id', userId);

            //Handling error - user is not part of any leagues yet
            if(leagues.length === 0){
                throw new NotFoundException('No leagues found for this user');
            }

            //Mapping all league ID's to get data on each of them
            const leagueIds: number[] = leagues.map((league) => league.league_id);

            const leagueDetails = await this.knex<LeagueDetials>('leagues')
                .select('*')
                .whereIn('id', leagueIds);
            
            //Calculating total number of players in each league
            const totalPlayers = await this.knex<TotalPlayers>('user_leagues')
                .whereIn('league_id', leagueIds)
                .select('league_id')
                .count<{ league_id: number, total_players: number}[]>('league_id as total_players')
                .groupBy('league_id');
            
            //Combining the two objects to create the response object
            const combinedData: CombinedData[] = leagueDetails.map((league) => {
                const numberOfPlayers = totalPlayers.find((player) => player.league_id === league.id);
                return {
                    ...league,
                    players: numberOfPlayers ? numberOfPlayers.total_players : 0,
                }
            });

            return combinedData;
        } catch (error) {
            if(error instanceof NotFoundException){
                throw error;
            }
            throw new InternalServerErrorException('Failed to display leagues');
        }
    }

    //POST route to create a new league
    async createLeague(createLeagueDto: CreateLeagueDto): Promise<{message: string, leagueId: string}>{
        try{
            const { userId, leagueName } = createLeagueDto;

            const newLeague: {league_name: string} = await this.knex('leagues')
                .select('league_name')
                .where('league_name', leagueName)
                .first();
            
            //Handling error if league name is already registered
            if(newLeague){
                throw new BadRequestException('League already exists');
            } 

            //Creating the new league
            let databaseCheck: {id: string};
            let createdLeagueId: string;
            //Do while loop to generate a unique number ID to the league. This ensures no duplicate league ID's
            do{
                createdLeagueId = String(Math.floor(Math.random() * 10000)).padStart(5, '0');
                databaseCheck = await this.knex('leagues')
                    .select('id')
                    .where('id', createdLeagueId).first();
                console.log(databaseCheck);
            } while(databaseCheck);

            const leagueToInsert: {id: number, league_name: string, created_by: number} = {
                id: Number(createdLeagueId),
                league_name: leagueName,
                created_by: userId,
            }

            const usersLeaguesToInsert: {user_id: number, league_id: string} = {
                user_id: userId,
                league_id: createdLeagueId,
            }
            //Inserting the new league into the leagues table in the database
            await this.knex('leagues')
            .insert(leagueToInsert);

            //Inserting the data into the user_leagues table
            await this.knex('user_leagues')
            .insert(usersLeaguesToInsert);
            
            //Responding to the client with the league ID
            return {
                message: 'League created successfully',
                leagueId: createdLeagueId,
            }
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException('Failed to create league');
        }
    }

    //POST Route to join an existing league
    async joinLeague(joinLeagueDto: JoinLeagueDto): Promise<{message: string}>{
        try{
            const {leagueId, userId} = joinLeagueDto;

            //Ensuring the league ID provided by the client exists
            const leagueCheck = await this.knex('leagues')
            .select('*')
            .where('id', leagueId)
            .first();

            if(!leagueCheck){
                throw new NotFoundException('League does not exist');
            }

            //Ensuring the user is not already in the league
            const userLeagueCheck = await this.knex('user_leagues')
            .select('user_id', 'league_id')
            .where('user_id', userId)
            .andWhere('league_id', leagueId).first();


            if(userLeagueCheck){
                throw new BadRequestException('User is already in this league');
            }
            
            const databaseEntry: {user_id: number, league_id: number} = {
                user_id: userId,
                league_id: Number(leagueId),
            }

            //Adding the user to the league
            await this.knex('user_leagues')
            .insert(databaseEntry);

            return {
                message: 'User joined league successfully',
            }
        } catch (error) {
            if(error instanceof NotFoundException || error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException('Failed to join league');
        }
    }

    // DELETE Route for leaving a league
    async leaveLeague(userId: number, leagueId: number): Promise<{message: string}>{
        try{
            //deleting the user from the user_leagues table. this will cause a cascade on the database to remove other instances of the user in  the provided league
            await this.knex('user_leagues')
            .delete("*")
            .where('user_id', userId)
            .andWhere('league_id', leagueId)

            this.displayLeagues(userId);

        return {
            message: 'User successfully removed from league',
        }
        } catch (error) {
            throw new InternalServerErrorException('Failed to leave league');
        }
    }
}