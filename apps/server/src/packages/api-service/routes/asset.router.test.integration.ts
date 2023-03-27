// deps
import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import axios, { AxiosInstance } from 'axios';
import concat from 'concat-stream';
import FormData from 'form-data';
import { Container } from 'typedi';

// local deps
import { ServerConfig } from '../../config';
import { PostgresService } from '../../postgres-service';
import { assert } from 'chai';

async function uploadFile(path: string, apiInstance: AxiosInstance) {
  const filestream = fs.createReadStream(path);
  const fd = new FormData();
  fd.append('file', filestream);
  return new Promise<{
    msg: string;
    id: string;
    fileSize: number;
  }>((resolve, reject) => {
    filestream.on('error', (err) => reject(err));
    fd.pipe(
      concat((data) => {
        apiInstance
          .request({
            url: '/asset',
            method: 'POST',
            data,
            headers: fd.getHeaders(),
          })
          .then((res) => resolve(res.data))
          .catch((err) => reject(err));
      }),
    );
  });
}

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
