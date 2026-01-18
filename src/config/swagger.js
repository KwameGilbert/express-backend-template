import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';
import { authSchemas, userSchemas } from '../validators/schemas.js';
import { api, generateDocs } from '../utils/routeDoc.js';

/**
 * API Route Definitions
 * Define routes here with Zod schemas - documentation is auto-generated
 */
const routes = [
  // ============================================
  // Health Check Routes
  // ============================================
  api.get('/health', {
    summary: 'Basic health check',
    description: 'Returns basic health status of the API',
    tags: ['Health'],
    auth: false,
  }),

  api.get('/health/detailed', {
    summary: 'Detailed health check',
    description: 'Returns detailed health status including database and memory',
    tags: ['Health'],
    auth: false,
  }),

  api.get('/health/ready', {
    summary: 'Readiness check',
    description: 'Kubernetes readiness probe - checks if service is ready to accept traffic',
    tags: ['Health'],
    auth: false,
  }),

  api.get('/health/live', {
    summary: 'Liveness check',
    description: 'Kubernetes liveness probe - checks if service is alive',
    tags: ['Health'],
    auth: false,
  }),

  // ============================================
  // Authentication Routes
  // ============================================
  api.post('/auth/register', {
    summary: 'Register a new user',
    description: 'Create a new user account and receive JWT tokens',
    tags: ['Authentication'],
    body: authSchemas.register,
    auth: false,
    responses: {
      201: {
        description: 'User registered successfully',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AuthResponse' },
          },
        },
      },
      409: {
        description: 'User with this email already exists',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  }),

  api.post('/auth/login', {
    summary: 'Login user',
    description: 'Authenticate with email/password and receive JWT tokens',
    tags: ['Authentication'],
    body: authSchemas.login,
    auth: false,
    responses: {
      200: {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AuthResponse' },
          },
        },
      },
    },
  }),

  api.post('/auth/refresh', {
    summary: 'Refresh access token',
    description: 'Get a new access token using your refresh token',
    tags: ['Authentication'],
    body: authSchemas.refreshToken,
    auth: false,
  }),

  api.get('/auth/me', {
    summary: 'Get current user profile',
    description: 'Returns the authenticated user profile',
    tags: ['Authentication'],
    auth: true,
    responses: {
      200: {
        description: 'User profile',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      },
    },
  }),

  api.patch('/auth/me', {
    summary: 'Update current user profile',
    description: 'Update profile information (name, phone, avatar)',
    tags: ['Authentication'],
    body: authSchemas.updateProfile,
    auth: true,
  }),

  api.post('/auth/change-password', {
    summary: 'Change password',
    description: 'Change your current password',
    tags: ['Authentication'],
    body: authSchemas.changePassword,
    auth: true,
  }),

  api.post('/auth/forgot-password', {
    summary: 'Request password reset',
    description: 'Send a password reset link to your email',
    tags: ['Authentication'],
    body: authSchemas.forgotPassword,
    auth: false,
  }),

  api.post('/auth/reset-password', {
    summary: 'Reset password with token',
    description: 'Reset your password using the token from email',
    tags: ['Authentication'],
    body: authSchemas.resetPassword,
    auth: false,
  }),

  api.post('/auth/logout', {
    summary: 'Logout user',
    description: 'Invalidate your current session and blacklist token',
    tags: ['Authentication'],
    auth: true,
  }),

  api.get('/auth/verify-email', {
    summary: 'Verify email address',
    description: 'Verify email using the token sent to your email',
    tags: ['Authentication'],
    auth: false,
  }),

  api.post('/auth/resend-verification', {
    summary: 'Resend verification email',
    description: 'Resend email verification link',
    tags: ['Authentication'],
    body: authSchemas.forgotPassword,
    auth: false,
  }),

  // ============================================
  // User Management Routes
  // ============================================
  api.get('/users', {
    summary: 'List all users',
    description: 'Get a paginated list of users (admin only)',
    tags: ['Users'],
    query: userSchemas.listQuery,
    auth: true,
    responses: {
      200: {
        description: 'Paginated user list',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/PaginatedResponse' },
          },
        },
      },
    },
  }),

  api.post('/users', {
    summary: 'Create new user',
    description: 'Create a new user account (admin only)',
    tags: ['Users'],
    body: userSchemas.create,
    auth: true,
  }),

  api.get('/users/{id}', {
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID',
    tags: ['Users'],
    params: userSchemas.params,
    auth: true,
  }),

  api.patch('/users/{id}', {
    summary: 'Update user',
    description: 'Update user information (admin only)',
    tags: ['Users'],
    params: userSchemas.params,
    body: userSchemas.update,
    auth: true,
  }),

  api.delete('/users/{id}', {
    summary: 'Delete user',
    description: 'Soft delete a user (admin only)',
    tags: ['Users'],
    params: userSchemas.params,
    auth: true,
  }),

  api.patch('/users/{id}/role', {
    summary: 'Update user role',
    description: 'Change a user role (super_admin only)',
    tags: ['Users'],
    params: userSchemas.params,
    body: userSchemas.updateRole,
    auth: true,
  }),

  api.post('/users/{id}/activate', {
    summary: 'Activate user',
    description: 'Activate a suspended or inactive user (admin only)',
    tags: ['Users'],
    params: userSchemas.params,
    auth: true,
  }),

  api.post('/users/{id}/deactivate', {
    summary: 'Deactivate user',
    description: 'Deactivate a user account (admin only)',
    tags: ['Users'],
    params: userSchemas.params,
    auth: true,
  }),

  api.post('/users/{id}/suspend', {
    summary: 'Suspend user',
    description: 'Suspend a user account (admin only)',
    tags: ['Users'],
    params: userSchemas.params,
    auth: true,
  }),
];

