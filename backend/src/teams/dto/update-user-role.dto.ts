import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ description: 'ID of the user to join' })
  @IsInt()
  @Min(1)
  userId!: number;
  @ApiProperty({ description: 'New role of the user in the team' })
  @IsString()
  @IsNotEmpty()
  role!: string;
}
