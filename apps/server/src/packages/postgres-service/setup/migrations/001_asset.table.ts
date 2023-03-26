// deps
import { Knex } from 'knex';
import { Container } from 'typedi';

// local deps
import ObjectionModels from '../../models/ObjectionModels';
import { AssetModel } from '../../models/Asset.model';

export async function up(knex: Knex) {
  const models = Container.get(ObjectionModels);
  await knex.schema.createTable(models.Asset.tableName, (table) => {
    const { properties } = models.Asset.jsonSchema;
    table
      .string(models.Asset.idColumn[0], properties.id.maxLength)
      .notNullable();
    table.string('bucket', properties.bucket.maxLength).notNullable();
    table.string('key', properties.key.maxLength).notNullable();
    table.string('contentType', properties.contentType.maxLength).notNullable();
    table.string('filename', properties.filename.maxLength).notNullable();
    table.integer('fileSize').notNullable();
    table
      .datetime('createdAt', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .datetime('updatedAt', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.primary(AssetModel.indexes.primaryId);
    table.unique(AssetModel.indexes.uniqueBucketAndKey);
  });
}
export async function down(knex: Knex) {
  const models = Container.get(ObjectionModels);
  await knex.schema.dropTable(models.Asset.tableName);
}
