// deps
import 'reflect-metadata';
import { assert } from 'chai';
import { Container } from 'typedi';

// local deps
import { PostgresService } from '../Postgres.service';
import { getAssetFixtures, loadAssetFixtures, teardownAssetFixtures } from '../test-fixtures/asset.fixtures';

describe('Asset model', function() {
  after(async function() {
    await teardownAssetFixtures();
  });

  it('Can insert a row', async function() {
    const pgService = Container.get(PostgresService);
    const Asset = pgService.getModels().Asset;
    const assetData = await Asset.query().insert(getAssetFixtures()[0]);
    assert.equal(assetData.id, getAssetFixtures()[0].id);
    assert.equal(assetData.key, getAssetFixtures()[0].key);
  });

  it('Can retrieve a row', async function() {
    const pgService = Container.get(PostgresService);
    const Asset = pgService.getModels().Asset;
    const assetModel = await Asset.query()
      .where('id', getAssetFixtures()[0].id)
      .limit(1);
    assert.exists(assetModel);
  });

  it('Can delete a row', async function() {
    const pgService = Container.get(PostgresService);
    const Asset = pgService.getModels().Asset;
    const numDeleted = await Asset.query()
      .del()
      .where('id', getAssetFixtures()[0].id)
      .limit(1);
    assert.equal(numDeleted, 1);
    const assetModels = await Asset.query()
      .where('id', getAssetFixtures()[0].id)
      .limit(1);
    assert.isEmpty(assetModels);
  });

  it('Can load multiple fixtures', async function() {
    await loadAssetFixtures();
  });
});
