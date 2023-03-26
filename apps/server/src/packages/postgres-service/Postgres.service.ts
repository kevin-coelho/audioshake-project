// deps
import { Model } from 'objection';
import { Service } from 'typedi';

// local deps
import KnexClient from './knex-client';
import ObjectionModels from './models/ObjectionModels';

/**
 * This class encapsulates the knex client and objection models. On instantiation,
 * it will properly register the knex client to objection models ensuring that
 * all models have a proper db connection. If this class is not instantiated,
 * objection models will not have a db connection and won't be able to execute
 * queries. Except for unit tests and specific startup / shutdown only code,
 * all application code should use the PostgresService class to interact with the db.
 *
 * @example
 * Execute a simple query:
 * const postgresService = Container.get(PostgresService);
 * const asset = await postgresService.getModels().Asset.query().limit(1);
 */
@Service()
export class PostgresService {
  constructor(
    private readonly knexClient: KnexClient,
    private readonly models: ObjectionModels,
  ) {
    Model.knex(knexClient.getClient());
    this.models = models;
  }

  getKnexClient() {
    return this.knexClient;
  }

  getModels() {
    return this.models;
  }
}
