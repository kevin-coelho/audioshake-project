// deps
import { Router } from 'express';

// local deps
import { getAssetRouter } from './asset.router';
import { getPostRouter } from './post.router';
import { getHealthRouter } from './health.router';

// top level routes
export function getRouter() {
  return Router({ mergeParams: true })
    .use('/health', getHealthRouter())
    .use('/asset', getAssetRouter())
    .use('/post', getPostRouter());
}
