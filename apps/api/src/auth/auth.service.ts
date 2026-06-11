import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Company, User } from '@prisma/client';
import { AuthRepository } from '../repositories/auth.repository';
import { UserRepository } from '../repositories/user.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CurrentUser } from './interfaces/current-user.interface';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await this.passwordService.hash(dto.password);
    const result = await this.authRepository.registerCompanyWithAdmin({
      companyName: dto.companyName,
      admin: {
        name: dto.name,
        email: dto.email,
        passwordHash
      }
    });

    return this.buildAuthResponse(result.user, result.company);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.companyId, dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await this.passwordService.compare(
      dto.password,
      user.passwordHash
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      accessToken: await this.signAccessToken(user),
      user: this.toPublicUser(user)
    };
  }

  async getMe(currentUser: CurrentUser) {
    const user = await this.userRepository.findById(
      currentUser.companyId,
      currentUser.id
    );
    if (!user) {
      throw new BadRequestException('Current user no longer exists');
    }

    return this.toPublicUser(user);
  }

  private async buildAuthResponse(user: User, company: Company) {
    return {
      accessToken: await this.signAccessToken(user),
      user: this.toPublicUser(user),
      company
    };
  }

  private signAccessToken(user: User) {
    return this.jwtService.signAsync({
      sub: user.id,
      companyId: user.companyId,
      email: user.email,
      role: user.role
    });
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      companyId: user.companyId,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
