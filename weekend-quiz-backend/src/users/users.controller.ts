import { Controller, Get, Body, Post, Head } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/create-user/create-user.decorator';
import { LoginDto } from './dto/login/login.decorator';
import { UserResponse } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Head('ping')
  async ping() {
    return;
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<{message: string, user: RegisterDto}> {

    const result = await this.usersService.register(registerDto);
    return result;
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{message: string, token: string, user: UserResponse}> {
    const result = await this.usersService.login(loginDto);
    return result;
  }
}
