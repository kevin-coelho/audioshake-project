// DEPENDENCIES
import joi from 'joi';

// local deps
import { S3EnvironmentVariables } from '../types/s3.types';

/**
 * Export configuration for postgres service.
 * @param env
 */
export function parseConfigFromEnvironment(
  env: Partial<S3EnvironmentVariables>,
): S3ConfigType {
  const { error, value } = environmentConfigValidator.validate(env);
  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    bucket: value.S3_BUCKET,
  };
}

// validate environment variables
const environmentConfigValidator = joi
  .object({
    S3_BUCKET: joi.string().required().pattern(/[a-zA-Z0-9-_]/),
  })
  .unknown()
  .required();

export type S3ConfigType = {
  bucket: string;
};
