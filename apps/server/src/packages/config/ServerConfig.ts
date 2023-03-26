// DEPENDENCIES
import { Service } from 'typedi';

// local deps
import { loadEnv } from './load-env';
import * as PostgresConfig from './postgres.config';
import * as CommonConfig from './common.config';
import * as S3Config from './s3.config';
import * as ApiConfig from './api.config';
import { PostgresConfigType } from './postgres.config';
import { CommonConfigType } from './common.config';
import { S3ConfigType } from './s3.config';
import { ApiConfigType } from './api.config';

@Service()
export class ServerConfig {
  constructor() {
    loadEnv();
  }

  get postgres(): PostgresConfigType {
    return PostgresConfig.parseConfigFromEnvironment(process.env);
  }

  get common(): CommonConfigType {
    return CommonConfig.parseConfigFromEnvironment(process.env);
  }

  get s3(): S3ConfigType {
    return S3Config.parseConfigFromEnvironment(process.env);
  }

  get api(): ApiConfigType {
    return ApiConfig.parseConfigFromEnvironment(process.env);
  }
}
