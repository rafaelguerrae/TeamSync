import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsString, IsNotEmpty } from 'class-validator';

export class AddUserToTeamDto {
  @ApiProperty({ description: 'ID of the user to join' })
  @IsInt()
  @Min(1)
  userId!: number;

  @ApiProperty({ description: 'Role of the user in the team' })
  @IsString()
  @IsNotEmpty()
  role!: string;
}
