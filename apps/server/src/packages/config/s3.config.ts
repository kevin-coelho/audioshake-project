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
    bucketArn: value.S3_BUCKET_ARN,
    accessKey: value.AWS_ACCESS_KEY,
    secretAccessKey: value.AWS_SECRET_ACCESS_KEY,
  };
}

// validate environment variables
const environmentConfigValidator = joi
  .object({
    S3_BUCKET: joi
      .string()
      .required()
      .pattern(/[a-zA-Z0-9-_]/),
    S3_BUCKET_ARN: joi.string().required(),
    AWS_ACCESS_KEY_ID: joi.string().required(),
    AWS_SECRET_ACCESS_KEY: joi.string().required(),
  })
  .unknown()
  .required();

export type S3ConfigType = {
  bucket: string;
  bucketArn: string;
  accessKey: string;
  secretAccessKey: string;
};
