// deps
import 'reflect-metadata';
import path from 'path';
import axios from 'axios';
import { Container } from 'typedi';
import { assert } from 'chai';
import moment from 'moment';

// local deps
import { ServerConfig } from '../../config';
import { PostgresService } from '../../postgres-service';
import { uploadFile } from '../test-utils/upload-file';
import { UUID_V5_LENGTH } from '../../postgres-service/lib/constants';

describe('Post Router', function () {
  const serverConfig = Container.get(ServerConfig);
  const apiInstance = axios.create({
    baseURL: `http://${serverConfig.apiClient.host}:${serverConfig.apiClient.port}`,
  });
  let firstPostId: string | undefined = undefined;
  let firstAssetId: string | undefined = undefined;
  let secondPostId: string | undefined = undefined;
  let secondAssetId: string | undefined = undefined;

  after(async function () {
    const postgresService = Container.get(PostgresService);
    await postgresService.getModels().Post.query().del();
    await postgresService.getModels().Asset.query().del();
  });

  it('POST /post', async function () {
    const filePath = path.resolve(
      path.join(__dirname, '../test-fixtures/temp.jpg'),
    );
    const { id: assetId } = await uploadFile(filePath, apiInstance);
    firstAssetId = assetId;
    const postData = {
      title: 'Test Title 1',
      content: 'Test post body 1',
      category: 'Test Category 1',
      assetId,
    };
    const {
      data: { msg, id },
    } = await apiInstance.request<{ msg: string; id: string }>({
      url: '/post',
      method: 'POST',
      data: postData,
    });
    assert.equal(msg, 'OK');
    assert.isString(id);
    assert.lengthOf(id, UUID_V5_LENGTH);
    firstPostId = id;
  });

  it('GET /post/:id', async function () {
    const {
      data: { id, assetId },
    } = await apiInstance.request<{ id: string; assetId: string }>({
      url: `/post/${firstPostId}`,
      method: 'GET',
    });
    assert.equal(id, firstPostId);
    assert.equal(assetId, firstAssetId);
  });

  it('GET /post', async function () {
    const postData2 = {
      title: 'Test Title 2',
      content: 'Test post body 2',
      category: 'Test Category 2',
      assetId: firstAssetId,
    };
    const {
      data: { id },
    } = await apiInstance.request<{ msg: string; id: string }>({
      url: '/post',
      method: 'POST',
      data: postData2,
    });
    secondPostId = id;
    const { data } = await apiInstance.request<
      Array<{ id: string; assetId: string; category: string }>
    >({
      url: '/post',
      method: 'GET',
    });
    const post1 = data.find((e) => e.id === firstPostId);
    const post2 = data.find((e) => e.id === id);
    assert.exists(post1);
    assert.exists(post2);
    assert.equal(post1?.assetId, firstAssetId);
  });

  it('GET /post - Filter by category', async function () {
    const { data } = await apiInstance.request<
      Array<{ id: string; assetId: string; category: string }>
    >({
      url: '/post',
      method: 'GET',
      params: {
        category: 'Test Category 2',
      },
    });
    assert.lengthOf(data, 1);
    assert.equal(data[0].id, secondPostId);
  });

  it('GET /post - Sort by latest first', async function () {
    const { data } = await apiInstance.request<Array<{ createdAt: string }>>({
      url: '/post',
      method: 'GET',
      params: {
        sort: 'latestFirst',
      },
    });
    assert.lengthOf(data, 2);
    assert.isTrue(
      moment.utc(data[0].createdAt).isAfter(moment.utc(data[1].createdAt)),
    );
  });

  it('GET /post - Sort by earliest first', async function () {
    const { data } = await apiInstance.request<Array<{ createdAt: string }>>({
      url: '/post',
      method: 'GET',
      params: {
        sort: 'earliestFirst',
      },
    });
    assert.lengthOf(data, 2);
    assert.isTrue(
      moment.utc(data[0].createdAt).isBefore(moment.utc(data[1].createdAt)),
    );
  });

  it('PUT /post/:id', async function () {
    const filePath = path.resolve(
      path.join(__dirname, '../test-fixtures/temp-2.webp'),
    );
    const { id: assetId } = await uploadFile(filePath, apiInstance);
    secondAssetId = assetId;
    const updateData = {
      title: 'Updated Title 2',
      content: 'Updated Content 2',
      category: 'Updated Category 2',
      assetId: secondAssetId,
    };

    await apiInstance.request<{ msg: string }>({
      url: `/post/${secondPostId}`,
      method: 'PUT',
      data: updateData,
    });
    const { data } = await apiInstance.request<{
      id: string;
      title: string;
      content: string;
      category: string;
      assetId: string;
    }>({
      url: `/post/${secondPostId}`,
      method: 'get',
    });
    assert.deepEqual(
      {
        title: data.title,
        content: data.content,
        category: data.category,
        assetId: data.assetId,
      },
      updateData,
    );
  });

  it('DELETE /post/:id', async function () {
    await apiInstance.request({
      url: `/post/${secondPostId}`,
      method: 'delete',
    });
    const { data } = await apiInstance.request<Array<{ id: string }>>({
      url: '/post',
      method: 'get',
    });
    assert.lengthOf(data, 1);
    assert.equal(data[0].id, firstPostId);
  });
});
