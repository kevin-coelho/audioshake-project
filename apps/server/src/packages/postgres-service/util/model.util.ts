// deps
import { Pojo } from 'objection';
import moment from 'moment';

/**
 * In order to support the js "Date" type when generating Objection models from plain
 * objects or json, we need to do cast date strings to the js Date type. This function
 * takes in a json object and recasts any recognized fields as the Date type.
 *
 * @example
 * class SomeModel {
 *  someDateField?: Date;
 *  someOtherDateField?: Date;
 *
 *  get DATE_FIELDS() {
 *    return [
 *      'someDateField',
 *      'someOtherDateField',
 *    ];
 *  }
 *
 *  $parseJson(json: Pojo, opt?: ModelOptions): Pojo {
 *    json = super.$parseJson(json, opt);
 *    return compileJsonDateFields(json, this.DATE_FIELDS);
 *  }
 * }
 *
 * @param json Json or POJO to be parsed
 * @param dateFields Fields that need to be cast to the Date type
 */
export function compileJsonDateFields(json: Pojo, dateFields: string[]): Pojo {
  for (const DATE_FIELD of dateFields) {
    if (json[DATE_FIELD]) {
      json[DATE_FIELD] = moment.utc(json[DATE_FIELD]).toDate();
    } else {
      delete json[DATE_FIELD]; // account for "null" case
    }
  }
  return json;
}
