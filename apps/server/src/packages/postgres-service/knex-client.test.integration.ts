// deps
import 'reflect-metadata';
import { assert } from 'chai';
import { Container } from 'typedi';

// local deps
import KnexClient from './knex-client';
import { ServerConfig } from '../config';

describe('Knex Client', function() {
  let client: KnexClient;

  before(async function() {
    client = Container.get(KnexClient);
  });

  it('Connects to the db', async function() {
    this.timeout(20000);
    const config = Container.get(ServerConfig);
    const response = await client.isConnected();
    assert.exists(response);
    assert.hasAnyKeys(response, ['rows']);
    assert.hasAnyKeys(response, ['fields']);
    assert.lengthOf(response.rows, 1);
    assert.hasAllKeys(response.rows[0], ['version']);
    const matcher = new RegExp(`^PostgreSQL ${config.postgres.version}`, 'i');
    assert.isNotNull(
      matcher.exec(response.rows[0].version),
      'Postgres version mismatch!',
    ); // ensure postgres version matches config
  });
});
