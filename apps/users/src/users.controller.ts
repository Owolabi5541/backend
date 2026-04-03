import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UserService', 'CreateUser')
  createUser(data: { email: string; name: string; password: string }) {
    return this.usersService.createUser(data);
  }

  @GrpcMethod('UserService', 'GetUserById')
  getUserById(data: { id: string }) {
    return this.usersService.getUserById(data);
  }

  @GrpcMethod('UserService', 'GetAllUsers')
  getAllUsers(_data: Record<string, unknown>) {
    return this.usersService.getAllUsers();
  }
}
