import { Module } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { ScoresController } from './scores.controller';
import { KnexModule } from '../database/knex/knex.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [KnexModule, AuthModule],
  controllers: [ScoresController],
  providers: [ScoresService],
})
export class ScoresModule {}
