// deps
import 'reflect-metadata';
import { Container } from 'typedi';
import { Context } from 'mocha';

// local deps
import KnexClient from '../postgres-service/knex-client';

declare module 'mocha' {
  export interface Context {
    knexClient: KnexClient;
  }
}

// TestContext will be used by all the test
export type TestContext = Mocha.Context & Context;

export const mochaHooks: Mocha.RootHookObject = {
  async beforeAll(this: Mocha.Context) {
    const knexClient = Container.get(KnexClient);
    await knexClient.isConnected();
    this.knexClient = knexClient;
  },
  async afterAll(this: Mocha.Context) {
    if (this.knexClient) {
      await this.knexClient.destroy();
    }
  },
};
