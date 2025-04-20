import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class CreateLeagueDto{
    @IsNotEmpty()
    @IsString()
    leagueName: string;

    @IsNotEmpty()
    @IsNumber()
    userId: number;
}