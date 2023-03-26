import 'reflect-metadata';
import { Container } from 'typedi';
import { assert } from 'chai';

// local deps
import { ServerConfig } from './ServerConfig';

describe('Config test', function () {
  describe('Postgres configs', function () {
    const config = Container.get(ServerConfig);

    it('Has connection params', function () {
      assert.exists(config.postgres.host);
      assert.isString(config.postgres.host);

      assert.exists(config.postgres.port);
      assert.isNumber(config.postgres.port);

      assert.exists(config.postgres.user);
      assert.isString(config.postgres.user);

      assert.exists(config.postgres.password);
      assert.isString(config.postgres.password);

      assert.exists(config.postgres.database);
      assert.isString(config.postgres.database);
    });

    it('Has version', function () {
      assert.exists(config.postgres.version);
      assert.isString(config.postgres.version);
    });

    it('Has connection timeout', function () {
      assert.exists(config.postgres.acquireConnectionTimeoutMs);
      assert.isNumber(config.postgres.acquireConnectionTimeoutMs);
    });
  });

  describe('Common configs', function () {
    const config = Container.get(ServerConfig);

    it('UUID, hostname, pid, platform, env are defined', function () {
      const { uuidNamespace, hostname, pid, platform, env } = config.common;
      assert.exists(uuidNamespace);
      assert.exists(hostname);
      assert.exists(pid);
      assert.exists(platform);
      assert.exists(env);
    });
  });
});
