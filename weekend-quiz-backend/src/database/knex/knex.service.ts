import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Knex from 'knex';
import * as dotenv from 'dotenv';
import { Knex as KnexType } from 'knex';

dotenv.config();

//Configuring Knex to connect with the MySQL database
@Injectable()
export class KnexService implements OnModuleInit, OnModuleDestroy{
    private knex: KnexType;

    constructor(){
        this.knex = Knex({
            client: 'mysql2',
            connection: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: 52663,
            }
        });
    }

    onModuleInit(){
        console.log('Database connection initialized');
    }

    onModuleDestroy(){
        this.knex.destroy();
    }

    getKnexInstance(){
        return this.knex;
    }
}
