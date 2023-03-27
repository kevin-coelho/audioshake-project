import 'reflect-metadata';
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

// deps
import { Container } from 'typedi';
import { program } from 'commander';

// local deps
import { PostgresService } from '../postgres-service';
import {
  loadAssetFixtures,
  teardownAssetFixtures,
} from '../postgres-service/test-fixtures/asset.fixtures';
import { isDevOrTestEnvironment } from '../util-fns/env.util';
import {
  loadPostFixtures,
  teardownPostFixtures,
} from '../postgres-service/test-fixtures/post.fixtures';

/**
 * This is a standalone utility script intended to be run if test fixtures need to be
 * loaded or wiped. This file is not intended to be run with a test runner and should instead
 * be invoked manually, probably using `ts-node`.
 *
 * IMPORTANT: BE CAREFUL USING THIS SCRIPT! If you use the wrong .env file, you may
 * end up wiping an unintended db (like dev, for example). Make sure you are using the
 * proper env and db host / port! This file should really only be used on the local
 * docker test db.
 *
 * @example
 * NODE_ENV=test npx ts-node fixtures.ts up
 */
async function main() {
  if (!isDevOrTestEnvironment()) {
    throw new Error(
      'SAFETY ERROR: Do not use fixtures.ts in non-dev environments',
    );
  }

  program.option('--all', 'Load all fixtures', true);
  program.option('-a, --asset', 'Load asset fixtures', false);

  program
    .command('up')
    .description('Load fixtures')
    .action(() => {
      const options = program.opts();
      options.up = true;
      return handleFixtures(options as ProgramOptions)
        .catch((err) => {
          console.error(err);
        })
        .then(cleanup);
    });

  program
    .command('down')
    .description('Teardown fixtures')
    .action(() => {
      const options = program.opts();
      options.up = false;
      return handleFixtures(options as ProgramOptions)
        .catch((err) => {
          console.error(err);
        })
        .then(cleanup);
    });

  program.parse();
}

type ProgramOptions = {
  up: boolean;
  all: boolean;
  asset: boolean;
  post: boolean;
};

// map from program options to their respective loader functions
// NOTE: these are ORDERED! Changing order may cause dependent rows to
// break during loading or teardown.
const programFixtureMapping = {
  up: {
    asset: async () => loadAssetFixtures(),
    post: async () => loadPostFixtures(),
  },
  down: {
    asset: async () => teardownAssetFixtures(),
    post: async () => teardownPostFixtures(),
  },
};

async function handleFixtures(options: ProgramOptions) {
  console.log('Loading fixtures with options', options);
  if (options.up) {
    for (const _opt of Object.keys(programFixtureMapping.up)) {
      const opt = _opt as keyof typeof programFixtureMapping.up;
      if (options[opt] || options.all) {
        await programFixtureMapping.up[opt]();
      }
    }
  } else {
    for (const _opt of Object.keys(programFixtureMapping.down)) {
      const opt = _opt as keyof typeof programFixtureMapping.down;
      if (programFixtureMapping.down[opt] || options.all) {
        await programFixtureMapping.down[opt]();
      }
    }
  }
}

async function cleanup() {
  const postgresService = Container.get(PostgresService);
  await postgresService.getKnexClient().destroy();
}

main();
