import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('PRIVATE_KEY'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [JwtModule],
})
export class CustomJwtModule {}
