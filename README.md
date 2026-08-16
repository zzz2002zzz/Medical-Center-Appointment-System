# Medical Center Appointment System

A microservices-based hospital appointment booking system built with Spring Boot, an API Gateway, and a unified React client. The system supports patient registration, doctor browsing/search, and appointment booking with double-booking prevention.

## Table of Contents

- [Architecture](#architecture)
- [Team](#team)
- [Prerequisites](#prerequisites)
- [Running the System](#running-the-system)
- [API Documentation](#swagger-ui--api-documentation)
- [Authentication and API Keys](#authentication-and-api-keys)
- [Service Breakdown](#service-breakdown)
- [Example Requests](#example-requests)
- [Key Features](#key-features-beyond-basic-crud)
- [License](#license)

## Architecture

```
                          +-------------+
                          |  Client App |   (React, port 3000)
                          +------+------+
                                 |
                          +------v------+
                          | API Gateway |   (port 8080)
                          |  - CORS     |
                          |  - JWT Auth |
                          |  - OAuth2   |
                          |  - Rate     |
                          |    Limiting |
                          +------+------+
                 +----------------+----------------+
        +--------v-------+ +------v-------+ +-------v----------+
        |    Patient     | |   Doctor     | |   Appointment    |
        |    Service     | |   Service    | |   Service        |
        |    (8081)      | |   (8082)     | |   (8083)         |
        +--------+-------+ +------+-------+ +-------+----------+
                 |                |                 |
                 +----------------+-----------------+
                                  |
                           +------v------+
                           |   MongoDB   |   (port 27017)
                           | 3 databases |
                           +-------------+
```

- **Patient Service** (`patient-service`, port 8081) — patient registration and profile storage.
- **Doctor Service** (`doctor-service`, port 8082) — doctor listings, availability, and specialization search.
- **Appointment Service** (`appointment-service`, port 8083) — booking, cancellation, and cross-service validation of patient/doctor IDs. Prevents double-booking the same doctor at the same time.
- **API Gateway** (`api-gateway`, port 8080) — single entry point; issues JWTs on login (via `/auth/login` and the OAuth2 client credentials flow at `/oauth/token`), applies CORS rules, and enforces per-IP rate limiting.
- **Client App** (`client-app`, port 3000) — React frontend consuming all services through the gateway.
- **MongoDB** (port 27017) — one database per service: `patientdb`, `doctordb`, `appointmentdb`.

## Team

| Member | Service |
|---|---|
| Chamudi Thamasha | Patient Service + API Gateway |
| Ravindya Shaw | Doctor Service |
| Rashmi Shehara Sewmini | Appointment Service |

## Prerequisites

- Docker Desktop (with Docker Compose)
- Git

No local Java, Node, or Maven installation is required — everything builds inside containers.

## Running the System

**1. Clone the repository**

```bash
git clone https://github.com/zzz2002zzz/Medical-Center-Appointment-System.git
cd Medical-Center-Appointment-System
```

**2. Build and start everything with a single command**

```bash
docker compose up --build
```

Or in detached mode:

```bash
docker compose up --build -d
```

**3. Open the client app**

```
http://localhost:3000
```

**4. To stop everything**

```bash
docker compose down
```

## Swagger UI / API Documentation

Each backend microservice exposes interactive OpenAPI docs:

| Service | Swagger UI URL |
|---|---|
| Patient Service | http://localhost:8081/swagger-ui.html |
| Doctor Service | http://localhost:8082/swagger-ui.html |
| Appointment Service | http://localhost:8083/swagger-ui.html |

## Authentication and API Keys

The gateway supports two ways to obtain a JWT, plus a required API key on every backend call.

### Gateway login (JWT)

```
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "username": "any-username",
  "password": "any-password"
}
```

Returns a JWT token. Include it as `Authorization: Bearer <token>` on all subsequent gateway requests — the gateway rejects requests without a valid token (except `/auth/login` and `/oauth/token` themselves).

### OAuth2 client credentials grant

For service-to-service or client-based authentication, the gateway also implements the OAuth2 **Client Credentials Grant** (RFC 6749, Section 4.4):

```
POST http://localhost:8080/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=medical-center-client&client_secret=demo-client-secret-2026
```

Response:

```json
{
  "access_token": "<jwt>",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

The returned access token is used exactly the same way as a `/auth/login` token — as an `Authorization: Bearer <token>` header on subsequent gateway requests.

### Backend service API key

Every microservice endpoint also requires an API key header, whether called directly or through the gateway:

```
X-API-KEY: demo-key-123
```

## Service Breakdown

### Patient Service — Chamudi Thamasha

Manages patient registration and records (`patient-service`, port 8081, database `patientdb`).

| Method | Endpoint | Description |
|---|---|---|
| POST | `/patients/register` | Register a new patient |
| GET | `/patients` | List all patients |
| GET | `/patients/{id}` | Fetch a single patient by ID |
| PUT | `/patients/{id}` | Update a patient's record |

Patient model: `name`, `dob`, `contact`, `medicalHistorySummary`.

### Doctor Service — Ravindya Shaw

Manages doctor records and availability (`doctor-service`, port 8082, database `doctordb`).

| Method | Endpoint | Description |
|---|---|---|
| POST | `/doctors` | Create a new doctor record |
| GET | `/doctors` | List all doctors |
| GET | `/doctors/{id}` | Fetch a single doctor by ID |
| GET | `/doctors/{id}/availability` | Fetch a doctor's available time slots |
| GET | `/doctors/search?specialization=X` | Filter doctors by specialization (case-insensitive partial match) |

Doctor model: `name`, `specialization`, `availabilitySlots`.

### Appointment Service — Rashmi Shehara Sewmini

Manages appointment booking with cross-service validation (`appointment-service`, port 8083, database `appointmentdb`).

| Method | Endpoint | Description |
|---|---|---|
| POST | `/appointments/book` | Book an appointment (validates patient/doctor existence, rejects double-booking) |
| GET | `/appointments/{id}` | Fetch a single appointment by ID |
| PUT | `/appointments/{id}/cancel` | Cancel an appointment |
| GET | `/appointments?patientId=X` | List appointments, optionally filtered by patient |

Appointment model: `patientId`, `doctorId`, `dateTime`, `status`. Before booking, this service calls `patient-service` and `doctor-service` over HTTP to confirm the referenced IDs exist, and rejects the booking with `409 Conflict` if the target doctor already has a confirmed appointment at that exact time.

### API Gateway — Chamudi Thamasha

Single entry point for all client requests (`api-gateway`, port 8080).

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Issue a JWT for any non-empty username/password |
| POST | `/oauth/token` | OAuth2 client credentials grant — issue a JWT for a registered client ID/secret |
| ANY | `/patients/**`, `/doctors/**`, `/appointments/**` | Proxied through to the corresponding backend service |

Also applies CORS restrictions (only `http://localhost:3000` and `http://localhost:3001` are permitted origins) and rate limits each client IP to 30 requests/minute.

## Example Requests

**Register a patient**

```bash
curl -X POST http://localhost:8081/patients/register \
  -H "X-API-KEY: demo-key-123" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","dob":"1990-05-14","contact":"555-0142","medicalHistorySummary":"No known allergies"}'
```

**Search doctors by specialization**

```bash
curl "http://localhost:8082/doctors/search?specialization=Cardiology" \
  -H "X-API-KEY: demo-key-123"
```

**Book an appointment**

```bash
curl -X POST http://localhost:8083/appointments/book \
  -H "X-API-KEY: demo-key-123" \
  -H "Content-Type: application/json" \
  -d '{"patientId":"<id>","doctorId":"<id>","dateTime":"2026-08-10T09:00:00"}'
```

**Get an OAuth2 token**

```bash
curl -X POST http://localhost:8080/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=medical-center-client&client_secret=demo-client-secret-2026"
```

## Key Features Beyond Basic CRUD

- **Double-booking prevention** — the appointment service rejects a booking (`409 Conflict`) if the target doctor already has a confirmed appointment at the exact requested time.
- **Specialization search** — the doctor service exposes `/doctors/search?specialization=X` for filtered lookups instead of only listing all records.
- **Rate limiting** — the gateway throttles clients to 30 requests/minute per IP, returning `429 Too Many Requests` when exceeded.
- **JWT enforcement** — the gateway issues JWTs on login and validates them on every protected route before proxying to backend services; requests without a valid token are rejected with `401 Unauthorized`.
- **OAuth2 client credentials grant** — the gateway implements the standard OAuth2 client credentials flow (RFC 6749) at `/oauth/token`, issuing the same JWTs used by the rest of the system, for client-based rather than user-based authentication.

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.