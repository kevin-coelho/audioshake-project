import { JsonSchemaTypes } from '../../types/JsonSchema.types';

export const UUID_V5_LENGTH = 36;
export const UUID_V4_LENGTH = 36;
export const UUID_V5_SCHEMA = JsonSchemaTypes.STRING(UUID_V5_LENGTH);
export const UUID_V4_SCHEMA = JsonSchemaTypes.STRING(UUID_V4_LENGTH);

export const POSTGRES_FOREIGN_KEY_OPS = {
  CASCADE: 'CASCADE',
  RESTRICT: 'RESTRICT',
  SET_NULL: 'SET NULL',
  NO_ACTION: 'NO ACTION',
};
