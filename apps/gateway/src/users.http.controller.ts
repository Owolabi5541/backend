import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { firstValueFrom, Observable } from 'rxjs';
import { mapGrpcError } from './grpc-error';

class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

interface UserServiceClient {
  CreateUser(data: { email: string; name: string; password: string }): Observable<any>;
  GetUserById(data: { id: string }): Observable<any>;
  GetAllUsers(data: Record<string, unknown>): Observable<any>;
}

@ApiTags('Users')
@Controller('users')
export class UsersHttpController {
  private readonly userService: UserServiceClient;

  constructor(@Inject('USER_SERVICE') private readonly userClient: ClientGrpc) {
    this.userService = this.userClient.getService<UserServiceClient>('UserService');
  }

  @Get()
  @ApiOperation({ summary: 'List all users' })
  async getAllUsers() {
    try {
      return await firstValueFrom(this.userService.GetAllUsers({}));
    } catch (error) {
      mapGrpcError(error);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'name', 'password'],
      properties: {
        email: { type: 'string', example: 'john@example.com' },
        name: { type: 'string', example: 'John Doe' },
        password: { type: 'string', example: 'secretpass123', minLength: 8 },
      },
    },
  })
  async createUser(@Body() body: CreateUserDto) {
    try {
      return await firstValueFrom(this.userService.CreateUser(body));
    } catch (error) {
      mapGrpcError(error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', example: 'uuid-here' })
  async getUserById(@Param('id') id: string) {
    try {
      return await firstValueFrom(this.userService.GetUserById({ id }));
    } catch (error) {
      mapGrpcError(error);
    }
  }
}
