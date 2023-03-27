// deps
import { Container } from 'typedi';

// local deps
import { PostgresService } from '../Postgres.service';
import { AssetModel } from '../models/Asset.model';

// local cache
let fixtures: AssetModel[];

export function getAssetFixtures() {
  if (fixtures) {
    return fixtures;
  }

  const postgresService = Container.get(PostgresService);
  const uploadedAssets = [
    {
      contentType: 'image/gif',
      fileSize: 1024,
      filename: 'fake-img-1.gif',
    },
    {
      contentType: 'image/jpg',
      fileSize: 2048,
      filename: 'fake-img-2.jpg',
    },
  ];

  fixtures = uploadedAssets.map((uploadedAsset) => {
    const { filename, contentType, fileSize } = uploadedAsset;
    return postgresService
      .getModels()
      .Asset.fromUploadedAsset(contentType, filename, fileSize);
  });
  return fixtures;
}

export async function loadAssetFixtures() {
  const postgresService = Container.get(PostgresService);
  return postgresService.getModels().Asset.query().insert(getAssetFixtures());
}

export async function teardownAssetFixtures() {
  const postgresService = Container.get(PostgresService);
  await postgresService.getModels().Asset.query().delete();
}
