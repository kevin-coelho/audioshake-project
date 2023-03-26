// deps
import { Container } from 'typedi';

// local deps
import { PostgresService } from '../Postgres.service';
import { PostModel } from '../models/Post.model';
import { AssetModel } from '../models/Asset.model';

// local cache
let fixtures: PostModel[];

export function getPostFixtures() {
  if (fixtures) {
    return fixtures;
  }
  const posts = [
    {
      title: 'Title 1',
      content: 'Body of post #1',
      category: 'Blog Post',
      asset: {
        contentType: 'image/gif',
        fileSize: 1024,
        filename: 'fake-img-1.gif',
      },
    },
    {
      title: 'Title 2',
      content: 'Body of post #2',
      category: 'Blog Post',
      asset: {
        contentType: 'image/jpg',
        fileSize: 1024,
        filename: 'fake-img-2.jpg',
      },
    },
    {
      title: 'Title 3',
      content: 'Body of post #3',
      category: 'Image Gallery',
      asset: {
        contentType: 'image/gif',
        fileSize: 2048,
        filename: 'fake-img-3.gif',
      },
    },
  ];

  fixtures = posts.map((post) => {
    const { title, content, category, asset } = post;
    const { contentType, filename, fileSize } = asset;
    const assetModel = AssetModel.fromUploadedAsset(
      contentType,
      fileSize,
      filename,
    ).toJSON();
    return PostModel.fromJsonPost(
      title,
      content,
      category,
      undefined,
      assetModel,
    );
  });
  return fixtures;
}

export async function loadPostFixtures() {
  const postgresService = Container.get(PostgresService);
  return postgresService
    .getModels()
    .Post.query()
    .upsertGraph(getPostFixtures(), { insertMissing: true });
}

export async function teardownPostFixtures() {
  const postgresService = Container.get(PostgresService);
  const fixtures = getPostFixtures();
  const assetIds = fixtures
    .map((post) => post.asset?.id)
    .filter((assetId): assetId is string => !!assetId);
  await postgresService.getModels().Asset.query().findByIds(assetIds).delete();

  const postIds = fixtures.map((post) => post.id);
  await postgresService.getModels().Post.query().findByIds(postIds).delete();
}
