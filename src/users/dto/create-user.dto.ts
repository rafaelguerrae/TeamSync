import { IsNotEmpty, IsString, MinLength, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  @ApiProperty({ description: 'Unique email address of the user' })
  email!: string;

  @ApiProperty({ description: 'Full name of the user' })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;
  
  @ApiProperty({ description: 'Alias of the user' })
  @IsString({ message: 'Alias must be a string' })
  @IsNotEmpty({ message: 'Alias is required' })
  alias!: string;

  @ApiProperty({
    description: 'Password (min 6 characters)',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @ApiProperty({
    description: 'URL to the user\'s profile image',
    required: true,
  })
  @IsString({ message: 'Image must be a string' })
  @IsNotEmpty({ message: 'Image is required' })
  image!: string;
}
