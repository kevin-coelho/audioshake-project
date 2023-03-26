// deps
import 'reflect-metadata';
import { Container } from 'typedi';
import type { Knex } from 'knex';
import path from 'path';

// local deps
import { ServerConfig } from '../../config';

// get config
const serverConfig = Container.get(ServerConfig);
const { host, database, password, port, user } = serverConfig.postgres;

// export config for knex migrations
const environments: { [key: string]: Knex.Config } = {
  test: {
    client: 'pg',
    connection: {
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true,
      timezone: 'Z',
    },
    migrations: {
      tableName: 'knex_migrations',
      extension: 'ts',
      directory: path.resolve(path.join(__dirname, 'migrations')),
    },
  },
  development: {
    client: 'pg',
    connection: {
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true,
      timezone: 'Z',
    },
    migrations: {
      tableName: 'knex_migrations',
      extension: 'ts',
      directory: path.resolve(path.join(__dirname, 'migrations')),
    },
  },
  production: {
    client: 'pg',
    connection: {
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true,
      timezone: 'Z',
    },
    migrations: {
      tableName: 'knex_migrations',
      extension: 'ts',
      directory: path.resolve(path.join(__dirname, 'migrations')),
    },
  },
};

module.exports = environments;
