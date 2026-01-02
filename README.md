# Express Backend Template

A production-ready Express.js backend template.

## 🌟 Features

- **Authentication System** - JWT-based auth with refresh tokens
- **Role-Based Access Control** - User, Admin, and Super Admin roles
- **Request Validation** - Zod schema validation
- **Error Handling** - Centralized error handling with custom error classes
- **Logging** - Pino logger with request context
- **Rate Limiting** - Configurable rate limiting
- **Database** - PostgreSQL with Knex query builder
- **Health Checks** - Ready for Kubernetes deployment

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- PostgreSQL >= 14
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd express-backend-template
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Create database**

```bash
createdb app_db
```

5. **Run migrations**

```bash
pnpm run migrate
```

6. **Seed database (optional)**

```bash
pnpm run seed
```

7. **Start the server**

```bash
# Development
pnpm run dev

# Production
pnpm start
```

### Using Docker

```bash
# Start with Docker Compose
docker-compose up -d

# Development with hot reload
docker-compose --profile dev up app-dev
```

## 📁 Project Structure

```
src/
├── config/             # Configuration files
│   ├── database.js     # Database connection
│   ├── env.js          # Environment validation
│   └── logger.js       # Pino logger setup
│
├── controllers/        # Route controllers
│   ├── AuthController.js
│   ├── HealthController.js
│   └── UserController.js
│
├── middlewares/        # Express middlewares
│   ├── auth.js         # Authentication & authorization
│   ├── errorHandler.js # Error handling
│   ├── rateLimiter.js  # Rate limiting
│   ├── requestLogger.js # Request logging
│   └── validate.js     # Request validation
│
├── migrations/         # Database migrations
├── models/             # Data models
│   ├── BaseModel.js    # Base model with CRUD + pagination
│   └── UserModel.js
│
├── routes/             # API routes
├── seeds/              # Database seeders
├── services/           # Business logic
├── utils/              # Utility functions
├── validators/         # Zod validation schemas
├── jobs/               # Cron jobs
│
├── app.js              # Express app setup
└── server.js           # Server entry point
```

## 🔧 Configuration

### Environment Variables

| Variable                 | Description               | Default       |
| ------------------------ | ------------------------- | ------------- |
| `NODE_ENV`               | Environment mode          | `development` |
| `PORT`                   | Server port               | `3000`        |
| `DATABASE_URL`           | PostgreSQL connection URL | -             |
| `DB_HOST`                | Database host             | `localhost`   |
| `DB_PORT`                | Database port             | `5432`        |
| `DB_NAME`                | Database name             | `app_db`      |
| `DB_USER`                | Database user             | `postgres`    |
| `DB_PASSWORD`            | Database password         | -             |
| `JWT_SECRET`             | JWT signing secret        | **Required**  |
| `JWT_EXPIRES_IN`         | Access token expiry       | `7d`          |
| `JWT_REFRESH_SECRET`     | Refresh token secret      | -             |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry      | `30d`         |
| `LOG_LEVEL`              | Logging level             | `info`        |
| `CORS_ORIGIN`            | Allowed CORS origins      | `*`           |

## 📚 API Endpoints

### Authentication

| Method | Endpoint                       | Description            |
| ------ | ------------------------------ | ---------------------- |
| POST   | `/api/v1/auth/register`        | Register new user      |
| POST   | `/api/v1/auth/login`           | Login user             |
| POST   | `/api/v1/auth/refresh`         | Refresh access token   |
| GET    | `/api/v1/auth/me`              | Get current user       |
| PATCH  | `/api/v1/auth/me`              | Update profile         |
| POST   | `/api/v1/auth/change-password` | Change password        |
| POST   | `/api/v1/auth/forgot-password` | Request password reset |
| POST   | `/api/v1/auth/reset-password`  | Reset password         |
| POST   | `/api/v1/auth/logout`          | Logout                 |

### Users (Admin)

| Method | Endpoint                       | Description     |
| ------ | ------------------------------ | --------------- |
| GET    | `/api/v1/users`                | List users      |
| POST   | `/api/v1/users`                | Create user     |
| GET    | `/api/v1/users/:id`            | Get user        |
| PATCH  | `/api/v1/users/:id`            | Update user     |
| DELETE | `/api/v1/users/:id`            | Delete user     |
| PATCH  | `/api/v1/users/:id/role`       | Update role     |
| POST   | `/api/v1/users/:id/activate`   | Activate user   |
| POST   | `/api/v1/users/:id/deactivate` | Deactivate user |

### Health

| Method | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| GET    | `/health`          | Basic health check    |
| GET    | `/health/detailed` | Detailed health check |
| GET    | `/health/ready`    | Readiness probe       |
| GET    | `/health/live`     | Liveness probe        |

## 🔐 Authentication

### Request Headers

```
Authorization: Bearer <access_token>
```

### Roles

| Role          | Permissions        |
| ------------- | ------------------ |
| `user`        | Basic user access  |
| `admin`       | User management    |
| `super_admin` | Full system access |

## 🗄️ Database

### Migrations

```bash
# Run migrations
pnpm run migrate

# Rollback last migration
pnpm run migrate:rollback

# Create new migration
pnpm run migrate:make <migration_name>
```

### Seeds

```bash
# Run seeds
pnpm run seed

# Create new seed
pnpm run seed:make <seed_name>
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## 📦 Scripts

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `pnpm start`    | Start production server                  |
| `pnpm dev`      | Start development server with hot reload |
| `pnpm test`     | Run tests                                |
| `pnpm lint`     | Run ESLint                               |
| `pnpm lint:fix` | Fix ESLint issues                        |
| `pnpm format`   | Format code with Prettier                |
| `pnpm migrate`  | Run database migrations                  |
| `pnpm seed`     | Seed database                            |

## 🐳 Docker

### Build and Run

```bash
# Build image
docker build -t express-backend .

# Run container
docker run -p 3000:3000 --env-file .env express-backend
```

### Docker Compose

```bash
# Production
docker-compose up -d

# Development with hot reload
docker-compose --profile dev up app-dev
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
