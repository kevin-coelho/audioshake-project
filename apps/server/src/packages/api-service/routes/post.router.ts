import { Router } from 'express';
import { Joi, Segments, celebrate } from 'celebrate';

export function getPostRouter() {
  return Router({
    mergeParams: true,
  }).post(
    '/',
    celebrate({
      [Segments.BODY]: Joi.object({
        title: Joi.string().required(),
        content: Joi.string().required(),
        category: Joi.string().required(),
        assetId: Joi.string().required(),
      }).required(),
    }),
    async (req, res, next) => {
      try {
        console.log('POST /post');
        return res.status(200).json({
          msg: 'OK',
        });
        // pass
      } catch (err) {
        return next(err);
      }
    },
  );
}
