import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Prisma } from 'generated/prisma';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AddUserToTeamDto } from './dto/add-user-to-team.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(createTeamDto: CreateTeamDto, creatorUserId: number) {
    try {
      const team = await this.prisma.team.create({
        data: {
          name: createTeamDto.name,
          alias: createTeamDto.alias,
          description: createTeamDto.description,
          image: createTeamDto.image,
          memberships: {
            create: {
              userId: creatorUserId,
              role: 'Administrator',
            },
          },
        },
        select: {
          id: true,
          alias: true,
          name: true,
          description: true,
          image: true,
        },
      });
      return team;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async findAll() {
    return this.prisma.team.findMany({
      select: {
        id: true,
        alias: true,
        name: true,
        description: true,
        image: true,
      },
    });
  }

  async findOne(id: number) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      select: {
        id: true,
        alias: true,
        name: true,
        description: true,
        image: true,
      },
    });
    if (!team) {
      throw new NotFoundException(`Team with id ${id} not found`);
    }
    return team;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto, requestingUserId: number) {
    await this.findOne(id);

    // Check if the requesting user is a member of this team
    const isMember = await this.isUserMemberOfTeam(requestingUserId, id);
    if (!isMember) {
      throw new ForbiddenException('You can only update teams you are a member of');
    }

    const updated = await this.prisma.team.update({
      where: { id },
      // TypeScript will infer `data`'s type from Prisma's `.update()` signature
      data: {
        name: updateTeamDto.name,
        alias: updateTeamDto.alias,
        description: updateTeamDto.description,
        image: updateTeamDto.image,
      },
      select: {
        id: true,
        alias: true,
        name: true,
        description: true,
        image: true,
      },
    });
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    const deleted = await this.prisma.team.delete({
      where: { id },
      select: {
        id: true,
        alias: true,
        name: true,
        description: true,
        image: true,
      },
    });
    return deleted;
  }

  async getTeamUsers(teamId: number) {
    await this.findOne(teamId);
    return this.prisma.userOnTeam.findMany({
      where: { teamId },
      select: {
        role: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            alias: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }

  async addUserToTeam(teamId: number, dto: AddUserToTeamDto) {
    await this.findOne(teamId);
    try {
      return await this.prisma.userOnTeam.create({
        data: {
          team: { connect: { id: teamId } },
          user: { connect: { id: dto.userId } },
          role: dto.role,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          `User ${dto.userId} is already a member of team ${teamId}`,
        );
      }
      throw new InternalServerErrorException();
    }
  }

  async updateUserRole(teamId: number, dto: UpdateUserRoleDto) {
    const userId = dto.userId;
    await this.prisma.userOnTeam.findUniqueOrThrow({
      where: { userId_teamId: { userId, teamId } },
    });
    return this.prisma.userOnTeam.update({
      where: { userId_teamId: { userId, teamId } },
      data: { role: dto.role },
    });
  }

  async removeUserFromTeam(teamId: number, userId: number) {
    await this.prisma.userOnTeam.findUniqueOrThrow({
      where: { userId_teamId: { userId, teamId } },
    });
    return this.prisma.userOnTeam.delete({
      where: { userId_teamId: { userId, teamId } },
    });
  }

  async isUserMemberOfTeam(userId: number, teamId: number): Promise<boolean> {
    const membership = await this.prisma.userOnTeam.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    return !!membership;
  }

  async findOneWithMembershipCheck(id: number, requestingUserId: number) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      select: {
        id: true,
        alias: true,
        name: true,
        description: true,
        image: true,
      },
    });
    if (!team) {
      throw new NotFoundException(`Team with id ${id} not found`);
    }

    // Check if the requesting user is a member of this team
    const isMember = await this.isUserMemberOfTeam(requestingUserId, id);
    if (!isMember) {
      throw new ForbiddenException('You can only access information of teams you are a member of');
    }

    return team;
  }

  async getTeamUsersWithMembershipCheck(teamId: number, requestingUserId: number) {
    // Check if the requesting user is a member of this team
    const isMember = await this.isUserMemberOfTeam(requestingUserId, teamId);
    if (!isMember) {
      throw new ForbiddenException('You can only access members of teams you are a member of');
    }

    await this.findOne(teamId);
    return this.prisma.userOnTeam.findMany({
      where: { teamId },
      select: {
        role: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            alias: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }

  async findByAliasWithMembershipCheck(alias: string, requestingUserId: number) {
    const team = await this.prisma.team.findUnique({
      where: { alias },
      select: {
        id: true,
        alias: true,
        name: true,
        description: true,
        image: true,
      },
    });
    if (!team) {
      throw new NotFoundException(`Team with alias ${alias} not found`);
    }

    // Check if the requesting user is a member of this team
    const isMember = await this.isUserMemberOfTeam(requestingUserId, team.id);
    if (!isMember) {
      throw new ForbiddenException('You can only access information of teams you are a member of');
    }

    return team;
  }

  async getTeamUsersByAliasWithMembershipCheck(alias: string, requestingUserId: number) {
    // First get the team by alias to get the team ID
    const team = await this.findByAliasWithMembershipCheck(alias, requestingUserId);
    
    // Now get the team members using the team ID
    return this.prisma.userOnTeam.findMany({
      where: { teamId: team.id },
      select: {
        role: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            alias: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }
}
