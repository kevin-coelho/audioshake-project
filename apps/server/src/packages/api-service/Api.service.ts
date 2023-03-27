// deps
import { Service } from 'typedi';
import gracefulShutdown from 'http-graceful-shutdown';
import express, { Express, NextFunction, Request, Response } from 'express';
import http, { Server } from 'http';
import { errors as celebrateErrors } from 'celebrate';
import bodyParser from 'body-parser';

// local deps
import { ServerConfig } from '../config';
import { PostgresService } from '../postgres-service';
import { getRouter } from './routes';
import { SwaggerService } from '../swagger-service/Swagger.service';
import { isDevOrTestEnvironment } from '../util-fns/env.util';

/**
 * This class encapsulates the API service (http server). IMPORTANT NOTE:
 * constructing an instance of this class will NOT automatically start listening
 * for requests! The init() method must be called first. Init will ensure
 * the proper dependencies are connected (such as postgres), and start listening
 * on a port determined by the global config (see src/packages/config).
 *
 * @example
 * const apiService = Container.get(ApiService);
 * await apiService.init(); // server starts listening here
 * await apiService.shutdown(); // initiate graceful http shutdown
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
    app.use(
      bodyParser.urlencoded({
        extended: true,
      }),
    );
    app.use(bodyParser.json());
  }

  applyErrorMiddleware(app: Express) {
    app.use(celebrateErrors());
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(err);
      const result: { name: string; message: string; stack?: string } = {
        name: err.name,
        message: err.message,
        stack: undefined,
      };
      if (isDevOrTestEnvironment()) {
        result.stack = err.stack;
      }
      return res.status(500).json(result);
    });
  }

  applyRoutes(app: Express) {
    app.use('/', getRouter());
    app.use('/docs', ...SwaggerService.getSwaggerUIMiddlewares());
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
