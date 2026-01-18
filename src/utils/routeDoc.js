import { ZodToOpenAPI } from './zodToOpenAPI.js';

/**
 * Route Documentation Helper
 * Simple, unified API for documenting routes with auto-generated OpenAPI schemas
 *
 * @example
 * // In swagger.js, define your routes:
 * import { api } from '../utils/routeDoc.js';
 *
 * const routes = [
 *   api.post('/auth/login', {
 *     summary: 'Login user',
 *     tags: ['Auth'],
 *     body: authSchemas.login,
 *     response: { token: 'string', user: {} }
 *   }),
 * ];
 */

/**
 * Create a documented route definition
 */
const createRoute = (method, path, config) => {
  const {
    summary,
    description,
    tags = [],
    auth = false,
    body = null,
    query = null,
    params = null,
    response = null,
    responses = {},
  } = config;

  return {
    method: method.toLowerCase(),
    path,
    summary,
    description: description || summary,
    tags,
    auth,
    bodySchema: body,
    querySchema: query,
    paramsSchema: params,
    responseSchema: response,
    customResponses: responses,
  };
};

/**
 * Route helper methods
 */
export const api = {
  get: (path, config) => createRoute('GET', path, config),
  post: (path, config) => createRoute('POST', path, config),
  put: (path, config) => createRoute('PUT', path, config),
  patch: (path, config) => createRoute('PATCH', path, config),
  delete: (path, config) => createRoute('DELETE', path, config),
};

// Keep backward compatibility
export const getDoc = api.get;
export const postDoc = api.post;
export const putDoc = api.put;
export const patchDoc = api.patch;
export const deleteDoc = api.delete;

/**
 * Generate OpenAPI paths from route definitions
 */
export const generateDocs = (routes) => {
  const paths = {};

  for (const route of routes) {
    if (!paths[route.path]) {
      paths[route.path] = {};
    }

    paths[route.path][route.method] = generateOperation(route);
  }

  return paths;
};

/**
 * Generate OpenAPI operation object
 */
const generateOperation = (route) => {
  const operation = {
    summary: route.summary || `${route.method.toUpperCase()} ${route.path}`,
    description: route.description,
    tags: route.tags.length > 0 ? route.tags : ['Default'],
    operationId: generateOperationId(route.method, route.path),
  };

  // Security
  if (route.auth) {
    operation.security = [{ BearerAuth: [] }];
  }

  // Parameters
  const parameters = [];

  if (route.paramsSchema) {
    parameters.push(...generateParameters(route.paramsSchema, 'path'));
  }

  if (route.querySchema) {
    parameters.push(...generateParameters(route.querySchema, 'query'));
  }

  if (parameters.length > 0) {
    operation.parameters = parameters;
  }

  // Request body
  if (route.bodySchema && ['post', 'put', 'patch'].includes(route.method)) {
    operation.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: ZodToOpenAPI.convert(route.bodySchema),
        },
      },
    };
  }

  // Responses
  operation.responses = generateResponses(route);

  return operation;
};

/**
 * Generate operationId from method and path
 */
const generateOperationId = (method, path) => {
  const parts = path.split('/').filter(Boolean);
  const name = parts
    .map((p) => {
      if (p.startsWith('{')) return 'By' + p.slice(1, -1).charAt(0).toUpperCase() + p.slice(2, -1);
      return p.charAt(0).toUpperCase() + p.slice(1);
    })
    .join('');
  return method.toLowerCase() + name;
};

/**
 * Generate parameters from Zod schema
 */
const generateParameters = (zodSchema, location) => {
  const openApiSchema = ZodToOpenAPI.convert(zodSchema);
  const parameters = [];

  if (openApiSchema.properties) {
    for (const [name, schema] of Object.entries(openApiSchema.properties)) {
      parameters.push({
        name,
        in: location,
        required: openApiSchema.required?.includes(name) || location === 'path',
        schema,
        description: schema.description || undefined,
      });
    }
  }

  return parameters;
};

/**
 * Generate responses for a route
 */
const generateResponses = (route) => {
  const responses = {};

  // Success response
  const successCode = route.method === 'post' ? '201' : route.method === 'delete' ? '204' : '200';

  if (route.method === 'delete' && !route.responseSchema) {
    responses[successCode] = {
      description: 'Successfully deleted',
    };
  } else {
    responses[successCode] = {
      description: 'Successful operation',
      content: {
        'application/json': {
          schema: route.responseSchema
            ? generateResponseSchema(route.responseSchema)
            : { $ref: '#/components/schemas/Success' },
        },
      },
    };
  }

  // Auth error
  if (route.auth) {
    responses['401'] = {
      $ref: '#/components/responses/UnauthorizedError',
    };
    responses['403'] = {
      $ref: '#/components/responses/ForbiddenError',
    };
  }

  // Validation error
  if (route.bodySchema) {
    responses['422'] = {
      $ref: '#/components/responses/ValidationError',
    };
  }

  // Not found for routes with params
  if (route.paramsSchema) {
    responses['404'] = {
      $ref: '#/components/responses/NotFoundError',
    };
  }

  // Server error
  responses['500'] = {
    $ref: '#/components/responses/ServerError',
  };

  // Custom responses override
  Object.assign(responses, route.customResponses);

  return responses;
};

/**
 * Generate response schema wrapper
 */
const generateResponseSchema = (responseHint) => {
  if (typeof responseHint === 'object' && responseHint._def) {
    // It's a Zod schema
    return {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: ZodToOpenAPI.convert(responseHint),
      },
    };
  }

  // It's a simple object hint for documentation
  return {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: { type: 'object' },
    },
  };
};

export default {
  api,
  getDoc,
  postDoc,
  putDoc,
  patchDoc,
  deleteDoc,
  generateDocs,
};
