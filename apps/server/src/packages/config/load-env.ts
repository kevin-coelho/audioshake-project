// deps
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

/**
 * Attempt to laod environment variables into the runtime. Built to work in:
 * node.js runtimes
 */
export function loadEnv() {
  if (!process.env.NODE_ENV) {
    throw new Error('NODE_ENV is undefined. NODE_ENV is required');
  }
  const envFilePath = path.resolve(
    path.join(__dirname, '../../../../..', `.env.${process.env.NODE_ENV}`),
  );
  try {
    fs.statSync(envFilePath);
  } catch (err) {
    console.warn(`Unable to read env file: ${envFilePath}`);
  }
  // load config
  dotenv.config({
    path: envFilePath,
  });
}
