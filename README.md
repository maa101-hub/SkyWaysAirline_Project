# ✈️ SkyWays Airline — Flight Booking Platform

> A microservices-based airline booking system built by a collaborative team. The platform enables passengers to search and book flights, process payments, generate boarding passes, and receive real-time notifications — while giving administrators full control over flights, routes, schedules, and users.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Services Overview](#services-overview)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## Architecture

The system follows a **microservices architecture** with each service owning its own database and communicating via REST APIs and Apache Kafka for event-driven messaging.

```
                        ┌──────────────────────────────────┐
                        │     React SPA (Vite + React 19)  │
                        │     Port: 5173                   │
                        └──────┬───────┬───────┬───────────┘
                               │       │       │
              ┌────────────────┼───────┼───────┼────────────────┐
              │                │       │       │                │
     ┌────────▼──────┐  ┌─────▼─────┐ │ ┌─────▼──────┐        │
     │  User Service │  │  Flight   │ │ │  Booking   │        │
     │  (Auth, JWT,  │  │  Service  │ │ │  Service   │        │
     │   Wallet,     │  │  (CRUD,   │ │ │  (Reserve, │        │
     │   WebSocket)  │  │   Search) │ │ │   Pay,     │        │
     └───────┬───────┘  └─────┬─────┘ │ │   Cancel)  │        │
             │                │       │ └─────┬──────┘        │
             │                │       │       │               │
             └────────────────┼───────┼───────┼───────────────┘
                              │       │       │
                              ▼       ▼       ▼
                        ┌──────────────────────────┐
                        │       Apache Kafka       │
                        └────────────┬─────────────┘
                                     │
                        ┌────────────▼─────────────┐
                        │   Notification Service   │
                        │   (Email via Kafka)      │
                        └──────────────────────────┘
                                     │
                              ┌──────▼──────┐
                              │    MySQL    │
                              └─────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, React Router 7, Axios, React Toastify |
| **UI/Maps** | Leaflet, React-Leaflet, React Icons |
| **Backend** | Spring Boot 4.x, Java 17, Spring Security, Spring Data JPA |
| **Database** | MySQL 8.0 |
| **Authentication** | JWT (jjwt 0.11.5), Spring Security |
| **Payments** | Razorpay Payment Gateway |
| **Messaging** | Apache Kafka (event-driven notifications) |
| **Real-time** | WebSocket with STOMP (SockJS) |
| **Resilience** | Resilience4j (Circuit Breaker, Retry) |
| **Email** | Spring Mail |
| **PDF** | html2pdf.js (Boarding Pass generation) |
| **Build Tools** | Maven (backend), Vite (frontend) |
| **CI/CD** | GitHub Actions (Maven Package workflow) |
| **Code Quality** | ESLint, Lombok, AOP Logging |

---

## Features

### Passenger Features
- 🔍 **Flight Search** — Search flights by origin, destination, and date
- 🎫 **Booking** — Select seats, add passenger details, and confirm reservations
- 💳 **Payments** — Pay via Razorpay gateway or wallet balance
- 💰 **Wallet** — Top-up wallet with Razorpay, pay for bookings from balance
- 🎟️ **Boarding Pass** — Generate and download PDF boarding passes
- 📧 **Email Boarding Pass** — Send boarding pass directly to email
- 📋 **My Bookings** — View booking history and flight details
- ❌ **Cancel Booking** — Cancel reservations with refund processing
- 👤 **Profile Management** — Update personal details
- 🔔 **Real-time Notifications** — WebSocket-based live updates

### Admin Features
- 📊 **Dashboard Overview** — System metrics and statistics
- ✈️ **Flight Management** — Add, edit, delete flights
- 🗺️ **Route Management** — Create and manage flight routes with map view
- 📅 **Schedule Management** — Assign schedules to routes
- 👥 **User Management** — View and manage registered users
- 📑 **Booking Management** — Monitor all reservations
- 🔔 **Notifications Panel** — System-wide notification management

---

## Services Overview

### 🔐 User Service (`skywaysairline_userservice`)
| Responsibility | Details |
|---|---|
| Authentication | JWT-based login/signup with role-based access (ADMIN, USER) |
| User Management | Registration, profile updates, password management |
| Wallet | Balance management, top-up, deductions |
| WebSocket | Real-time push notifications to connected clients |

### ✈️ Flight Service (`flight-service`)
| Responsibility | Details |
|---|---|
| Flights | CRUD operations for flight records |
| Routes | Origin-destination route management |
| Schedules | Departure/arrival time scheduling |
| Search | Filter flights by criteria with seat availability |
| Security | JWT validation, admin-only write operations |

### 🎫 Booking Service (`booking-service`)
| Responsibility | Details |
|---|---|
| Reservations | Create, confirm, and cancel bookings |
| Payments | Razorpay order creation and verification |
| Wallet Payments | Deduct from user wallet for bookings |
| Tickets | Generate ticket responses with passenger details |
| Email | Send boarding pass attachments |
| Resilience | Circuit breaker for inter-service calls |

### 📧 Notification Service (`Notification-service`)
| Responsibility | Details |
|---|---|
| Kafka Consumer | Listens to booking/payment events |
| Email Dispatch | Sends confirmation and update emails via Spring Mail |

---

## API Reference

### Booking Service — `/api/booking`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create-order` | Create Razorpay payment order | JWT |
| POST | `/confirm` | Confirm booking after payment | JWT |
| POST | `/wallet/add` | Create wallet top-up order | JWT |
| POST | `/wallet/verify` | Verify wallet payment | JWT |
| POST | `/wallet/payment` | Pay for booking using wallet | JWT |
| GET | `/all` | Get all bookings (Admin) | JWT + ADMIN |
| GET | `/my-flights/{userId}` | Get user's booking history | JWT |
| POST | `/send-boarding-pass` | Email boarding pass PDF | JWT |
| DELETE | `/cancel/{reservationId}` | Cancel a booking | JWT |

### User Service — `/api/users`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Authenticate and get JWT | Public |
| GET | `/profile` | Get user profile | JWT |
| PUT | `/profile` | Update user profile | JWT |
| GET | `/wallet/balance` | Get wallet balance | JWT |

### Flight Service — `/api/flights`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/search` | Search available flights | JWT |
| GET | `/{id}` | Get flight details | JWT |
| POST | `/` | Create flight (Admin) | JWT + ADMIN |
| PUT | `/{id}` | Update flight (Admin) | JWT + ADMIN |
| DELETE | `/{id}` | Delete flight (Admin) | JWT + ADMIN |

> **Note:** Exact endpoint paths may vary. Refer to individual controller classes for the complete API surface.

---

## Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Java | 17+ | Backend runtime |
| Maven | 3.8+ | Backend build tool |
| Node.js | 18+ | Frontend runtime |
| npm | 9+ | Frontend package manager |
| MySQL | 8.0+ | Database |
| Apache Kafka | 3.x+ | Event messaging |

### 1. Clone the Repository

```bash
git clone https://github.com/maa101-hub/SkyWaysAirline_Project.git
cd SkyWaysAirline_Project
```

### 2. Database Setup

```sql
CREATE DATABASE skyways_users;
CREATE DATABASE skyways_flights;
CREATE DATABASE skyways_bookings;
```

### 3. Configure Environment

Update `application.properties` (or `application.yml`) in each service under `src/main/resources/`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/skyways_<service>
spring.datasource.username=<your_username>
spring.datasource.password=<your_password>
spring.jpa.hibernate.ddl-auto=update
```

### 4. Start Kafka

```bash
# Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka Broker
bin/kafka-server-start.sh config/server.properties
```

### 5. Start Backend Services

Start each service in a separate terminal:

```bash
# User Service
cd skywaysairline_userservice/skywaysairline_userservice
./mvnw spring-boot:run

# Flight Service
cd flight-service/flight-service
./mvnw spring-boot:run

# Booking Service
cd booking-service
./mvnw spring-boot:run

# Notification Service
cd Notification-service
./mvnw spring-boot:run
```

### 6. Start Frontend

```bash
cd "SkyWaysLine-frontend - Copy"
npm install
npm run dev
```

Access the application at **http://localhost:5173**

---

## Environment Variables

Each backend service requires the following configuration:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | MySQL connection URL | `jdbc:mysql://localhost:3306/skyways_bookings` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `****` |
| `JWT_SECRET` | Secret key for JWT signing | `your-256-bit-secret` |
| `RAZORPAY_KEY_ID` | Razorpay API key | `rzp_test_xxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | `****` |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka broker address | `localhost:9092` |
| `MAIL_HOST` | SMTP server | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USERNAME` | Email address | `noreply@skyways.com` |
| `MAIL_PASSWORD` | Email app password | `****` |

---

## Project Structure

```
SkyWaysAirline_Project/
│
├── booking-service/                    # Booking & Payment Microservice
│   └── src/main/java/.../bookingservice/
│       ├── controller/                 # REST endpoints
│       ├── service/                    # Business logic
│       ├── models/                     # JPA entities (Reservation, Passenger, Payment)
│       ├── dto/                        # Request/Response DTOs
│       ├── repo/                       # Spring Data repositories
│       ├── client/                     # Feign clients (Flight, User)
│       ├── security/                   # JWT filter, CORS config
│       ├── exception/                  # Custom exceptions & global handler
│       ├── aspect/                     # AOP logging
│       └── config/                     # App configuration
│
├── flight-service/                     # Flight Management Microservice
│   └── flight-service/src/main/java/.../flightservice/
│       ├── controller/
│       ├── service/
│       ├── models/
│       ├── dto/
│       ├── repo/
│       ├── client/
│       ├── security/
│       ├── exception/
│       └── aspect/
│
├── skywaysairline_userservice/         # User & Auth Microservice
│   └── skywaysairline_userservice/src/main/java/.../userservice/
│       ├── controller/
│       ├── service/
│       ├── model/
│       ├── dto/
│       ├── repo/
│       ├── security/
│       ├── exception/
│       └── aspect/
│
├── Notification-service/               # Kafka-driven Notification Service
│   └── src/main/java/.../notificationservice/
│       ├── consumer/                   # Kafka event consumers
│       └── service/                    # Email dispatch logic
│
├── SkyWaysLine-frontend - Copy/        # React Frontend Application
│   └── src/
│       ├── pages/
│       │   ├── admin/                  # Admin dashboard (flights, routes, schedules, users)
│       │   ├── Booking/                # Booking flow (search → pay → confirm)
│       │   ├── BoardingPass/           # PDF boarding pass generation
│       │   ├── common/                 # Login, SignUp
│       │   └── user/                   # Home, flight search, profile, wallet
│       ├── components/                 # Shared UI components
│       ├── context/                    # React context (auth, state)
│       ├── routes/                     # Route definitions
│       ├── utils/                      # Helper functions
│       └── api.jsx                     # Axios API configuration
│
├── .github/workflows/                  # CI/CD (GitHub Actions)
└── README.md
```

---

## Development Workflow

### Branch Strategy

```
main                    ← Production-ready code
├── develop             ← Integration branch
│   ├── feature/*       ← New features
│   ├── bugfix/*        ← Bug fixes
│   └── hotfix/*        ← Urgent production fixes
```

### Running Locally

1. Ensure MySQL and Kafka are running
2. Start all 4 backend services
3. Start the frontend dev server
4. Access at `http://localhost:5173`

### Build for Production

```bash
# Backend (each service)
./mvnw clean package -DskipTests

# Frontend
cd "SkyWaysLine-frontend - Copy"
npm run build
```

### Code Quality

- **Backend:** AOP-based logging across all services, structured exception handling
- **Frontend:** ESLint configured for React best practices
- **API:** Input validation via Jakarta Bean Validation (`@Valid`)

---

## Contributing

We follow a collaborative workflow. Please adhere to these guidelines:

### Getting Started

1. Clone the repository and set up your local environment
2. Create a feature branch from `develop`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes with clear, descriptive commits
4. Push and open a Pull Request against `develop`

### Commit Convention

```
feat: add wallet payment endpoint
fix: resolve JWT expiration issue
docs: update API reference
refactor: extract payment logic to service layer
style: format booking controller
```

### Pull Request Guidelines

- Provide a clear description of what changed and why
- Reference related issues if applicable
- Ensure all services compile without errors
- Test your changes locally before submitting
- Request review from at least one team member

### Code Standards

- Follow existing package structure and naming conventions
- Use DTOs for API request/response — never expose entities directly
- Add proper logging with SLF4J
- Handle exceptions with custom exception classes
- Validate all incoming request data

---

## Team

| Member | Role | Service Ownership |
|--------|------|-------------------|
| | Backend Developer | User Service |
| | Backend Developer | Flight Service |
| | Backend Developer | Booking Service |
| | Backend Developer | Notification Service |
| | Frontend Developer | React SPA |
| | Full Stack | Integration & DevOps |

> *Fill in team member names and roles as appropriate.*

---

## Roadmap

- [ ] API Gateway (Spring Cloud Gateway)
- [ ] Service Discovery (Eureka)
- [ ] Centralized Configuration (Spring Cloud Config)
- [ ] Docker Compose for local development
- [ ] Swagger/OpenAPI documentation for all services
- [ ] Unit and integration test coverage
- [ ] Deployment pipeline to cloud (AWS/Azure)
- [ ] Rate limiting and API throttling
- [ ] Flight status tracking with live updates

---

## License

This project is developed for educational and demonstration purposes as part of a team collaboration.

---

<p align="center">
  Built with ❤️ by the SkyWays Airline Team
</p>
