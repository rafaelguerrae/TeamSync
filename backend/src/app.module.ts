import { Module } from '@nestjs/common';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './database/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TeamsModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
