import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dto/signup-user.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignInUserDto } from './dto/signin-user.dto';

@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: SignUpUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signUp(@Body() signUpUserDto: SignUpUserDto) {
    return await this.authService.signUp(signUpUserDto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiBody({ type: SignInUserDto })
  @ApiResponse({ status: 201, description: 'User signed in successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async signIn(@Body() signInUserDto: SignInUserDto) {
    return await this.authService.signIn(signInUserDto);
  }
}
