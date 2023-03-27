// DEPENDENCIES
import joi from 'joi';

// local deps
import { ApiEnvironmentVariables } from '../types/api.types';

// validate environment variables
const environmentConfigValidator = joi
  .object({
    API_PORT: joi.number().integer().greater(999).required(),
  })
  .unknown()
  .required();

/**
 * Export configuration for main API service.
 * @param env
 */
export function parseConfigFromEnvironment(
  env: Partial<ApiEnvironmentVariables>,
): ApiConfigType {
  const { error, value } = environmentConfigValidator.validate(env);
  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    port: value.API_PORT,
  };
}

export type ApiConfigType = {
  port: number;
};
