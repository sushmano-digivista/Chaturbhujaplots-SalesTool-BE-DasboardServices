# Dashboard Service — Anjana Paradise Platform

Microservice responsible for **project content management (CMS)** and **customer lead capture** for the Anjana Paradise real estate platform.

## Tech Stack
- Java 17 · Spring Boot 3.2
- MongoDB (content + leads)
- Spring Security + JWT (admin endpoints)

## Port
`8082`

## API Endpoints

### Public (no auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/v1/content` | Full project content (hero, highlights, amenities, distances, quote, contact) |
| `POST` | `/api/v1/leads` | Submit customer enquiry |
| `POST` | `/api/v1/auth/login` | Admin login → returns JWT |

### Admin (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT`  | `/api/v1/content` | Replace full content |
| `PATCH`| `/api/v1/content/hero` | Update hero section only |
| `PATCH`| `/api/v1/content/highlights` | Update location highlights |
| `PATCH`| `/api/v1/content/amenities` | Update amenities list |
| `PATCH`| `/api/v1/content/distances` | Update distance cards |
| `PATCH`| `/api/v1/content/quote` | Update investment quote |
| `PATCH`| `/api/v1/content/contact` | Update contact / WhatsApp number |
| `GET`  | `/api/v1/leads` | List all leads |
| `GET`  | `/api/v1/leads/stats` | Lead pipeline stats |
| `PATCH`| `/api/v1/leads/{id}` | Update lead status / notes |
| `DELETE`| `/api/v1/leads/{id}` | Delete lead |

## Default Admin Credentials
```
username: admin
password: Dashboard@123
```
> Change these in `SecurityConfig.java` before deploying to production.

## Running Locally

```bash
# Prerequisites: Java 17, Maven 3.9+, MongoDB on localhost:27017

mvn spring-boot:run
```

Content is **auto-seeded** with Anjana Paradise defaults on first startup.

## Running Tests

```bash
mvn test                                              # all tests
mvn test -Dtest=LeadServiceTest                       # unit only
mvn test -Dtest=DashboardServiceIntegrationTest       # integration only
mvn test jacoco:report                                # with coverage
```

## Docker

```bash
docker build -t anjana-dashboard-service .
docker run -p 8082:8082 \
  -e SPRING_DATA_MONGODB_URI=mongodb://host.docker.internal:27017/anjana_dashboard \
  -e APP_JWT_SECRET=YourSecretKey \
  anjana-dashboard-service
```

## Configuration

| Property | Default | Description |
|----------|---------|-------------|
| `spring.data.mongodb.uri` | `mongodb://localhost:27017/anjana_dashboard` | MongoDB connection |
| `app.jwt.secret` | (long key) | JWT signing key — change in production |
| `app.jwt.expiration-ms` | `86400000` | Token lifetime (24h) |
| `app.cors.allowed-origins` | `http://localhost:3000,...` | Allowed CORS origins |

## Project Structure

```
src/
├── main/java/com/anjana/dashboard/
│   ├── DashboardServiceApplication.java
│   ├── config/SecurityConfig.java          ← JWT filter + Spring Security
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── ContentController.java
│   │   └── LeadController.java
│   ├── model/
│   │   ├── Lead.java
│   │   └── ProjectContent.java             ← singleton CMS document
│   ├── repository/
│   │   └── LeadRepository.java
│   └── service/
│       ├── ContentService.java             ← auto-seeds default content
│       └── LeadService.java
└── test/java/com/anjana/dashboard/
    ├── DashboardServiceIntegrationTest.java
    ├── controller/ContentControllerTest.java
    ├── controller/LeadControllerTest.java
    ├── repository/LeadRepositoryTest.java
    ├── service/ContentServiceTest.java
    └── service/LeadServiceTest.java
```

## Part of Anjana Paradise Platform

| Service | Port | Repo |
|---------|------|------|
| common-service | 8081 | Chaturbhujaplots-SalesTool-BE-CommonServices |
| **dashboard-service** | 8082 | ← this repo |
| plot-service | 8083 | Chaturbhujaplots-SalesTool-BE-PlotServices |
| customer-frontend | 3000 | Chaturbhujaplots-SalesTool-FE-CustomerTool |