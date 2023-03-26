// deps
import { Knex, knex } from 'knex';
import { Service } from 'typedi';

// local deps
import { ServerConfig } from '../config';
import { PostgresVersionType, RawResultType } from './lib/types';

/**
 * This class encapsulates the underlying db driver & query builder for Objection.js
 * and higher level db operations. Under the hood, we use the `pg` driver.
 * Knex.js wraps this driver and gives query building and higher level operations.
 * {@link https://knexjs.org/}
 */
@Service()
class KnexClient {
  client: Knex;

  constructor(private config: ServerConfig) {
    const { host, database, password, port, user, acquireConnectionTimeoutMs } =
      config.postgres;
    this.client = knex({
      client: 'pg',
      connection: {
        host,
        port,
        user,
        password,
        database,
        timezone: 'Z',
      },
      acquireConnectionTimeout: acquireConnectionTimeoutMs,
    });
  }

  /**
   * Check if the db connection is alive by executing a postgres version() query. This
   * method may stall based on other currently executing queries.
   */
  async isConnected(): Promise<RawResultType<PostgresVersionType>> {
    return this.client.raw('SELECT version()');
  }

  /**
   * Return the underlying knex client.
   */
  getClient(): Knex {
    return this.client;
  }

  /**
   * Destroy the underlying db connection. WARNING: once this method is called,
   * all db-related operations will no longer work, including model files,
   * query building, and any query execution. In particular, be careful using
   * this function when operating in a Container via typedi. Calling this method
   * will make the global singleton instances related to the db unusable. This
   * is intended for use in clean process shutdown (i.e. SIGINT or similar).
   */
  async destroy() {
    await new Promise<void>((resolve, reject) => {
      this.client.destroy((err: Error | undefined) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
    console.warn('Knex client has been shutdown');
  }
}

export default KnexClient;
