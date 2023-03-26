import { FieldMetadata } from 'type-graphql/dist/metadata/definitions';

export interface PostgresVersionType {
  version: string;
}

export type RawResultType<T> = {
  command: string;
  rowCount: number;
  rows: T[];
  fields: FieldMetadata[];
  rowAsArray: boolean;
};
