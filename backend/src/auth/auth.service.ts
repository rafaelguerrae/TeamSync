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
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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

  async signIn(signInUserDto: SignInUserDto) {
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
    
    return { 
      accessToken: await this.jwtService.signAsync(payload),
      user: userWithoutPassword
    };
  }
}
