import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { KnexModule } from '../database/knex/knex.module';
import { SubmissionController } from './submission.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [KnexModule, AuthModule],
  providers: [SubmissionService],
  controllers: [SubmissionController]
})
export class SubmissionModule {}
