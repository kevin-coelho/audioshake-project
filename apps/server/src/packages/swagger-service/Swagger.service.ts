import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export class SwaggerService {
  static getSwaggerOptions() {
    return {
      failOnErrors: true,
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Audioshake Project',
          version: '1.0.0',
        },
      },
      apis: [path.resolve(path.join(__dirname, '../../**/*.ts'))],
    };
  }

  static generateSpec() {
    return swaggerJsdoc(this.getSwaggerOptions());
  }

  static getSwaggerUIMiddlewares() {
    return [
      swaggerUi.serve,
      swaggerUi.setup(this.generateSpec(), { explorer: true }),
    ];
  }
}
