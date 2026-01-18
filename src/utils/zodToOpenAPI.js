/**
 * Zod to OpenAPI Schema Converter
 * Automatically converts Zod validation schemas to OpenAPI 3.0 schemas
 *
 * Supports:
 * - ZodString (with email, url, uuid, regex, min/max)
 * - ZodNumber/ZodInt (with min/max)
 * - ZodBoolean
 * - ZodDate
 * - ZodEnum
 * - ZodArray
 * - ZodObject (nested)
 * - ZodOptional/ZodNullable
 * - ZodDefault
 * - ZodUnion
 * - ZodLiteral
 * - ZodRecord
 */
export class ZodToOpenAPI {
  /**
   * Convert Zod schema to OpenAPI schema
   * @param {object} zodSchema - Zod schema object
   * @returns {object} OpenAPI schema object
   */
  static convert(zodSchema) {
    if (!zodSchema || !zodSchema._def) {
      return { type: 'object' };
    }

    const typeName = zodSchema._def.typeName;
    const description = zodSchema._def.description;

    let schema;

    switch (typeName) {
      case 'ZodString':
        schema = this.convertString(zodSchema);
        break;

      case 'ZodNumber':
        schema = this.convertNumber(zodSchema);
        break;

      case 'ZodInt':
        schema = { type: 'integer', ...this.getNumberConstraints(zodSchema) };
        break;

      case 'ZodBoolean':
        schema = { type: 'boolean' };
        break;

      case 'ZodDate':
        schema = { type: 'string', format: 'date-time' };
        break;

      case 'ZodEnum':
        schema = {
          type: 'string',
          enum: zodSchema._def.values,
        };
        break;

      case 'ZodNativeEnum':
        schema = {
          type: 'string',
          enum: Object.values(zodSchema._def.values),
        };
        break;

      case 'ZodLiteral':
        schema = {
          type: typeof zodSchema._def.value,
          enum: [zodSchema._def.value],
        };
        break;

      case 'ZodObject':
        schema = this.convertObject(zodSchema);
        break;

      case 'ZodArray':
        schema = {
          type: 'array',
          items: this.convert(zodSchema._def.type),
        };
        if (zodSchema._def.minLength) {
          schema.minItems = zodSchema._def.minLength.value;
        }
        if (zodSchema._def.maxLength) {
          schema.maxItems = zodSchema._def.maxLength.value;
        }
        break;

      case 'ZodRecord':
        schema = {
          type: 'object',
          additionalProperties: this.convert(zodSchema._def.valueType),
        };
        break;

      case 'ZodOptional':
        schema = this.convert(zodSchema._def.innerType);
        break;

      case 'ZodNullable':
        schema = this.convert(zodSchema._def.innerType);
        schema.nullable = true;
        break;

      case 'ZodDefault':
        schema = this.convert(zodSchema._def.innerType);
        try {
          schema.default = zodSchema._def.defaultValue();
        } catch {
          // Default value might throw for complex types
        }
        break;

      case 'ZodUnion':
        schema = {
          oneOf: zodSchema._def.options.map((opt) => this.convert(opt)),
        };
        break;

      case 'ZodIntersection':
        schema = {
          allOf: [this.convert(zodSchema._def.left), this.convert(zodSchema._def.right)],
        };
        break;

      case 'ZodEffects':
        // For transform/refine, use the inner schema
        schema = this.convert(zodSchema._def.schema);
        break;

      case 'ZodAny':
        schema = {};
        break;

      case 'ZodUnknown':
        schema = {};
        break;

      case 'ZodVoid':
      case 'ZodUndefined':
        schema = { type: 'null' };
        break;

      default:
        schema = { type: 'string' };
    }

    // Add description if present
    if (description) {
      schema.description = description;
    }

    return schema;
  }

  /**
   * Convert Zod string to OpenAPI
   */
  static convertString(zodSchema) {
    const schema = { type: 'string' };
    const checks = zodSchema._def.checks || [];

    for (const check of checks) {
      switch (check.kind) {
        case 'min':
          schema.minLength = check.value;
          break;
        case 'max':
          schema.maxLength = check.value;
          break;
        case 'length':
          schema.minLength = check.value;
          schema.maxLength = check.value;
          break;
        case 'email':
          schema.format = 'email';
          break;
        case 'url':
          schema.format = 'uri';
          break;
        case 'uuid':
          schema.format = 'uuid';
          break;
        case 'cuid':
        case 'cuid2':
          schema.format = 'cuid';
          break;
        case 'ulid':
          schema.format = 'ulid';
          break;
        case 'regex':
          schema.pattern = check.regex.source;
          break;
        case 'datetime':
          schema.format = 'date-time';
          break;
        case 'date':
          schema.format = 'date';
          break;
        case 'time':
          schema.format = 'time';
          break;
        case 'ip':
          schema.format = check.version === 'v4' ? 'ipv4' : check.version === 'v6' ? 'ipv6' : 'ip';
          break;
      }
    }

    return schema;
  }

  /**
   * Convert Zod number to OpenAPI
   */
  static convertNumber(zodSchema) {
    const schema = { type: 'number', ...this.getNumberConstraints(zodSchema) };
    return schema;
  }

  /**
   * Get number constraints from checks
   */
  static getNumberConstraints(zodSchema) {
    const constraints = {};
    const checks = zodSchema._def.checks || [];

    for (const check of checks) {
      switch (check.kind) {
        case 'min':
          if (check.inclusive === false) {
            constraints.exclusiveMinimum = check.value;
          } else {
            constraints.minimum = check.value;
          }
          break;
        case 'max':
          if (check.inclusive === false) {
            constraints.exclusiveMaximum = check.value;
          } else {
            constraints.maximum = check.value;
          }
          break;
        case 'int':
          constraints.type = 'integer';
          break;
        case 'multipleOf':
          constraints.multipleOf = check.value;
          break;
      }
    }

    return constraints;
  }

  /**
   * Convert Zod object to OpenAPI
   */
  static convertObject(zodSchema) {
    const shape = zodSchema._def.shape();
    const properties = {};
    const required = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = this.convert(value);

      if (!this.isOptional(value)) {
        required.push(key);
      }
    }

    const schema = {
      type: 'object',
      properties,
    };

    if (required.length > 0) {
      schema.required = required;
    }

    // Handle passthrough/strict/catchall
    if (zodSchema._def.unknownKeys === 'passthrough') {
      schema.additionalProperties = true;
    } else if (zodSchema._def.unknownKeys === 'strict') {
      schema.additionalProperties = false;
    }

    return schema;
  }

  /**
   * Check if Zod schema is optional
   */
  static isOptional(zodSchema) {
    const typeName = zodSchema._def?.typeName;
    return typeName === 'ZodOptional' || typeName === 'ZodNullable' || typeName === 'ZodDefault';
  }
}

export default ZodToOpenAPI;
