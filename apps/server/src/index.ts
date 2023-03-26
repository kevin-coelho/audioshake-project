// required for typedi
import 'reflect-metadata';

import { Container } from 'typedi';
import { ApiService } from './packages/api-service/Api.service';

async function main() {
  const apiService = Container.get(ApiService);
  await apiService.init();
}

main();
