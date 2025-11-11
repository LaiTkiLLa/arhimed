import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserParams } from '../common/decorators/user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { SwaggerResponseDecorator } from '../common/decorators/swagger-response.decorator';
import { RoleGuard } from '../common/guards/role.guard';
import { UserRoles } from '../common/enums/roles.enum';
import { GetUsersListDto } from './dto/get-users-list.dto';
import { GetUsersStatisticResponse } from './responses/get-users.statistic.response';
import { GetUsersListResponse } from './responses/get-users-list.response';
import { GetUsersRolesResponse } from './responses/get-users-roles.response';
import { UpdateUserDto } from './dto/update-user.dto';

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
  @UseGuards(RoleGuard(UserRoles.admin))
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
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

  @ApiForbiddenResponse({
    example: {
      message: 'Нет доступа',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Нет доступа'
  })
  @UseGuards(RoleGuard(UserRoles.admin))
  @ApiOperation({ summary: 'Получение списка пользователей' })
  @SwaggerResponseDecorator(200, 'Ok', GetUsersListResponse)
  @Get('list')
  async getUsersList(@Query() getUsersListDto: GetUsersListDto) {
    return this.usersService.getUsersList(getUsersListDto);
  }

  @ApiForbiddenResponse({
    example: {
      message: 'Нет доступа',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Нет доступа'
  })
  @UseGuards(RoleGuard(UserRoles.admin))
  @ApiOperation({ summary: 'Получение списка ролей пользователей' })
  @SwaggerResponseDecorator(200, 'Ok', GetUsersRolesResponse)
  @Get('roles')
  async getUsersRoles() {
    return this.usersService.getUsersRoles();
  }

  @ApiForbiddenResponse({
    example: {
      message: 'Нет доступа',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Нет доступа'
  })
  @UseGuards(RoleGuard(UserRoles.admin))
  @SwaggerResponseDecorator(200, 'Ok', GetUsersStatisticResponse)
  @ApiOperation({ summary: 'Получение статистики пользователей' })
  @Get('statistic')
  async getUsersStatistic() {
    return this.usersService.getUsersStatistic();
  }

  @ApiNotFoundResponse({
    example: {
      message: 'Пользователь не найден',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Пользователь не найден'
  })
  @ApiForbiddenResponse({
    example: {
      message: 'Нет доступа',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Нет доступа'
  })
  @UseGuards(RoleGuard(UserRoles.admin))
  @SwaggerResponseDecorator(200, 'Ok', {
    id: '42a1bab8-cc94-4f61-b4ef-f045cfab93e7'
  })
  @Put(':id')
  async updateUser(
    @UserParams() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.updateUser(id, user, updateUserDto);
  }

  @ApiForbiddenResponse({
    example: {
      message: 'Токен просрочен',
      error: 'Forbidden',
      statusCode: 403
    },
    description: 'Токен просрочен'
  })
  @ApiNotFoundResponse({
    example: {
      message: 'Пользователь не найден',
      error: 'Not Found',
      statusCode: 404
    },
    description: 'Пользователь не найден'
  })
  @ApiOperation({ summary: 'Удаление пользователя' })
  @SwaggerResponseDecorator(200, 'Ok', { id: '78cc625f-df2f-40ad-8658-304b98185687' })
  @UseGuards(RoleGuard(UserRoles.admin))
  @Delete(':id')
  async deleteUser(@UserParams() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deleteUser(id, user);
  }
}
