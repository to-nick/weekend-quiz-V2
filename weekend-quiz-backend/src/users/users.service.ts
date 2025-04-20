import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from './dto/create-user/create-user.decorator';
import { LoginDto } from './dto/login/login.decorator';
import { KnexService } from '../database/knex/knex.service';
import { Knex as KnexType } from 'knex';
import * as dotenv from 'dotenv';

dotenv.config();

interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
}


@Injectable()
export class UsersService {
  private knex: KnexType;
  constructor(private readonly knexService: KnexService) {
    this.knex = this.knexService.getKnexInstance();
  }
  //Register Route
  async register(registerDto: RegisterDto): Promise<{message: string, user: RegisterDto}> {
    try {
      const { name, email, password } = registerDto;

     //Checking to see if the user email has already been registered
      const existingUser = await this.knex<User>('users')
        .where('email', email).first();

      if (existingUser) {
        throw new BadRequestException('User already exists');
    }
      //Hashing user password for security
      const saltRounds: number = 10;
      const hashedPassword: string = await bcrypt.hash(password, saltRounds);

      const newUserDetails: User = {
        name: name,
        email: email,
        password: hashedPassword
      }

      //Adding new user into the database
      const newUser = await this.knex<User>('users')
        .insert(newUserDetails);

      return {
        message: 'User registered successfully',
        user: newUserDetails,
      };
    } catch (error) {
      console.error(`Registration error: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  //Login Route
  async login(loginDto: LoginDto): Promise<{message: string, token: string, user: UserResponse}> {
    const { email, password } = loginDto;

    //handling error if user does not exist
    try{
      const user = await this.knex<User>('users')
        .select("*")
        .where('email', email)
        .first();

      if(!user) {
        throw new BadRequestException('User not found');
      }

      //Comparing user password input with database password
      const isPasswordValid: boolean = await bcrypt.compare(password, user.password);
      //Error if password is not matching
      if(!isPasswordValid) {
        throw new BadRequestException('Invalid password');
      }

      //Granting a JSON Web Token if user password matches database password 
      const expiresIn: number = 3600;
      const exp: number = Math.floor(Date.now() / 1000) + expiresIn;
      const jwtSecret: string|undefined = process.env.JWT_SECRET;
      if(!jwtSecret) {
        throw new InternalServerErrorException('JWT secret is not defined');
      }
      
      const payload: {user: UserResponse} = {
        user: {
          id: user.id!,
          name: user.name,
          email: user.email,
        }
      } 
      const token: string = jwt.sign({ payload, exp }, jwtSecret);

      console.log('Token:', token);
      
      return {
        message: 'Login successful',
        token,
        user: {
          id: user.id!,
          name: user.name,
          email: user.email,
        }
      };
      
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to login');
    }
  }


}