// DEPENDENCIES
import joi from 'joi';
import path from 'path';
import os from 'os';

// local deps
import { CommonEnvironmentVariables } from '../types/common.config.types';
import { ENVIRONMENTS } from './config.constants';

// validate environment variables
const environmentConfigValidator = joi
  .object({
    NODE_ENV: joi
      .string()
      .valid(...Object.values(ENVIRONMENTS))
      .required(),
    CONTAINER_ID: joi.string().required(), // unique id (per PROCESS_TYPE) for single instance of the microservice
    UUID_NAMESPACE: joi.string().required(),
  })
  .unknown()
  .required();

const platform = (() => {
  if (process.platform === 'win32') return 'windows';
  else if (process.platform === 'darwin') return 'macos';
  else if (process.platform === 'linux') return 'linux';
  else {
    return process.platform;
  }
})();

const hostname = os.hostname();

export type CommonConfigType = {
  env: string;
  platform:
    | string
    | 'aix'
    | 'android'
    | 'freebsd'
    | 'haiku'
    | 'openbsd'
    | 'sunos'
    | 'cygwin'
    | 'netbsd';
  hostname: string;
  rootDir: string;
  pid: number;
  containerId: string;
  systemName: string;
  processType: string;
  uuidNamespace: string;
};

/**
 * Defines common configs for the app (not relevant to any single service).
 */
export function parseConfigFromEnvironment(
  env: Partial<CommonEnvironmentVariables>,
): CommonConfigType {
  const { error, value } = environmentConfigValidator.validate(env);
  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    env: value.NODE_ENV,
    processType: value.PROCESS_TYPE,
    containerId: value.CONTAINER_ID,
    systemName: `${value.PROCESS_TYPE}-${value.CONTAINER_ID}-${value.NODE_ENV}`,
    rootDir: path.resolve(__dirname, '../..'),
    platform,
    pid: process.pid,
    hostname,
    uuidNamespace: value.UUID_NAMESPACE,
  };
}
