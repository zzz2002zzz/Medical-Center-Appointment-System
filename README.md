# Medical Center Appointment System

A microservices-based hospital appointment booking system built with Spring Boot, an API Gateway, and a unified React client. The system supports patient registration, doctor browsing/search, and appointment booking with double-booking prevention.

## Architecture

```
                        ┌─────────────┐
                        │  Client App │  (React, port 3000)
                        └──────┬──────┘
                               │
                        ┌──────▼──────┐
                        │ API Gateway │  (port 8080)
                        │  - CORS     │
                        │  - JWT Auth │
                        │  - Rate     │
                        │    Limiting │
                        └──────┬──────┘
              ┌────────────────┼────────────────┐
       ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼───────────┐
       │  Patient    │  │   Doctor    │  │   Appointment     │
       │  Service    │  │   Service   │  │   Service         │
       │  (8081)     │  │   (8082)    │  │   (8083)          │
       └──────┬──────┘  └──────┬──────┘  └──────┬────────────┘
              │                │                 │
              └────────────────┼─────────────────┘
                                │
                         ┌──────▼──────┐
                         │   MongoDB   │  (port 27017)
                         │  3 databases │
                         └─────────────┘
```

- **Patient Service** (`patient-service`, port 8081) — patient registration and profile storage.
- **Doctor Service** (`doctor-service`, port 8082) — doctor listings, availability, and specialization search.
- **Appointment Service** (`appointment-service`, port 8083) — booking, cancellation, and cross-service validation of patient/doctor IDs. Prevents double-booking the same doctor at the same time.
- **API Gateway** (`api-gateway`, port 8080) — single entry point; issues JWTs on login, applies CORS rules, and enforces per-IP rate limiting.
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

## Running the system

1. Clone the repository:
```bash
git clone https://github.com/zzz2002zzz/Medical-Center-Appointment-System.git
cd Medical-Center-Appointment-System
```

2. Build and start everything with a single command:
```bash
docker compose up --build
```
   Or in detached mode:
```bash
docker compose up --build -d
```

3. Once all containers are running, open the client app:
```
http://localhost:3000
```

4. To stop everything:
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

## Authentication & API Keys

**Gateway login (JWT):**
```
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "username": "any-username",
  "password": "any-password"
}
```
Returns a JWT token. Include it as `Authorization: Bearer <token>` on all subsequent gateway requests — the gateway rejects requests without a valid token (except `/auth/login` itself).

**Backend service API key:**
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

## Example requests

Register a patient:
```bash
curl -X POST http://localhost:8081/patients/register \
  -H "X-API-KEY: demo-key-123" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","dob":"1990-05-14","contact":"555-0142","medicalHistorySummary":"No known allergies"}'
```

Search doctors by specialization:
```bash
curl "http://localhost:8082/doctors/search?specialization=Cardiology" \
  -H "X-API-KEY: demo-key-123"
```

Book an appointment:
```bash
curl -X POST http://localhost:8083/appointments/book \
  -H "X-API-KEY: demo-key-123" \
  -H "Content-Type: application/json" \
  -d '{"patientId":"<id>","doctorId":"<id>","dateTime":"2026-08-10T09:00:00"}'
```

## Key features beyond basic CRUD

- **Double-booking prevention** — the appointment service rejects a booking (`409 Conflict`) if the target doctor already has a confirmed appointment at the exact requested time.
- **Specialization search** — the doctor service exposes `/doctors/search?specialization=X` for filtered lookups instead of only listing all records.
- **Rate limiting** — the gateway throttles clients to 30 requests/minute per IP, returning `429 Too Many Requests` when exceeded.
- **JWT enforcement** — the gateway issues JWTs on login and validates them on every protected route before proxying to backend services; requests without a valid token are rejected with `401 Unauthorized`.

MIT License

Copyright (c) 2026 Chamudi Thamasha, Ravindya Shaw, Rashmi Shehara Sewmini

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
