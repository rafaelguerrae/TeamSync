import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AddUserToTeamDto } from 'src/teams/dto/add-user-to-team.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { Request } from 'express';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Create a new team' })
  @ApiBody({ type: CreateTeamDto })
  @ApiResponse({ status: 201, description: 'Team created.' })
  async create(@Body() dto: CreateTeamDto, @Req() request: Request) {
    const creatorUserId = Number(request.user.sub);
    return await this.teamsService.create(dto, creatorUserId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams' })
  @ApiResponse({ status: 200, description: 'List of teams.' })
  async findAll() {
    return await this.teamsService.findAll();
  }

  @Get('alias/:alias')
  @ApiOperation({ summary: 'Get a team by alias' })
  @ApiParam({ name: 'alias', type: String })
  @ApiResponse({ status: 200, description: 'Team found.' })
  @ApiResponse({ status: 404, description: 'Team not found.' })
  @ApiResponse({ status: 403, description: 'Access denied - not a member of this team.' })
  async findByAlias(@Param('alias') alias: string, @Req() request: Request) {
    const requestingUserId = Number(request.user.sub);
    return await this.teamsService.findByAliasWithMembershipCheck(alias, requestingUserId);
  }

  @Get('alias/:alias/members')
  @ApiOperation({ summary: 'List users in a team by alias' })
  @ApiParam({ name: 'alias', type: String })
  @ApiResponse({ status: 200, description: 'Team memberships.' })
  @ApiResponse({ status: 403, description: 'Access denied - not a member of this team.' })
  async getTeamUsersByAlias(@Param('alias') alias: string, @Req() request: Request) {
    const requestingUserId = Number(request.user.sub);
    return await this.teamsService.getTeamUsersByAliasWithMembershipCheck(alias, requestingUserId);
  }

  @Get(':teamId')
  @ApiOperation({ summary: 'Get a team by ID' })
  @ApiParam({ name: 'teamId', type: Number })
  @ApiResponse({ status: 200, description: 'Team found.' })
  @ApiResponse({ status: 404, description: 'Team not found.' })
  @ApiResponse({ status: 403, description: 'Access denied - not a member of this team.' })
  async findOne(@Param('teamId', ParseIntPipe) id: number, @Req() request: Request) {
    const requestingUserId = Number(request.user.sub);
    return await this.teamsService.findOneWithMembershipCheck(id, requestingUserId);
  }

  @Patch(':teamId')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Update a team' })
  @ApiParam({ name: 'teamId', type: Number })
  @ApiBody({ type: UpdateTeamDto })
  @ApiResponse({ status: 200, description: 'Team updated.' })
  @ApiResponse({ status: 403, description: 'Access denied - not a member of this team.' })
  async update(
    @Param('teamId', ParseIntPipe) id: number,
    @Body() dto: UpdateTeamDto,
    @Req() request: Request,
  ) {
    const requestingUserId = Number(request.user.sub);
    return await this.teamsService.update(id, dto, requestingUserId);
  }

  @Delete(':teamId')
  @ApiOperation({ summary: 'Delete a team' })
  @ApiParam({ name: 'teamId', type: Number })
  @ApiResponse({ status: 204, description: 'Team deleted.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('teamId', ParseIntPipe) id: number) {
    await this.teamsService.remove(id);
  }

  @Post(':teamId/members')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Add a user to a team with a role' })
  @ApiParam({ name: 'teamId', type: Number })
  @ApiBody({ type: AddUserToTeamDto })
  @ApiResponse({ status: 201, description: 'Membership created.' })
  @ApiResponse({ status: 409, description: 'Already a member.' })
  async addUserToTeam(
    @Param('teamId', ParseIntPipe) id: number,
    @Body() dto: AddUserToTeamDto,
  ) {
    return await this.teamsService.addUserToTeam(id, dto);
  }

  @Get(':teamId/members')
  @ApiOperation({ summary: 'List users in a team' })
  @ApiParam({ name: 'teamId', type: Number })
  @ApiResponse({ status: 200, description: 'Team memberships.' })
  @ApiResponse({ status: 403, description: 'Access denied - not a member of this team.' })
  async getTeamUsers(@Param('teamId', ParseIntPipe) id: number, @Req() request: Request) {
    const requestingUserId = Number(request.user.sub);
    return await this.teamsService.getTeamUsersWithMembershipCheck(id, requestingUserId);
  }

  @Patch(':teamId/members')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: "Update a user's role in a team" })
  @ApiParam({ name: 'teamId', type: Number })
  @ApiParam({ name: 'userId', type: Number })
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiResponse({ status: 200, description: 'Role updated.' })
  async updateUserRole(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return await this.teamsService.updateUserRole(teamId, dto);
  }

  @Delete(':teamId/members/:userId')
  @ApiOperation({ summary: 'Remove a user from a team' })
  @ApiParam({ name: 'teamId', type: Number })
  @ApiParam({ name: 'userId', type: Number })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUserFromTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    await this.teamsService.removeUserFromTeam(teamId, userId);
  }
}
