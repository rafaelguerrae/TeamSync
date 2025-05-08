import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/database/prisma.service';
import { hash } from 'bcryptjs';
import { Prisma } from 'generated/prisma';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const encryptedPassword = await hash(createUserDto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          alias: createUserDto.alias,
          name: createUserDto.name,
          password: encryptedPassword,
          image: createUserDto.image,
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

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        alias: true,
        email: true,
        name: true,
        image: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        alias: true,
        email: true,
        name: true,
        image: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Ensure user exists
    await this.findOne(id);

    const data: Prisma.UserUpdateInput = {
      email: updateUserDto.email,
      alias: updateUserDto.alias,
      name: updateUserDto.name,
      image: updateUserDto.image,
    };

    if (updateUserDto.password) {
      data.password = await hash(updateUserDto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        alias: true,
        email: true,
        name: true,
        image: true,
      },
    });

    return updated;
  }

  async remove(id: number) {
    // Ensure user exists
    await this.findOne(id);

    const deleted = await this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        alias: true,
        email: true,
        name: true,
        image: true,
      },
    });

    return deleted;
  }

  async getUserTeams(userId: number) {
    await this.ensureUserExists(userId);
    return this.prisma.userOnTeam.findMany({
      where: { userId },
      select: {
        role: true,
        joinedAt: true,
        team: {
          select: {
            id: true,
            alias: true,
            name: true,
            description: true,
            image: true,
          },
        },
      },
    });
  }

  private async ensureUserExists(userId: number) {
    const exists = await this.prisma.user.count({ where: { id: userId } });
    if (!exists) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
  }
}
