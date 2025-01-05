import { Controller, Get, Query, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('ranked')
  @HttpCode(HttpStatus.OK)
  async getRanked(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ) {
    // Parse query params to integers (with fallback defaults)
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 10;

    return this.usersService.getRankedUsers(pageNum, pageSizeNum);
  }

  @Get('search')
  async search(@Query('keyword') keyword: string) {
    return this.usersService.searchUsersByKeyword(keyword);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('userId') userId: string) {
    return this.usersService.deleteUserByUserId(userId);
  }
} 