# Timothy McQueen

**Entry-Level Software Engineer | Full-Stack & Backend Development | IT Operations Background**

I’m an entry-level software engineer with a professional IT operations background, focused on practical, maintainable systems. I build full-stack and backend applications with authentication, relational databases, APIs, automated testing, CI, and containerized workflows. My field-support experience gives me a strong debugging mindset and a practical understanding of users, reliability, and operational software.

## Selected Engineering Projects

### [FieldOps](https://github.com/timwmcqueen/FieldOps)
**Next.js · React · TypeScript · PostgreSQL · Prisma · Authentication · RBAC · Vitest · Docker · GitHub Actions**

A multi-user work-order operations platform built as my flagship portfolio application.

- bcrypt password authentication
- cryptographically random database-backed sessions
- HTTP-only session cookies
- Admin / Dispatcher / Technician role-based authorization
- server-side ownership and permission checks
- customer and technician work-order workflows
- server-enforced status transition rules
- operational dashboard metrics
- audit logging for privileged changes
- PostgreSQL relational model with indexes and foreign keys
- CI against a real PostgreSQL service
- Docker / Docker Compose
- architecture and security documentation

### [AssetLedger](https://github.com/timwmcqueen/AssetLedger)
**Python · FastAPI · SQLAlchemy · Pydantic · REST · Pytest · Docker · GitHub Actions**

An IT asset-lifecycle API for tracking devices from inventory through assignment, repair, and retirement.

- durable asset records with unique tags and serial numbers
- assignment, repair, and retirement lifecycle rules
- search and status filtering
- append-only audit history
- structured HTTP conflict/not-found responses
- API-level lifecycle tests
- Docker packaging and CI

### [SignalWatch](https://github.com/timwmcqueen/SignalWatch)
**TypeScript · Node.js · Fastify · PostgreSQL · Zod · Vitest · Docker · GitHub Actions**

An endpoint monitoring and incident service that checks HTTP services, records latency/history, and manages incident state.

- asynchronous endpoint checks with request timeouts
- concurrent background polling
- check history and latency collection
- incidents open after repeated failures
- automatic incident resolution after recovery
- PostgreSQL repository plus in-memory implementation
- unit/API tests and production TypeScript build verification

### [Shipping Quote API](https://github.com/timwmcqueen/ShippingCalculator)
**Java 21 · Spring Boot · REST · JPA · SQL · Flyway · JUnit · Docker · GitHub Actions**

A layered Java backend service with request validation, durable quote history, database migrations, integration tests, Docker, and CI.

### [RoadRate](https://github.com/timwmcqueen/Toll-Calculator)
**React · TypeScript · Vite · Vitest · Testing Library · Docker · GitHub Actions**

A responsive frontend application with typed domain logic, accessibility work, persistent browser state, unit tests, component tests, and production build verification.

### AtlasTek Solutions — Production Support Platform
**JavaScript · REST APIs · SQL/Data Workflows · Cloudflare**

Software supporting a real technology-services business, including support intake, ticket lookup and replies, technician/admin workflows, knowledge-base integration, operational tracking, and analytics.

**Live:** https://atlasteksolutions.com  
**Support application:** https://app.atlasteksolutions.com

## Reviewer Quick Start

All featured repositories include setup instructions and source code that can be run locally. The fastest technical review path is:

| Project | Verify locally | Good code-review entry points |
|---|---|---|
| [FieldOps](https://github.com/timwmcqueen/FieldOps) | `npm install && npm test && npm run build` | authentication/session handling, API authorization, Prisma data model, work-order state rules, audit logging, ADRs |
| [AssetLedger](https://github.com/timwmcqueen/AssetLedger) | `pip install -e ".[dev]" && pytest -q` | FastAPI routes, lifecycle service, SQLAlchemy models, audit history, API tests |
| [SignalWatch](https://github.com/timwmcqueen/SignalWatch) | `npm install && npm test && npm run build` | async endpoint checker, scheduler, incident rules, repository abstraction, PostgreSQL implementation |
| [Shipping Quote API](https://github.com/timwmcqueen/ShippingCalculator) | `mvn verify` | Spring controllers/services, JPA persistence, Flyway migration, validation/error handling, integration tests |
| [RoadRate](https://github.com/timwmcqueen/Toll-Calculator) | `npm install && npm test && npm run build` | React component structure, typed domain logic, accessibility, component tests |

GitHub Actions independently runs automated verification on the primary projects, and the CI badges in each repository show current build status.

## Engineering Skills Demonstrated Here

- full-stack TypeScript development
- Python / FastAPI backend development
- Java / Spring Boot backend development
- Node.js service development
- React application development
- authentication and session management
- role-based authorization
- REST API design and validation
- PostgreSQL / SQL data modeling
- database migrations and audit history
- asynchronous/background processing
- unit, integration, API, and component testing
- Git branches and pull-request workflow
- GitHub Actions CI
- Docker and Docker Compose
- responsive and accessible interfaces
- production troubleshooting and debugging

## Background

- Associate of Science in Information Technology
- Professional IT field-support experience
- Experience supporting users, devices, networks, and business technology
- Hands-on experience building and operating software for a real small business

## What I’m Looking For

I’m pursuing an **Entry-Level Software Engineer / Junior Software Developer** role where I can contribute to production software while continuing to grow across backend systems, full-stack development, testing, and application architecture.

## Contact

**Email:** timwmcqueen@gmail.com

---

`legacy/` folders are intentionally retained as a record of my learning progression. The projects above represent my current software-engineering work.
