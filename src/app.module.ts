import { Module } from '@nestjs/common';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './database/prisma.service';

@Module({
  imports: [TeamsModule, UsersModule],
  providers: [PrismaService],
})
export class AppModule {}
