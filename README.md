# Team Management API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

A RESTful API built with NestJS and Prisma for managing users and teams with role-based access control.

## Features

- User management (CRUD operations)
- Team management (CRUD operations)
- Role-based access control
- User authentication (JWT)
- Team membership management
- Profile images support
- Unique aliases for users and teams

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- PostgreSQL database
- Prisma CLI (installed via npm/yarn)

## Project Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rafaelguerrae/nest-js-crud
   cd nest-js-crud
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials and other settings.

4. **Set up database**
   ```bash
   # Run database migrations
   npx prisma migrate dev
   
   # Generate Prisma client
   npx prisma generate
   ```

5. **Start the application**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## API Documentation

Once the application is running, you can access the API documentation at:
- Swagger UI: `http://localhost:3000/api`
- JSON Schema: `http://localhost:3000/api-json`

## Development

### Prisma

- After making changes to `schema.prisma`, run:
  ```bash
  npx prisma generate
  npx prisma migrate dev --name your_migration_name
  ```

### Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Data Model

```mermaid
erDiagram
    User ||--o{ UserOnTeam : "has many"
    Team ||--o{ UserOnTeam : "has many"
    
    User {
        Int id
        String alias
        String email
        String name
        String password
        String image
    }
    
    Team {
        Int id
        String alias
        String name
        String description
        String image
    }
    
    UserOnTeam {
        Int userId
        Int teamId
        String role
        DateTime joinedAt
    }
```

## Project Structure

```
src/
├── app.controller.ts          # Root controller
├── app.module.ts             # Root module
├── app.service.ts            # Root service
├── main.ts                   # Application entry point
├── database/                 # Database configuration
├── users/                    # User module
│   ├── dto/                  # Data transfer objects
│   ├── entities/             # TypeScript interfaces/types
│   ├── users.controller.ts   # User endpoints
│   ├── users.module.ts       # User module definition
│   └── users.service.ts      # User business logic
├── teams/                    # Team module
│   ├── dto/                  # Data transfer objects
│   ├── entities/             # TypeScript interfaces/types
│   ├── teams.controller.ts   # Team endpoints
│   ├── teams.module.ts       # Team module definition
│   └── teams.service.ts      # Team business logic
└── shared/                   # Shared utilities and types
```

## License

This project is [MIT licensed](LICENSE).

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
