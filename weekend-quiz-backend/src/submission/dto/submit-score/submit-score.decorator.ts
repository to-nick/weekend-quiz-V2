import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SubmitScoreDto{
    @IsNotEmpty()
    @IsString()
    week: string;

    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @IsNotEmpty()
    @IsNumber()
    score: number;

    @IsNotEmpty()
    @IsNumber()
    players: number;

    @IsNotEmpty()
    @IsNumber()
    year: number;

    @IsNotEmpty()
    @IsString()
    playerName: string;
}