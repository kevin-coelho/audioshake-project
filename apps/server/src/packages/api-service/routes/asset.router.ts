import { Router } from 'express';

export function getAssetRouter() {
  return Router({
    mergeParams: true,
  }).post('/', async (req, res, next) => {
    try {
      console.log('POST /asset');
      return res.status(200).json({
        msg: 'OK',
      });
    } catch (err) {
      return next(err);
    }
  });
}
