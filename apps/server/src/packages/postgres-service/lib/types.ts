export interface PostgresVersionType {
  version: string;
}

export type RawResultType<T> = {
  command: string;
  rowCount: number;
  rows: T[];
  fields: Array<unknown>;
  rowAsArray: boolean;
};
