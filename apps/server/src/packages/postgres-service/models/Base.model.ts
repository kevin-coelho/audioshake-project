// deps
import { Model, ModelOptions, Pojo } from 'objection';

// local deps
import CustomAjvValidator from '../lib/CustomAjvValidator';
import { compileJsonDateFields } from '../util/model.util';

type IndexSpecificationType = {
  [key: string]: Array<string>;
};

export abstract class BaseModel extends Model {
  createdAt!: Date;
  updatedAt!: Date;

  get DATE_FIELDS() {
    return ['createdAt', 'updatedAt'];
  }

  $beforeInsert() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.updatedAt) {
      this.updatedAt = new Date();
    }
  }

  static get indexes(): IndexSpecificationType {
    throw new Error('Abstract class error: indexes() is not implemented');
  }

  // handle standard / common date fields when parsing model from json or POJO
  $parseJson(json: Pojo, opt?: ModelOptions): Pojo {
    json = super.$parseJson(json, opt);
    return compileJsonDateFields(json, this.DATE_FIELDS);
  }

  $beforeUpdate() {
    this.updatedAt = new Date();
  }

  static createValidator() {
    return new CustomAjvValidator();
  }
}
