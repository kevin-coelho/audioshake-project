export class JsonSchemaTypes {
  static TEXT() {
    return { type: 'string' };
  }

  public static STRING(maxLength?: number): { type: string; maxLength: number };
  static STRING(maxLength = 255) {
    return { type: 'string', maxLength };
  }

  static ENUM(allowedValues: string[]) {
    return { type: 'string', enum: allowedValues };
  }

  static DATE() {
    return { type: 'object', isDate: true };
  }

  public static NUMBER(): { type: string };
  public static NUMBER(
    minimum?: number,
    maximum?: number,
    exclusiveMaximum?: number,
  ): {
    type: string;
    minimum?: number;
    maximum?: number;
    exclusiveMaximum?: number;
  };
  static NUMBER(minimum?: number, maximum?: number, exclusiveMaximum?: number) {
    const result = { type: 'number' };
    for (const [key, val] of Object.entries({
      minimum,
      maximum,
      exclusiveMaximum,
    })) {
      if (typeof val !== 'undefined') {
        Object.assign(result, { [key]: val });
      }
    }
    return result;
  }

  static INTEGER(minimum?: number, exclusiveMaximum?: number) {
    return {
      minimum,
      exclusiveMaximum,
      type: 'integer',
    };
  }

  static BOOLEAN() {
    return { type: 'boolean' };
  }
}
