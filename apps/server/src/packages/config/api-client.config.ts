// DEPENDENCIES
import joi from 'joi';

// local deps
import { ApiClientEnvironmentVariables } from '../types/api-client.types';

// validate environment variables
const environmentConfigValidator = joi
  .object({
    API_CLIENT_HOST: joi.string().required(),
    API_CLIENT_PORT: joi.number().integer().greater(999).required(),
  })
  .unknown()
  .required();

/**
 * Export configuration for an API client.
 * @param env
 */
export function parseConfigFromEnvironment(
  env: Partial<ApiClientEnvironmentVariables>,
): ApiClientConfigType {
  const { error, value } = environmentConfigValidator.validate(env);
  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    host: value.API_CLIENT_HOST,
    port: value.API_CLIENT_PORT,
  };
}

export type ApiClientConfigType = {
  host: string;
  port: number;
};
