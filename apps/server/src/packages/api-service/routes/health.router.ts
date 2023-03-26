import { Router } from 'express';

export function getHealthRouter() {
  return Router({ mergeParams: true }).get('/', async (req, res) => {
    return res.status(200).json({ msg: 'OK' });
  });
}
