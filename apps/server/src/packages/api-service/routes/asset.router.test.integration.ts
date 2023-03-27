// deps
import 'reflect-metadata';
import path from 'path';
import axios from 'axios';
import { Container } from 'typedi';
import { assert } from 'chai';

// local deps
import { ServerConfig } from '../../config';
import { PostgresService } from '../../postgres-service';
import { uploadFile } from '../test-utils/upload-file';

describe('Asset Router', function () {
  const serverConfig = Container.get(ServerConfig);
  const apiInstance = axios.create({
    baseURL: `http://${serverConfig.apiClient.host}:${serverConfig.apiClient.port}`,
  });

  after(async function () {
    const postgresService = Container.get(PostgresService);
    await postgresService.getModels().Asset.query().del();
  });

  it('Upload .jpg', async function () {
    this.timeout(5000);
    const filePath = path.resolve(
      path.join(__dirname, '../test-fixtures/temp.jpg'),
    );
    const result = await uploadFile(filePath, apiInstance);
    assert.hasAllKeys(result, ['msg', 'id', 'fileSize']);
  });

  it('Upload .webp', async function () {
    this.timeout(5000);
    const filePath = path.resolve(
      path.join(__dirname, '../test-fixtures/temp-2.webp'),
    );
    const result = await uploadFile(filePath, apiInstance);
    assert.hasAllKeys(result, ['msg', 'id', 'fileSize']);
  });
});
