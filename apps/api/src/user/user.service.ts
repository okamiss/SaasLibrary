import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  findCurrentUser(companyId: string, userId: string) {
    return this.userRepository.findById(companyId, userId);
  }
}
