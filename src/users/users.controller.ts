import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserParams } from '../common/decorators/user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { GetUserInfoResponse } from './interfaces/get-user-info.interface';
import { GetUserListByCurator } from './interfaces/get-managers-list.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersListByAdmin } from './interfaces/get-users-list-by-admin.interface';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse, ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { SwaggerResponseDecorator } from '../common/decorators/swagger-response.decorator';
import { LoginByEmailResponse } from '../auth/responses/login-by-email.response';

@ApiTags('Работа с пользователями')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // @Get('info')
  // async getUserInfo(@UserParams() user: JwtPayload): Promise<GetUserInfoResponse> {
  //   return this.usersService.getUserInfo(user);
  // }
  //
  // @Get('list')
  // async getUsersListByAdmin(): Promise<GetUsersListByAdmin[]> {
  //   return this.usersService.getUsersList();
  // }
  //
  // @Get('by-curator/list')
  // async getManagersList(@UserParams() user: JwtPayload): Promise<GetUserListByCurator[]> {
  //   return this.usersService.getUsersListByCurator(user);
  // }
  //
  @ApiNotFoundResponse({
    example: {
      message: 'Роль не найдена',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Роль не найдена'
  })
  @ApiForbiddenResponse({
    example: {
      message: 'Нет доступа',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Нет доступа'
  })
  @ApiConflictResponse({
    example: {
      message: 'Пользователь с такими данными уже существует в системе',
      error: 'Conflict',
      statusCode: 409
    },
    description: 'Пользователь с такими данными уже существует в системе'
  })
  @ApiOperation({ summary: 'Добавление пользователей' })
  @SwaggerResponseDecorator(201, 'Ok', {
    id: '42a1bab8-cc94-4f61-b4ef-f045cfab93e7'
  })
  @Post()
  async createUser(@UserParams() user: JwtPayload, @Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto, user);
  }

  @ApiNotFoundResponse({
    example: {
      message: 'Пользователь не найден',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Пользователь не найден'
  })
  @ApiConflictResponse({
    example: {
      message: 'Email уже подтвержден',
      error: 'Conflict',
      statusCode: 409
    },
    description: 'Email уже подтвержден'
  })
  @SwaggerResponseDecorator(201, 'Ok', {
    id: '42a1bab8-cc94-4f61-b4ef-f045cfab93e7'
  })
  @ApiOperation({ summary: 'Подтверждение email' })
  @Post('confirm-email')
  async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    return this.usersService.confirmEmail(confirmEmailDto);
  }

  // @Patch('update/:id')
  // async updateUser(
  //   @UserParams() user: JwtPayload,
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body() updateUserDto: UpdateUserDto
  // ) {
  //   return this.usersService.updateUser(id, user, updateUserDto);
  // }
  //
  // @Patch('block/:id')
  // async blockUser(@UserParams() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
  //   return this.usersService.blockUser(id, user);
  // }
}
