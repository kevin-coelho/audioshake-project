export type PostgresEnvironmentVariables = {
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB_NAME: string;
  POSTGRES_ACQUIRE_CONNECTION_TIMEOUT: number;
  POSTGRES_VERSION: string;
};
