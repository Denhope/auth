import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';

import {
  IAuthPayload,
  ITokenResponse,
  TokenType,
} from '../interfaces/auth.interface';
import { UserService } from '../../user/services/user.service';
import { HelperHashService } from '../../../common/services/helper.hash.service';
import { IAuthService } from '../interfaces/auth.service.interface';
import { AuthResponseDto } from '../dtos/auth.response.dto';
import { AuthLoginDto } from '../dtos/auth.login.dto';
import { AuthSignupDto } from '../dtos/auth.signup.dto';

@Injectable()
export class AuthService implements IAuthService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExp: string;
  private readonly refreshTokenExp: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly helperHashService: HelperHashService,
  ) {
    this.accessTokenSecret = this.configService.get<string>('JWT_SECRET');
    this.refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    this.accessTokenExp = '15m';
    this.refreshTokenExp = '7d';
  }

  async verifyToken(accessToken: string): Promise<IAuthPayload> {
    try {
      const data = await this.jwtService.verifyAsync(accessToken, {
        secret: this.accessTokenSecret,
      });

      return data;
    } catch (e) {
      throw new InternalServerErrorException('Token verification failed');
    }
  }

  async generateTokens(user: IAuthPayload): Promise<ITokenResponse> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
          {
            id: user.id,
            role: user.role,
            tokenType: TokenType.ACCESS_TOKEN,
          },
          {
            secret: this.accessTokenSecret,
            expiresIn: this.accessTokenExp,
          },
        ),
        this.jwtService.signAsync(
          {
            id: user.id,
            role: user.role,
            tokenType: TokenType.REFRESH_TOKEN,
          },
          {
            secret: this.refreshTokenSecret,
            expiresIn: this.refreshTokenExp,
          },
        ),
      ]);

      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      throw new InternalServerErrorException('Token generation failed');
    }
  }

  async login(data: AuthLoginDto): Promise<AuthResponseDto> {
    try {
      const { email, password } = data;
      const user = await this.userService.getUserByEmail(email);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isPasswordValid = await this.helperHashService.match(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new NotFoundException('Invalid password');
      }

      const tokens = await this.generateTokens({
        id: user.id,
        role: user.role,
      });

      return {
        ...tokens,
        user,
      };
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new InternalServerErrorException('Login failed');
    }
  }

  async signup(dto: AuthSignupDto): Promise<AuthResponseDto> {
    try {
      const { email, firstName, lastName, password, username } = dto;
      
      const [existingEmail, existingUsername] = await Promise.all([
        this.userService.getUserByEmail(email),
        username ? this.userService.getUserByUserName(username) : null,
      ]);

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }

      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }

      const hashedPassword = await this.helperHashService.createHash(password);

      const user = await this.userService.createUser({
        email,
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        password: hashedPassword,
        username: username?.trim(),
      });

      const tokens = await this.generateTokens({
        id: user.id,
        role: user.role,
      });

      return {
        ...tokens,
        user,
      };
    } catch (e) {
      if (e instanceof ConflictException) {
        throw e;
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }
}
