@"
# Medical Center Appointment System

A microservices-based hospital appointment booking system built with Spring Boot, an API Gateway, and a unified client app.

## Architecture

- **Patient Service** — manages patient registration and profiles
- **Doctor Service** — manages doctor listings and availability
- **Appointment Service** — handles booking, cancellation, and validates patient/doctor IDs via inter-service calls
- **API Gateway** — single entry point with OAuth2, CORS, and rate limiting
- **Client App** — web frontend consuming all services through the gateway

## Team

| Member | Service |
|---|---|
| zzz2002zzz | Patient Service + API Gateway |
| Rashmi Shehara Sewmini | Doctor Service |
| Ravindya Shaw | Appointment Service |

## Prerequisites

- Java 17+
- Docker & Docker Compose
- Node.js (for client app)

## Running the system
