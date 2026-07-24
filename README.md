# Geo Sales Tracking

Geo Sales Tracking is a full-stack real-time employee location tracking application built with **Spring Boot**, **React**, **PostgreSQL**, **WebSockets (STOMP)**, and **OpenStreetMap**.

The application enables field sales representatives to start journeys, continuously share GPS locations, manage customer visit checkpoints, and allows administrators to monitor active journeys in real time through an interactive dashboard.

---

# Features

## Employee Dashboard

- Start and complete journeys
- Real-time GPS location tracking
- Browser Geolocation support
- GPS Simulation mode for testing
- Destination marker and route visualization
- Live telemetry (speed, heading, coordinates, distance travelled)
- Customer checkpoint management

## Admin Dashboard

- Real-time employee monitoring
- Live STOMP WebSocket updates
- Route visualization on interactive maps
- Journey history playback
- Checkpoint status monitoring

---

# Technology Stack

## Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring WebSocket (STOMP)
- PostgreSQL
- Flyway
- Maven
- Swagger / OpenAPI

## Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Material UI
- React Leaflet
- STOMP.js
- SockJS

---

# Project Structure

```
geo-sales-track/
│
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
└── README.md
```

---

# Prerequisites

Before running the project, ensure the following software is installed:

- Java 21 or later
- Maven
- Node.js (v18 or later)
- npm
- PostgreSQL

---

# Database Configuration

Create a PostgreSQL database.

```
Database : sales_tracking
```

Configure the datasource inside:

```
backend/src/main/resources/application.properties
```

or use environment variables.

Example:

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/sales_tracking
export SPRING_DATASOURCE_USERNAME=postgres_username
export SPRING_DATASOURCE_PASSWORD=postgres_password
```

---

# Running the Backend

Navigate to the backend directory.

```bash
cd backend
```

Start the Spring Boot application.

```bash
./mvnw spring-boot:run
```

The backend will be available at:

```
http://localhost:8080
```

Swagger UI:

```
http://localhost:8080/swagger-ui.html
```

OpenAPI Documentation:

```
http://localhost:8080/v3/api-docs
```

---

# Running the Frontend

Open a new terminal.

Navigate to the frontend directory.

```bash
cd frontend
```

Install dependencies.

```bash
npm install
```

Start the development server.

```bash
npm run dev
```

The frontend will be available at:

```
http://localhost:3000
```

---

# Application Workflow

```
Employee Dashboard
        │
        ▼
Start Journey
        │
        ▼
Browser GPS / Simulation
        │
        ▼
REST API (Location Updates)
        │
        ▼
Spring Boot Backend
        │
        ├──────────────► PostgreSQL
        │
        ▼
STOMP WebSocket Broadcast
        │
        ▼
Admin Dashboard
```

---

# API Documentation

Interactive API documentation is available after starting the backend.

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI Specification: `http://localhost:8080/v3/api-docs`

---

# Future Enhancements

- Authentication & Authorization
- Role-based access control
- Multi-employee live tracking
- Geofencing
- Analytics dashboard
- Journey reports and exports
- Mobile application support