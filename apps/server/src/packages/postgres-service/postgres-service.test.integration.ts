// deps
import 'reflect-metadata';
import { assert } from 'chai';
import { Container } from 'typedi';

// local deps
import { PostgresService } from './Postgres.service';

describe('Postgres Service', function() {
  let postgresService: PostgresService;

  before(async function() {
    postgresService = Container.get(PostgresService);
  });

  it('Migration complete', async function() {
    const q = `SELECT *
      FROM pg_catalog.pg_tables
      WHERE schemaname != 'pg_catalog' AND
      schemaname != 'information_schema';`;
    const response = await postgresService.getKnexClient().getClient().raw<TableSchemaResponse>(q);
    const tables = new Set(response.rows.map(row => row.tablename));
    const { Asset, Post } = postgresService.getModels();
    assert.isTrue(tables.has(Asset.tableName));
    assert.isTrue(tables.has(Post.tableName));
  });
});

type TableSchemaResponse = {
  rows: Array<{ tablename: string }>
};
