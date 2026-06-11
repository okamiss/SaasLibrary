import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OSS from 'ali-oss';
import { OSS_CLIENT } from './oss.constants';
import { OssConfigurationError } from './oss.errors';
import { OssService } from './oss.service';

@Global()
@Module({
  providers: [
    {
      provide: OSS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new OSS({
          region: getRequiredConfig(configService, 'ALI_OSS_REGION'),
          bucket: getRequiredConfig(configService, 'ALI_OSS_BUCKET'),
          accessKeyId: getRequiredConfig(
            configService,
            'ALI_OSS_ACCESS_KEY_ID'
          ),
          accessKeySecret: getRequiredConfig(
            configService,
            'ALI_OSS_ACCESS_KEY_SECRET'
          ),
          endpoint: getOptionalConfig(configService, 'ALI_OSS_ENDPOINT'),
          secure: true
        });
      }
    },
    OssService
  ],
  exports: [OssService]
})
export class OssModule {}

function getRequiredConfig(configService: ConfigService, key: string) {
  const value = configService.get<string>(key);
  if (!value) {
    throw new OssConfigurationError(`Missing required OSS config: ${key}`);
  }

  return value;
}

function getOptionalConfig(configService: ConfigService, key: string) {
  return configService.get<string>(key) || undefined;
}
