import { Router } from 'express';
import { getAssetRouter } from './asset.router';
import { getPostRouter } from './post.router';
import { getHealthRouter } from './health.router';

export function getRouter() {
  return Router({ mergeParams: true })
    .use('/health', getHealthRouter())
    .use('/asset', getAssetRouter())
    .use('/post', getPostRouter());
}
