import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class JoinLeagueDto{
    @IsNotEmpty()
    @IsString()
    leagueId: string;

    @IsNotEmpty()
    @IsNumber()
    userId: number;
}
