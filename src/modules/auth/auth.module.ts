import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/services/user.service';
import { PassportModule } from '@nestjs/passport';
import { AuthJwtAccessStrategy } from 'src/modules/auth/strategies/jwt.access.strategy';
import { AuthJwtRefreshStrategy } from 'src/modules/auth/strategies/jwt.refresh.strategy';
import { CommonModule } from 'src/common/common.module';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    CommonModule,
    PassportModule.register({
      session: false,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('auth.accessToken.secret') || 'temporary-secret-key',
        signOptions: {
          expiresIn: configService.get('auth.accessToken.expiresIn') || '1d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthJwtAccessStrategy,
    AuthJwtRefreshStrategy,
    AuthService,
    UserService,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
