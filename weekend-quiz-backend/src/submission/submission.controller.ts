import { Controller, Post, Body, UseGuards, Put } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmitScoreDto } from './dto/submit-score/submit-score.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('submission')
@UseGuards(JwtAuthGuard)
export class SubmissionController {
    constructor(private readonly submissionService: SubmissionService) {}

    @Post('submit-score')
    async submitScore(@Body() submitScoreDto: SubmitScoreDto){
        const result = await this.submissionService.submitScore(submitScoreDto);
        return result;
    }

    @Put('update-score')
    async updateScore(@Body() submitScoreDto: SubmitScoreDto){
        const result = await this.submissionService.updateScore(submitScoreDto);
        return result
    }
}
