import { Module } from '@nestjs/common';
import { LeaguesService } from './leagues.service';
import { LeaguesController } from './leagues.controller';
import { KnexModule } from '../database/knex/knex.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [KnexModule, AuthModule],
  providers: [LeaguesService],
  controllers: [LeaguesController]
})
export class LeaguesModule {}
