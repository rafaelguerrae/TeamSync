import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpUserDto } from './dto/signup-user.dto';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from 'generated/prisma';
import { compare, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignInUserDto } from './dto/signin-user.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(signUpUserDto: SignUpUserDto) {
    const encryptedPassword = await hash(signUpUserDto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: signUpUserDto.email,
          alias: signUpUserDto.alias,
          name: signUpUserDto.name,
          password: encryptedPassword,
          image: signUpUserDto.image,
        },
        select: {
          id: true,
          alias: true,
          email: true,
          name: true,
          image: true,
        },
      });

      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        (error.meta?.target as string[]).includes('email')
      ) {
        throw new ConflictException('A user with that email already exists');
      }
      // rethrow anything else as a 500
      throw new InternalServerErrorException();
    }
  }

  async signIn(signInUserDto: SignInUserDto, response: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: signInUserDto.email },
      select: {
        id: true,
        email: true,
        name: true,
        alias: true,
        image: true,
        password: true,
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(
      signInUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.email, sub: user.id };
    
    // Create a user object without the password
    const { password, ...userWithoutPassword } = user;
    
    // Generate access and refresh tokens
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m', // Short lived token for security
    });
    
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d', // Longer lived refresh token
    });
    
    // Set refresh token as an HttpOnly cookie
    this.setRefreshTokenCookie(response, refreshToken);
    
    return { 
      accessToken,
      user: userWithoutPassword
    };
  }
  
  async refreshToken(refreshToken: string, response: Response) {
    try {
      // Verify the refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      
      // Generate a new access token
      const accessToken = await this.jwtService.signAsync(
        { username: payload.username, sub: payload.sub },
        { expiresIn: '15m' }
      );
      
      // Generate a new refresh token
      const newRefreshToken = await this.jwtService.signAsync(
        { username: payload.username, sub: payload.sub },
        { expiresIn: '7d' }
      );
      
      // Set the new refresh token as an HttpOnly cookie
      this.setRefreshTokenCookie(response, newRefreshToken);
      
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  
  async signOut(response: Response) {
    // Clear the refresh token cookie with the same configuration
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: isProduction ? 'none' : 'strict',
      path: '/',
    });
    
    return { message: 'Signed out successfully' };
  }
  
  private setRefreshTokenCookie(response: Response, token: string) {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    
    response.cookie('refresh_token', token, {
      httpOnly: true,         // Prevents JavaScript access
      secure: true,           // Only sent over HTTPS
      sameSite: isProduction ? 'none' : 'strict', // 'none' for cross-origin in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/',              // Available across the site
    });
  }
}
