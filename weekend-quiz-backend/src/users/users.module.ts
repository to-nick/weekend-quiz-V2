import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { KnexModule } from '../database/knex/knex.module';
import { UsersController } from './users.controller';
@Module({
  imports: [KnexModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
