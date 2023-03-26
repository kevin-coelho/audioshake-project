// deps
import { Service } from 'typedi';

// local deps
import { AssetModel } from './Asset.model';
import { PostModel } from './Post.model';

/**
 * This class encapsulates objection.js db models. As of writing, each model
 * corresponds directly with a database table. WARNING: Using this class without
 * instantiating via the PostgresService wrapper will result in models not having
 * a db connection and therefore will not be able to execute any queries. Do
 * not use this class directly. Access via the PostgresService class.
 */
@Service()
export default class ObjectionModels {
  public Asset: typeof AssetModel;
  public Post: typeof PostModel;

  constructor() {
    this.Asset = AssetModel;
    this.Post = PostModel;
  }
}
