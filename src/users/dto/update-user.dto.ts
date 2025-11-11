import { CreateUserDto } from './create-user.dto';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatuses } from '../../common/enums/roles.enum';

export class UpdateUserDto extends CreateUserDto {
  @IsEnum(UserStatuses)
  @ApiProperty({
    description: 'Имя пользователя',
    example: UserStatuses.inactive,
    required: true,
    nullable: false,
    type: String,
    enum: UserStatuses
  })
  status: string;
}
