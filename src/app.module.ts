import { Module } from '@nestjs/common';
import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './database/prisma.service';

@Module({
  imports: [ItemsModule, UsersModule],
  providers: [PrismaService],
})
export class AppModule {}
