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
  @Post()
  async createUser(@UserParams() user: JwtPayload, @Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto, user);
  }

  @Post('confirm-email')
  async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    return this.usersService.confirmEmail(confirmEmailDto);
  }

  @Patch('update/:id')
  async updateUser(
    @UserParams() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.updateUser(id, user, updateUserDto);
  }

  @Patch('block/:id')
  async blockUser(@UserParams() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.blockUser(id, user);
  }
}
