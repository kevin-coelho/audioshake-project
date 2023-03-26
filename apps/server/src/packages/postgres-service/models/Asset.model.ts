// deps
import { v5 as uuidv5, v4 as uuidv4 } from 'uuid';
import { Container } from 'typedi';
import mime from 'mime-types';
import joi from 'joi';
import moment from 'moment';

// local deps
import { ServerConfig } from '../../config';
import { JsonSchemaTypes } from '../../types/JsonSchema.types';
import { BaseModel } from './Base.model';
import { UUID_V5_SCHEMA } from '../lib/constants';
import { Model } from 'objection';
import { PostModel } from './Post.model';

const uploadValidator = joi.object({
  contentType: joi.string().required().custom(validateContentType),
  fileSize: joi.number().integer().greater(0).required(),
  filename: joi.string().required(),
}).required();

export class AssetModel extends BaseModel {
  // uuid v5. hash of s3 bucket-key with namespace
  id!: string;

  // s3 bucket name
  bucket!: string;

  // (unique) s3 file key
  key!: string;

  // mime type
  contentType!: string;

  // size of uploaded file in bytes
  fileSize!: number;

  // (non-unique) name of uploaded file
  filename!: string;

  // post that this asset belongs to
  post?: PostModel;

  createdAt!: Date;

  updatedAt!: Date;

  static get tableName() {
    return 'asset';
  }

  static get idColumn() {
    return ['id'];
  }

  /**
   * Convert s3 bucket name, file key, and v4 uuid to a unique hash
   */
  static getUuid(bucket: string, key: string) {
    const serverConfig = Container.get(ServerConfig);
    return uuidv5(
      `${bucket}-${key}`,
      serverConfig.common.uuidNamespace,
    );
  }

  static get indexes() {
    return {
      primaryId: ['id'],
      uniqueBucketAndKey: ['bucket', 'key'],
    };
  }

  static fromUploadedAsset(contentType: string, fileSize: number, filename: string, bucket?: string): AssetModel {
    const { value, error } = uploadValidator.validate({
      contentType,
      fileSize,
      filename,
    });
    if (error) {
      throw error;
    }
    if (!bucket) {
      const s3Config = Container.get(ServerConfig).s3;
      bucket = s3Config.bucket;
    }
    const sanitizedFilename = AssetModel.sanitizeFilename(value.filename);
    const key = `${sanitizedFilename}-${uuidv4()}`;
    const id = AssetModel.getUuid(bucket, key);
    const assetModel = new AssetModel();
    assetModel.id = id;
    assetModel.bucket = bucket;
    assetModel.contentType = value.contentType;
    assetModel.key = key;
    assetModel.fileSize = value.fileSize;
    assetModel.filename = sanitizedFilename;
    const now = moment.utc().toDate();
    assetModel.createdAt = now;
    assetModel.updatedAt = now;
    return assetModel;
  }

  /**
   * Return a sanitized version of the specified filename string containing
   * only filesystem-valid chars. Replaces any unsanitized chars with the '-'
   * character.
   * @param filename
   */
  static sanitizeFilename(filename: string) {
    return filename.replace(/[\\/:"*?<>|]+/, '-');
  }

  static relationMappings() {
    return {
      post: {
        relation: Model.BelongsToOneRelation,
        modelClass: PostModel,
        join: {
          from: `${AssetModel.tableName}.${AssetModel.idColumn[0]}`,
          to: `${PostModel.tableName}.assetId`,
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: UUID_V5_SCHEMA,
        bucket: JsonSchemaTypes.STRING(),
        key: JsonSchemaTypes.STRING(),
        contentType: JsonSchemaTypes.STRING(),
        fileSize: JsonSchemaTypes.INTEGER(0),
        filename: JsonSchemaTypes.STRING(),
        createdAt: JsonSchemaTypes.DATE(),
        updatedAt: JsonSchemaTypes.DATE(),
      },
      required: [
        'id',
        'bucket',
        'key',
        'contentType',
        'fileSize',
        'filename',
      ],
    };
  }
}

/**
 * Validate a contentType value against npm mime-types lib. If not recognized,
 * throw a joi validation error.
 * @param value
 * @param helpers
 */
function validateContentType(
  value: unknown,
  helpers: joi.CustomHelpers,
): string {
  try {
    const mimeType = mime.contentType(value as string);
    joi.assert(mimeType, joi.string().required(), `Unrecognized contentType: ${value}`);
    return mimeType as string;
  } catch (err) {
    if (!(err instanceof Error)) {
      console.error(err);
      console.error('Invalid error in validation function');
      throw helpers.error('string.invalid', {
        originalValue: value,
      });
    }
    throw helpers.error('string.invalid', {
      cause: err,
      message: err.message,
      stack: err.stack,
      original: helpers.original,
    });
  }
}

export type AssetModelType = AssetModel;
