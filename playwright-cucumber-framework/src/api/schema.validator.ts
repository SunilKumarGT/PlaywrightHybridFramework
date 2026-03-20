import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

/**
 * JSON Schema validator using AJV for API response validation
 */
export class SchemaValidator {
  private readonly ajv: Ajv;
  private readonly schemaCache = new Map<string, ValidateFunction>();

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    // addFormats(this.ajv); // Uncomment when ajv-formats is installed
  }

  /**
   * Validate data against a JSON schema
   */
  validate(data: unknown, schema: object, schemaId?: string): { valid: boolean; errors: string[] } {
    let validate: ValidateFunction;

    if (schemaId && this.schemaCache.has(schemaId)) {
      validate = this.schemaCache.get(schemaId)!;
    } else {
      validate = this.ajv.compile(schema);
      if (schemaId) this.schemaCache.set(schemaId, validate);
    }

    const valid = validate(data);
    const errors: string[] = [];

    if (!valid && validate.errors) {
      validate.errors.forEach((err) => {
        errors.push(`${err.instancePath || 'root'} ${err.message}`);
      });
      logger.warn(`Schema validation failed:\n${errors.join('\n')}`);
    }

    return { valid: !!valid, errors };
  }

  /**
   * Assert data matches schema (throws on failure)
   */
  assertValid(data: unknown, schema: object, context = 'Response'): void {
    const { valid, errors } = this.validate(data, schema);
    if (!valid) {
      throw new Error(`${context} schema validation failed:\n${errors.join('\n')}`);
    }
    logger.debug(`✅ ${context} schema validated`);
  }
}

// ─── Common Schemas ─────────────────────────────────────────────────────────────

export const CommonSchemas = {
  paginatedList: {
    type: 'object',
    properties: {
      data: { type: 'array' },
      total: { type: 'number' },
      page: { type: 'number' },
      pageSize: { type: 'number' },
    },
    required: ['data', 'total'],
  },

  successResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', const: true },
      message: { type: 'string' },
    },
    required: ['success'],
  },

  errorResponse: {
    type: 'object',
    properties: {
      error: { type: 'string' },
      message: { type: 'string' },
      statusCode: { type: 'number' },
    },
    required: ['error'],
  },

  userSchema: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string', format: 'email' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      createdAt: { type: 'string' },
    },
    required: ['id', 'email'],
  },

  productSchema: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      price: { type: 'number', minimum: 0 },
    },
    required: ['id', 'name', 'price'],
  },
};
