import 'reflect-metadata';
import { assert } from 'chai';
import axios from 'axios';
import { Container } from 'typedi';
import { ServerConfig } from '../config';

describe('Api Service', function () {
  const serverConfig = Container.get(ServerConfig);

  const apiClient = axios.create({
    baseURL: `http://localhost:${serverConfig.api.port}`,
  });

  it('GET /health', async function () {
    const { data } = await apiClient.request({
      method: 'get',
      url: '/health',
    });
    assert.hasAllKeys(data, ['msg']);
    assert.equal(data.msg, 'OK');
  });
});
