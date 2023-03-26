// deps
import 'reflect-metadata';
import { Container } from 'typedi';
import { Context } from 'mocha';

// local deps
import KnexClient from '../postgres-service/knex-client';
import { ApiService } from '../api-service/Api.service';

declare module 'mocha' {
  export interface Context {
    knexClient: KnexClient;
    apiService: ApiService;
  }
}

// TestContext will be used by all the test
export type TestContext = Mocha.Context & Context;

export const mochaHooks: Mocha.RootHookObject = {
  async beforeAll(this: Mocha.Context) {
    this.knexClient = Container.get(KnexClient);
    await this.knexClient.isConnected();

    this.apiService = Container.get(ApiService);
    await this.apiService.init();
    await this.apiService.isListening();
  },
  async afterAll(this: Mocha.Context) {
    if (this.apiService) {
      await this.apiService.shutdown();
    }
    if (this.knexClient) {
      await this.knexClient.destroy();
    }
  },
};
