import { AjvValidator } from 'objection';
import { _ } from 'ajv';
import addFormats from 'ajv-formats';

/**
 * Create a custom ajv validator class that can accept js Date objects. NOTE:
 * this creates a custom type that is NOT JSON-schema compliant! This is only
 * intended for use with Objection models supporting Date types.
 *
 * @example
 * // Usage of Date type in a validation schema
 * // someDate property will be validated as a js Date() type
 * const schema = {
 *   ...,
 *   properties: {
 *     someDate: {
 *       type: 'object',
 *       isDate: true,
 *     }
 *   }
 * };
 */
export default class CustomAjvValidator extends AjvValidator {
  constructor() {
    super({
      onCreateAjv: (ajv) => {
        ajv.addKeyword({
          keyword: 'isDate',
          type: 'object',
          code(ctx) {
            const { data } = ctx;
            ctx.pass(_`${data} instanceof Date && !isNaN(+${data})`);
          },
        });
        addFormats(ajv);
      },
      options: {
        allErrors: true,
        validateSchema: false,
        ownProperties: true,
        coerceTypes: true,
      },
    });
  }
}
