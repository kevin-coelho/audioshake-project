// DEPENDENCIES
import joi from 'joi';

// local deps
import { PostgresEnvironmentVariables } from '../types/postgres.types';

/**
 * Export configuration for postgres service.
 * @param env
 */
export function parseConfigFromEnvironment(
  env: Partial<PostgresEnvironmentVariables>,
): PostgresConfigType {
  const { error, value } = environmentConfigValidator.validate(env);
  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    host: value.POSTGRES_HOST,
    port: value.POSTGRES_PORT,
    user: value.POSTGRES_USER,
    password: value.POSTGRES_PASSWORD,
    database: value.POSTGRES_DB_NAME,
    acquireConnectionTimeoutMs: value.POSTGRES_ACQUIRE_CONNECTION_TIMEOUT_MS,
    version: value.POSTGRES_VERSION,
  };
}

// validate environment variables
const environmentConfigValidator = joi
  .object({
    POSTGRES_HOST: joi.string().required(),
    POSTGRES_PORT: joi.number().required(),
    POSTGRES_USER: joi.string().required(),
    POSTGRES_PASSWORD: joi.string().optional().default(''),
    POSTGRES_DB_NAME: joi.string().required(),
    POSTGRES_ACQUIRE_CONNECTION_TIMEOUT_MS: joi
      .number()
      .integer()
      .greater(999)
      .default(10000),
    POSTGRES_VERSION: joi.string().default('14.5'),
  })
  .unknown()
  .required();

export type PostgresConfigType = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  acquireConnectionTimeoutMs: number;
  version: string;
};
