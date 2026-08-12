\# Medical Center Appointment System



A microservices-based hospital appointment booking system built with Spring Boot, an API Gateway, and a unified React client. The system supports patient registration, doctor browsing/search, and appointment booking with double-booking prevention.



\## Architecture



```

&#x20;                       ┌─────────────┐

&#x20;                       │  Client App │  (React, port 3000)

&#x20;                       └──────┬──────┘

&#x20;                              │

&#x20;                       ┌──────▼──────┐

&#x20;                       │ API Gateway │  (port 8080)

&#x20;                       │  - CORS     │

&#x20;                       │  - JWT Auth │

&#x20;                       │  - Rate     │

&#x20;                       │    Limiting │

&#x20;                       └──────┬──────┘

&#x20;             ┌────────────────┼────────────────┐

&#x20;      ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼───────────┐

&#x20;      │  Patient    │  │   Doctor    │  │   Appointment     │

&#x20;      │  Service    │  │   Service   │  │   Service         │

&#x20;      │  (8081)     │  │   (8082)    │  │   (8083)          │

&#x20;      └──────┬──────┘  └──────┬──────┘  └──────┬────────────┘

&#x20;             │                │                 │

&#x20;             └────────────────┼─────────────────┘

&#x20;                               │

&#x20;                        ┌──────▼──────┐

&#x20;                        │   MongoDB   │  (port 27017)

&#x20;                        │  3 databases │

&#x20;                        └─────────────┘

```



\- \*\*Patient Service\*\* (`patient-service`, port 8081) — patient registration and profile storage.

\- \*\*Doctor Service\*\* (`doctor-service`, port 8082) — doctor listings, availability, and specialization search.

\- \*\*Appointment Service\*\* (`appointment-service`, port 8083) — booking, cancellation, and cross-service validation of patient/doctor IDs. Prevents double-booking the same doctor at the same time.

\- \*\*API Gateway\*\* (`api-gateway`, port 8080) — single entry point; issues JWTs on login, applies CORS rules, and enforces per-IP rate limiting.

\- \*\*Client App\*\* (`client-app`, port 3000) — React frontend consuming all services through the gateway.

\- \*\*MongoDB\*\* (port 27017) — one database per service: `patientdb`, `doctordb`, `appointmentdb`.



\## Team



| Member | Service |

|---|---|

| Chamudi Thamasha | Patient Service + API Gateway |

| Ravindya Shaw | Doctor Service |

| Rashmi Shehara Sewmini | Appointment Service |



\## Prerequisites



\- Docker Desktop (with Docker Compose)

\- Git



No local Java, Node, or Maven installation is required — everything builds inside containers.



\## Running the system



1\. Clone the repository:

```bash

&#x20;  git clone https://github.com/zzz2002zzz/Medical-Center-Appointment-System.git

&#x20;  cd Medical-Center-Appointment-System

```



2\. Build and start everything with a single command:

```bash

&#x20;  docker compose up --build

```

&#x20;  Or in detached mode:

```bash

&#x20;  docker compose up --build -d

```



3\. Once all containers are running, open the client app:

```

&#x20;  http://localhost:3000

```



4\. To stop everything:

```bash

&#x20;  docker compose down

```



\## Swagger UI / API Documentation



Each backend microservice exposes interactive OpenAPI docs:



| Service | Swagger UI URL |

|---|---|

| Patient Service | http://localhost:8081/swagger-ui.html |

| Doctor Service | http://localhost:8082/swagger-ui.html |

| Appointment Service | http://localhost:8083/swagger-ui.html |



\## Authentication \& API Keys



\*\*Gateway login (JWT):\*\*

```

POST http://localhost:8080/auth/login

Content-Type: application/json



{

&#x20; "username": "any-username",

&#x20; "password": "any-password"

}

```

Returns a JWT token used for subsequent authenticated requests to the gateway.



\*\*Backend service API key:\*\*

Every microservice endpoint requires an API key header on direct calls:

```

X-API-KEY: demo-key-123

```



\## Example requests



Register a patient:

```bash

curl -X POST http://localhost:8081/patients/register \\

&#x20; -H "X-API-KEY: demo-key-123" \\

&#x20; -H "Content-Type: application/json" \\

&#x20; -d '{"name":"John Doe","dob":"1990-05-14","contact":"555-0142","medicalHistorySummary":"No known allergies"}'

```



Search doctors by specialization:

```bash

curl "http://localhost:8082/doctors/search?specialization=Cardiology" \\

&#x20; -H "X-API-KEY: demo-key-123"

```



Book an appointment:

```bash

curl -X POST http://localhost:8083/appointments/book \\

&#x20; -H "X-API-KEY: demo-key-123" \\

&#x20; -H "Content-Type: application/json" \\

&#x20; -d '{"patientId":"<id>","doctorId":"<id>","dateTime":"2026-08-10T09:00:00"}'

```



\## Key features beyond basic CRUD



\- \*\*Double-booking prevention\*\* — the appointment service rejects a booking (`409 Conflict`) if the target doctor already has a confirmed appointment at the exact requested time.

\- \*\*Specialization search\*\* — the doctor service exposes `/doctors/search?specialization=X` for filtered lookups instead of only listing all records.

\- \*\*Rate limiting\*\* — the gateway throttles clients to 30 requests/minute per IP, returning `429 Too Many Requests` when exceeded.

