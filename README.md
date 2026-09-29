# Timothy McQueen

**Entry-Level Software Engineer | Full-Stack & Backend Development | IT Operations Background**

I'm an entry-level software engineer coming from an IT support and operations background. A lot of the software I build comes from problems I've dealt with in real support work: tracking tickets, assigning work, managing devices, monitoring systems, and making it easier for people to get help. I enjoy backend and full-stack work, especially when there is a real workflow or business problem behind it.

## Projects

### [FieldOps](https://github.com/timwmcqueen/FieldOps)
**Next.js · React · TypeScript · PostgreSQL · Prisma · Vitest · Docker · GitHub Actions**

I built FieldOps to manage customer work orders, assign technicians, and track jobs from open to complete. It has separate Admin, Dispatcher, and Technician roles, login sessions, server-side permission checks, an audit log, tests, PostgreSQL, Docker, and CI.

### [RepoLens](https://github.com/timwmcqueen/Rock-paper-scissors)
**React · TypeScript · Vite · GitHub REST API · Vitest · GitHub Actions**

I built RepoLens so someone can paste any public GitHub repository and get a quick map of the codebase. It detects the stack, tests, CI, Docker setup, likely entry points, language mix, recent commits, and repository structure, then links straight back to the files on GitHub.

**Try it in the browser:** https://stackblitz.com/github/timwmcqueen/Rock-paper-scissors?startScript=dev

### [AssetLedger](https://github.com/timwmcqueen/AssetLedger)
**Python · FastAPI · SQLAlchemy · Pydantic · Pytest · Docker · GitHub Actions**

I built AssetLedger to track company computers and other IT equipment. Assets can be assigned, sent for repair, retired, searched, and filtered, and each asset keeps a history of what happened to it. The API is tested with Pytest and can be run with Docker.

### [SignalWatch](https://github.com/timwmcqueen/SignalWatch)
**TypeScript · Node.js · Fastify · PostgreSQL · Zod · Vitest · Docker · GitHub Actions**

I built SignalWatch to check web endpoints on a schedule and keep track of whether they are up, how long they take to respond, and when failures turn into incidents. After repeated failures it opens an incident, and when the service recovers it closes it. It supports PostgreSQL and an in-memory store for testing.

### [Shipping Quote API](https://github.com/timwmcqueen/ShippingCalculator)
**Java 21 · Spring Boot · JPA · Flyway · JUnit · Docker · GitHub Actions**

This started as a small Java shipping calculator. I rebuilt it as a Spring Boot API that validates requests, saves quotes to a database, handles money with BigDecimal, uses Flyway for database changes, and includes integration tests, Docker, and CI.

### [RoadRate](https://github.com/timwmcqueen/Toll-Calculator)
**React · TypeScript · Vite · Vitest · Testing Library · Docker · GitHub Actions**

RoadRate is a small React/TypeScript app for calculating toll rates. I used it to focus on frontend structure, responsive design, accessible form controls, saved recent estimates, component tests, and CI.

### AtlasTek Solutions
**JavaScript · REST APIs · SQL/Data Workflows · Cloudflare**

AtlasTek is my own tech support business, and I built software around the way I actually handle support work. The system includes customer ticket intake, ticket lookup and replies, technician/admin workflows, knowledge-base content, status tracking, and reporting.

**Live:** https://atlasteksolutions.com  
**Support application:** https://app.atlasteksolutions.com

## Running the Projects

Each project has its own setup instructions. These commands run the main checks locally:

| Project | Command |
|---|---|
| [FieldOps](https://github.com/timwmcqueen/FieldOps) | `npm install && npm test && npm run build` |
| [RepoLens](https://github.com/timwmcqueen/Rock-paper-scissors) | `npm install && npm test && npm run build` |
| [AssetLedger](https://github.com/timwmcqueen/AssetLedger) | `pip install -e ".[dev]" && pytest -q` |
| [SignalWatch](https://github.com/timwmcqueen/SignalWatch) | `npm install && npm test && npm run build` |
| [Shipping Quote API](https://github.com/timwmcqueen/ShippingCalculator) | `mvn verify` |
| [RoadRate](https://github.com/timwmcqueen/Toll-Calculator) | `npm install && npm test && npm run build` |

The main projects also run automated checks through GitHub Actions.

## Technical Skills

- TypeScript / JavaScript
- Java / Spring Boot
- Python / FastAPI
- React / Next.js
- Node.js / Fastify
- PostgreSQL / SQL
- REST APIs
- Authentication and role permissions
- Git / GitHub
- Automated testing
- GitHub Actions
- Docker / Docker Compose

## Background

- Associate Degree in Information Technology
- Professional IT support and operations experience
- Experience supporting users, devices, networks, and business applications
- Hands-on experience building software for my own small business

## What I'm Looking For

I'm looking for an **Entry-Level Software Engineer / Junior Software Developer** role where I can contribute to real software, keep learning from experienced engineers, and continue growing in backend and full-stack development.

## Contact

**Email:** timwmcqueen@gmail.com
