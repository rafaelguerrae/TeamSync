import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { PrismaService } from 'src/database/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  controllers: [TeamsController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    TeamsService,
    PrismaService,
  ],
})
export class TeamsModule {}
