import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Res,
  Get,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dto/signup-user.dto';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInUserDto } from './dto/signin-user.dto';
import { Public } from 'src/public-route';
import { Response, Request } from 'express';
import { RefreshTokenResponseDto } from './dto/refresh-token.dto';

@ApiTags('auth')
@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: SignUpUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signUp(@Body() signUpUserDto: SignUpUserDto) {
    return await this.authService.signUp(signUpUserDto);
  }

  @Public()
  @Post('signin')
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiBody({ type: SignInUserDto })
  @ApiResponse({ status: 200, description: 'User signed in successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async signIn(
    @Body() signInUserDto: SignInUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.signIn(signInUserDto, response);
  }
  
  @Public()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully.',
    type: RefreshTokenResponseDto
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token.' })
  @ApiCookieAuth('refresh_token')
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    if (!refreshToken) {
      throw new HttpException('Refresh token not found', HttpStatus.UNAUTHORIZED);
    }
    
    return await this.authService.refreshToken(refreshToken, response);
  }
  
  @Post('signout')
  @ApiOperation({ summary: 'Sign out a user' })
  @ApiResponse({ status: 200, description: 'User signed out successfully.' })
  async signOut(@Res({ passthrough: true }) response: Response) {
    return await this.authService.signOut(response);
  }
}
