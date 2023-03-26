import { PostgresEnvironmentVariables } from '../postgres.types';
import { CommonEnvironmentVariables } from '../common.config.types';
import { S3EnvironmentVariables } from '../s3.types';

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv
      extends PostgresEnvironmentVariables,
        CommonEnvironmentVariables,
        S3EnvironmentVariables {
    }
  }
}
