// deps
import { Service } from 'typedi';
import gracefulShutdown from 'http-graceful-shutdown';
import express, { Express } from 'express';
import http, { Server } from 'http';
import { errors as celebrateErrors } from 'celebrate';

// local deps
import { ServerConfig } from '../config';
import { PostgresService } from '../postgres-service';
import { getRouter } from './routes';

/**
 * This class encapsulates the apollo graphql service (http server). IMPORTANT NOTE:
 * constructing an instance of this class will NOT automatically start listening
 * for graphql queries! The init() method must be called first. Init will ensure
 * the proper dependencies are connected (such as redis, postgres), and start listening
 * on a port determined by the global config (see src/packages/config).
 *
 * @example
 * const apolloGraphqlService = Container.get(ApolloGraphlService);
 * await apolloGraphqlService.init(); // server starts listening here
 * await apolloGraphqlService.shutdown(); // initiate graceful http shutdown
 */
@Service()
export class ApiService {
  private readonly app: Express;
  private readonly httpServer: Server;
  private shutdownHandle?: () => Promise<void>;
  private listeningPromise?: Promise<void>;

  constructor(
    private readonly postgresService: PostgresService,
    private readonly config: ServerConfig,
  ) {
    this.app = express();
    this.httpServer = http.createServer(this.app);
  }

  async init() {
    this.applyMiddleware(this.app);
    this.applyRoutes(this.app);
    this.applyErrorMiddleware(this.app);

    // initialize knex db driver, and objection.js db models
    await this.postgresService.getKnexClient().isConnected();

    // start the graphql server and begin listening on the specified port
    this.listeningPromise = new Promise<void>((resolve) => {
      this.httpServer.listen(this.config.api.port, resolve);
      this.shutdownHandle = gracefulShutdown(this.httpServer, {
        finally: this.finalFunction,
      });
    });
    await this.listeningPromise;
    console.log(`🚀  Server ready on port :${this.config.api.port}`);
  }

  applyMiddleware(app: Express) {
    // pass
  }

  applyErrorMiddleware(app: Express) {
    app.use(celebrateErrors());
  }

  applyRoutes(app: Express) {
    app.use('/', getRouter());
  }

  async isListening() {
    await this.listeningPromise;
    return this.httpServer.listening;
  }

  finalFunction(): void {
    console.log('HTTP graceful shutdown complete');
  }

  async shutdown() {
    if (this.shutdownHandle) {
      await this.shutdownHandle();
    }
  }

  get expressApp() {
    return this.app;
  }
}
