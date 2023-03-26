// deps
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

// local deps
import { JsonSchemaTypes } from '../../types/JsonSchema.types';
import { BaseModel } from './Base.model';
import { UUID_V4_SCHEMA, UUID_V5_SCHEMA } from '../lib/constants';
import { Model, ModelObject } from 'objection';
import { AssetModel } from './Asset.model';

export class PostModel extends BaseModel {
  // uuid v4
  id!: string;

  // title of the post
  title!: string;

  // body of the post
  content!: string;

  // category of the post
  category!: string;

  // uuid v5. refers to an AssetModel
  assetId!: string;

  // asset linked to this post
  asset?: AssetModel;

  createdAt!: Date;

  updatedAt!: Date;

  static get tableName() {
    return 'post';
  }

  static get idColumn() {
    return ['id'];
  }

  static get indexes() {
    return {
      primaryId: ['id'],
      category: ['category'],
      createdAt: ['createdAt'],
    };
  }

  static fromJsonPost(
    title: string,
    content: string,
    category: string,
    assetId?: string,
    asset?: ModelObject<AssetModel>,
  ): PostModel {
    const id = uuidv4();
    const now = moment.utc().toDate();
    if (!assetId && asset?.id) {
      assetId = asset.id;
    }
    return PostModel.fromJson({
      id,
      title,
      content,
      category,
      assetId,
      asset,
      createdAt: now,
      updatedAt: now,
    });
  }

  static relationMappings() {
    return {
      asset: {
        relation: Model.BelongsToOneRelation,
        modelClass: AssetModel,
        join: {
          from: `${PostModel.tableName}.assetId`,
          to: `${AssetModel.tableName}.${AssetModel.idColumn[0]}`,
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: UUID_V4_SCHEMA,
        title: JsonSchemaTypes.STRING(),
        content: JsonSchemaTypes.TEXT(),
        category: JsonSchemaTypes.STRING(),
        assetId: UUID_V5_SCHEMA,
        createdAt: JsonSchemaTypes.DATE(),
        updatedAt: JsonSchemaTypes.DATE(),
      },
      required: ['id', 'title', 'content', 'category'],
    };
  }
}

export type AssetModelType = PostModel;
