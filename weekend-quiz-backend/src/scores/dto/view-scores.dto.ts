import { IsNotEmpty, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class ViewScoresDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    leagueId: number;
}