/**
 * Swagger/OpenAPI Configuration
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: env.APP_NAME || 'Express Backend API',
      version: env.API_VERSION || '1.0.0',
      description: `
## Overview
Production-ready Express.js backend API with authentication, user management, and more.

## Authentication
This API uses JWT (JSON Web Tokens) for authentication. Include the token in the \`Authorization\` header:
\`\`\`
Authorization: Bearer <your_token>
\`\`\`

## Rate Limiting
- 100 requests per 15 minutes for most endpoints
- 5 requests per minute for auth endpoints (login, register)
      `,
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `/api/${env.API_VERSION}`,
        description: 'Current environment',
      },
      {
        url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
        description: 'Local development',
      },
    ],
    // Auto-generated paths from route definitions
    paths: generateDocs(routes),
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errors: {
              type: 'array',
              nullable: true,
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                accessToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                refreshToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  nullable: true,
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
            phone: { type: 'string', nullable: true, example: '+1234567890' },
            avatar: { type: 'string', format: 'uri', nullable: true },
            role: { type: 'string', enum: ['super_admin', 'admin', 'user'], example: 'user' },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              example: 'active',
            },
            email_verified_at: { type: 'string', format: 'date-time', nullable: true },
            last_login_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/User' },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 20 },
                total: { type: 'integer', example: 100 },
                totalPages: { type: 'integer', example: 5 },
                hasMore: { type: 'boolean', example: true },
              },
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'unhealthy'], example: 'healthy' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number', example: 3600 },
            environment: { type: 'string', example: 'production' },
            version: { type: 'string', example: 'v1' },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                message: 'Access token is required',
                timestamp: '2024-01-01T00:00:00.000Z',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'User does not have permission for this action',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                message: 'You do not have permission to access this resource',
                timestamp: '2024-01-01T00:00:00.000Z',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                message: 'Resource not found',
                timestamp: '2024-01-01T00:00:00.000Z',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error - check request body',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                message: 'Validation failed',
                errors: [
                  { field: 'email', message: 'Invalid email address' },
                  { field: 'password', message: 'Password must be at least 8 characters' },
                ],
                timestamp: '2024-01-01T00:00:00.000Z',
              },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                message: 'Something went wrong',
                timestamp: '2024-01-01T00:00:00.000Z',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check and monitoring endpoints',
      },
      {
        name: 'Authentication',
        description: 'User authentication, registration, and password management',
      },
      {
        name: 'Users',
        description: 'User management endpoints (admin)',
      },
    ],
  },
  apis: [], // No JSDoc scanning needed - we use programmatic definitions
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
export default swaggerSpec;
