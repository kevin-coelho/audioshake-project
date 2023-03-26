import { Router } from 'express';

export function getHealthRouter() {
  return (
    Router({ mergeParams: true })
      /**
       * @openapi
       * /health:
       *  get:
       *    responses:
       *      200:
       *        description: API health check route
       *        content:
       *          application/json:
       *            schema:
       *              type: object
       *              properties:
       *                msg:
       *                  type: string
       *                  enum: ['OK']
       *              example:
       *                '{"msg":"OK"}'
       */
      .get('/', async (req, res) => {
        return res.status(200).json({ msg: 'OK' });
      })
  );
}
