import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexService } from './database/knex/knex.service';
import { UsersModule } from './users/users.module';
import { KnexModule } from './database/knex/knex.module';
import { SubmissionModule } from './submission/submission.module';
import { LeaguesModule } from './leagues/leagues.module';
import { ScoresModule } from './scores/scores.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UsersModule, 
    KnexModule, 
    SubmissionModule, 
    LeaguesModule, 
    ScoresModule, 
    AuthModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService, 
    KnexService
  ],
})
export class AppModule {}
