import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './database/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TeamsModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    JwtModule.register({
      global: true,
    }),
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
