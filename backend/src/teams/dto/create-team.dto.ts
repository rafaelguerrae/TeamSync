import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ description: 'Name of the team' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  
  @ApiProperty({ description: 'Alias of the team' })
  @IsString()
  @IsNotEmpty()
  alias!: string;

  @ApiProperty({ description: 'Description of the team', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Image URL or text for the team', required: false })
  @IsString()
  @IsOptional()
  image!: string;
}