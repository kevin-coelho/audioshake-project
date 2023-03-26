// deps
import { Knex } from 'knex';
import { Container } from 'typedi';

// local deps
import ObjectionModels from '../../models/ObjectionModels';
import { AssetModel } from '../../models/Asset.model';
import { PostModel } from '../../models/Post.model';
import { POSTGRES_FOREIGN_KEY_OPS } from '../../lib/constants';

export async function up(knex: Knex) {
  const models = Container.get(ObjectionModels);
  await knex.schema.createTable(models.Post.tableName, (table) => {
    const { properties } = models.Post.jsonSchema;
    table
      .string(models.Post.idColumn[0], properties.id.maxLength)
      .notNullable();
    table.string('title', properties.title.maxLength).notNullable();
    table.string('content').notNullable();
    table.string('category', properties.category.maxLength).notNullable();
    table
      .string('assetId', properties.assetId.maxLength)
      .references(AssetModel.idColumn[0])
      .inTable(AssetModel.tableName)
      .onUpdate(POSTGRES_FOREIGN_KEY_OPS.CASCADE)
      .onDelete(POSTGRES_FOREIGN_KEY_OPS.SET_NULL);
    table
      .datetime('createdAt', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .datetime('updatedAt', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.primary(PostModel.indexes.primaryId);
    table.index(PostModel.indexes.category);
    table.index(PostModel.indexes.createdAt);
  });
}

export async function down(knex: Knex) {
  const models = Container.get(ObjectionModels);
  await knex.schema.dropTable(models.Post.tableName);
}
