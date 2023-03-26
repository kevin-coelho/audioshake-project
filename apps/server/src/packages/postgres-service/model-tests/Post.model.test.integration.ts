// deps
import 'reflect-metadata';
import { assert } from 'chai';
import { Container } from 'typedi';

// local deps
import { PostgresService } from '../Postgres.service';
import {
  getPostFixtures,
  loadPostFixtures,
  teardownPostFixtures,
} from '../test-fixtures/post.fixtures';

describe('Asset model', function () {
  after(async function () {
    await teardownPostFixtures();
  });

  it('Can insert a row', async function () {
    const pgService = Container.get(PostgresService);
    const Post = pgService.getModels().Post;
    const postData = await Post.query().upsertGraph(getPostFixtures()[0], {
      insertMissing: true,
    });
    assert.equal(postData.id, getPostFixtures()[0].id);
    assert.equal(postData.content, getPostFixtures()[0].content);
  });

  it('Can retrieve a row (with JOIN to asset)', async function () {
    const pgService = Container.get(PostgresService);
    const Post = pgService.getModels().Post;
    const postModel = await Post.query()
      .where('id', getPostFixtures()[0].id)
      .limit(1)
      .withGraphFetched({
        asset: true,
      });
    assert.exists(postModel);
    assert.equal(getPostFixtures()[0].asset?.id, postModel[0].asset?.id);
  });

  it('JOIN (asset -> post)', async function () {
    const pgService = Container.get(PostgresService);
    const asset = await pgService
      .getModels()
      .Asset.query()
      .findById(getPostFixtures()[0].asset?.id as string)
      .withGraphFetched({
        post: true,
      });
    assert.exists(asset);
    assert.equal(asset?.post?.id, getPostFixtures()[0].id);
  });

  it('Can delete a row', async function () {
    const pgService = Container.get(PostgresService);
    const Post = pgService.getModels().Post;
    const post = await Post.query()
      .findById(getPostFixtures()[0].id)
      .withGraphFetched({
        asset: true,
      });
    const numDeleted = await Post.query()
      .del()
      .where('id', getPostFixtures()[0].id)
      .limit(1);
    assert.equal(numDeleted, 1);
    if (post && post.asset) {
      await pgService.getModels().Asset.query().deleteById(post.asset.id);
    }
    const assetModels = await Post.query()
      .where('id', getPostFixtures()[0].id)
      .limit(1);
    assert.isEmpty(assetModels);
  });

  it('Can load multiple fixtures', async function () {
    await loadPostFixtures();
  });
});
