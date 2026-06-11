import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class PasswordService {
  hash(password: string) {
    return hash(password, 10);
  }

  compare(password: string, passwordHash: string) {
    return compare(password, passwordHash);
  }
}
