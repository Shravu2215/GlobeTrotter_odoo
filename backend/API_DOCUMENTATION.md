# GlobeTrotter Backend API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Endpoint**: `POST /api/auth/register` (or `POST /api/auth/signup`)
- **Auth**: None
- **Body**:
```json
{
  "firstName": "Alex",
  "lastName": "Rivera",
  "username": "alex_explorer",
  "email": "alex@example.com",
  "password": "Password123!",
  "phone": "+1-555-0199",
  "city": "San Francisco",
  "country": "United States",
  "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
  "language": "en"
}
```
- **cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alex",
    "lastName": "Rivera",
    "username": "alex_explorer",
    "email": "alex@example.com",
    "password": "Password123!",
    "phone": "+1-555-0199",
    "city": "San Francisco",
    "country": "United States"
  }'
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "firstName": "Alex",
      "lastName": "Rivera",
      "username": "alex_explorer",
      "email": "alex@example.com",
      "phone": "+1-555-0199",
      "city": "San Francisco",
      "country": "United States",
      "photo": null,
      "language": "en",
      "role": "USER",
      "createdAt": "2026-08-22T04:00:00.000Z",
      "updatedAt": "2026-08-22T04:00:00.000Z"
    }
  }
}
```

---

### 1.2 Login User
- **Endpoint**: `POST /api/auth/login`
- **Auth**: None
- **Body**:
```json
{
  "email": "alex@example.com",
  "password": "Password123!"
}
```
- **cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@example.com",
    "password": "Password123!"
  }'
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "firstName": "Alex",
      "lastName": "Rivera",
      "username": "alex_explorer",
      "email": "alex@example.com",
      "role": "USER"
    }
  }
}
```

---

### 1.3 Get Current Profile (Me)
- **Endpoint**: `GET /api/users/me`
- **Auth**: Bearer `<JWT_TOKEN>`
- **cURL**:
```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "firstName": "Alex",
      "lastName": "Rivera",
      "username": "alex_explorer",
      "email": "alex@example.com",
      "language": "en",
      "role": "USER"
    }
  }
}
```

---

## 2. Trips Endpoints

### 2.1 Create Trip
- **Endpoint**: `POST /api/trips`
- **Auth**: Bearer `<JWT_TOKEN>`
- **Body**:
```json
{
  "name": "European Grand Tour 2026",
  "description": "2-week journey across Paris, Rome, and Barcelona",
  "coverPhoto": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
  "startDate": "2026-09-01T00:00:00.000Z",
  "endDate": "2026-09-15T00:00:00.000Z",
  "isPublic": false
}
```
- **cURL**:
```bash
curl -X POST http://localhost:5000/api/trips \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "European Grand Tour 2026",
    "description": "2-week journey across Paris, Rome, and Barcelona",
    "startDate": "2026-09-01T00:00:00.000Z",
    "endDate": "2026-09-15T00:00:00.000Z",
    "isPublic": false
  }'
```

---

### 2.2 List My Trips
- **Endpoint**: `GET /api/trips`
- **Auth**: Bearer `<JWT_TOKEN>`
- **cURL**:
```bash
curl -X GET http://localhost:5000/api/trips \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2.3 Get Trip by ID
- **Endpoint**: `GET /api/trips/:id`
- **Auth**: Bearer `<JWT_TOKEN>`
- **cURL**:
```bash
curl -X GET http://localhost:5000/api/trips/TRIP_UUID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2.4 Update Trip
- **Endpoint**: `PATCH /api/trips/:id`
- **Auth**: Bearer `<JWT_TOKEN>`
- **Body**:
```json
{
  "name": "European Summer Journey 2026",
  "description": "Updated itinerary with scenic rail routes"
}
```
- **cURL**:
```bash
curl -X PATCH http://localhost:5000/api/trips/TRIP_UUID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "European Summer Journey 2026"}'
```

---

### 2.5 Delete Trip
- **Endpoint**: `DELETE /api/trips/:id`
- **Auth**: Bearer `<JWT_TOKEN>`
- **cURL**:
```bash
curl -X DELETE http://localhost:5000/api/trips/TRIP_UUID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 3. Sections & Activities (Itinerary Builder)

### 3.1 Add Section to Trip
- **Endpoint**: `POST /api/trips/:tripId/sections`
- **Auth**: Bearer `<JWT_TOKEN>`
- **Body**:
```json
{
  "cityId": "CITY_UUID_HERE",
  "startDate": "2026-09-01T00:00:00.000Z",
  "endDate": "2026-09-06T00:00:00.000Z",
  "budget": 850.00
}
```
- **cURL**:
```bash
curl -X POST http://localhost:5000/api/trips/TRIP_UUID_HERE/sections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cityId": "CITY_UUID_HERE",
    "startDate": "2026-09-01T00:00:00.000Z",
    "endDate": "2026-09-06T00:00:00.000Z",
    "budget": 850.00
  }'
```

---

### 3.2 Update Section
- **Endpoint**: `PATCH /api/sections/:id`
- **Auth**: Bearer `<JWT_TOKEN>`
- **Body**:
```json
{
  "budget": 950.00,
  "endDate": "2026-09-07T00:00:00.000Z"
}
```
- **cURL**:
```bash
curl -X PATCH http://localhost:5000/api/sections/SECTION_UUID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"budget": 950.00}'
```

---

### 3.3 Delete Section
- **Endpoint**: `DELETE /api/sections/:id`
- **Auth**: Bearer `<JWT_TOKEN>`
- **cURL**:
```bash
curl -X DELETE http://localhost:5000/api/sections/SECTION_UUID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3.4 Reorder Sections
- **Endpoint**: `PATCH /api/trips/:tripId/sections/reorder`
- **Auth**: Bearer `<JWT_TOKEN>`
- **Body**:
```json
{
  "sectionIds": [
    "SECTION_UUID_2",
    "SECTION_UUID_1"
  ]
}
```
- **cURL**:
```bash
curl -X PATCH http://localhost:5000/api/trips/TRIP_UUID_HERE/sections/reorder \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionIds": ["SECTION_UUID_2", "SECTION_UUID_1"]
  }'
```

---

### 3.5 Assign Activity to Section
- **Endpoint**: `POST /api/sections/:sectionId/activities`
- **Auth**: Bearer `<JWT_TOKEN>`
- **Body**:
```json
{
  "activityId": "ACTIVITY_UUID_HERE",
  "scheduledDate": "2026-09-02T10:00:00.000Z"
}
```
- **cURL**:
```bash
curl -X POST http://localhost:5000/api/sections/SECTION_UUID_HERE/activities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activityId": "ACTIVITY_UUID_HERE",
    "scheduledDate": "2026-09-02T10:00:00.000Z"
  }'
```

---

### 3.6 Remove Activity from Section
- **Endpoint**: `DELETE /api/sections/:sectionId/activities/:sectionActivityId`
- **Auth**: Bearer `<JWT_TOKEN>`
- **cURL**:
```bash
curl -X DELETE http://localhost:5000/api/sections/SECTION_UUID/activities/SECTION_ACTIVITY_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 4. City & Activity Search (Public)

### 4.1 Search Cities
- **Endpoint**: `GET /api/cities?search=&country=`
- **Auth**: None
- **cURL**:
```bash
curl -X GET "http://localhost:5000/api/cities?search=Paris"
```

---

### 4.2 Search City Activities
- **Endpoint**: `GET /api/cities/:cityId/activities?type=&category=&maxCost=`
- **Auth**: None
- **cURL**:
```bash
curl -X GET "http://localhost:5000/api/cities/CITY_UUID/activities?category=ACTIVITIES&maxCost=100"
```

---

## 5. Itinerary View & Budget Analytics

### 5.1 Get Complete Nested Itinerary & Budget
- **Endpoint**: `GET /api/trips/:tripId/itinerary`
- **Auth**: Bearer `<JWT_TOKEN>` (or public if published)
- **cURL**:
```bash
curl -X GET http://localhost:5000/api/trips/TRIP_UUID_HERE/itinerary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
- **Response Structure (200 OK)**:
```json
{
  "success": true,
  "data": {
    "itinerary": {
      "id": "trip-uuid",
      "name": "European Grand Tour 2026",
      "startDate": "2026-09-01T00:00:00.000Z",
      "endDate": "2026-09-15T00:00:00.000Z",
      "isPublic": false,
      "totalBudget": 1800.00,
      "totalSpent": 1540.00,
      "overBudget": false,
      "categoryBreakdown": {
        "TRANSPORT": 150.00,
        "STAY": 850.00,
        "ACTIVITIES": 340.00,
        "MEALS": 200.00
      },
      "categoryBreakdownList": [
        { "category": "TRANSPORT", "amount": 150.00, "percentage": 9.7 },
        { "category": "STAY", "amount": 850.00, "percentage": 55.2 },
        { "category": "ACTIVITIES", "amount": 340.00, "percentage": 22.1 },
        { "category": "MEALS", "amount": 200.00, "percentage": 13.0 }
      ],
      "sections": [
        {
          "id": "section-1-uuid",
          "order": 0,
          "budget": 900.00,
          "spent": 820.00,
          "overBudget": false,
          "city": { "name": "Paris", "country": "France" },
          "activities": [
            {
              "id": "sa-uuid-1",
              "scheduledDate": "2026-09-02T10:00:00.000Z",
              "costSnapshot": 38.00,
              "activity": {
                "name": "Eiffel Tower Summit Access & Tour",
                "category": "ACTIVITIES"
              }
            }
          ]
        }
      ]
    }
  }
}
```

---

## 6. Profile Management

### 6.1 Update Profile
- **Endpoint**: `PATCH /api/users/me`
- **Auth**: Bearer `<JWT_TOKEN>`
- **Body**:
```json
{
  "firstName": "Alexander",
  "city": "New York",
  "language": "en"
}
```
- **cURL**:
```bash
curl -X PATCH http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Alexander", "city": "New York"}'
```

---

## 7. Publish & Community

### 7.1 Publish Trip
- **Endpoint**: `PATCH /api/trips/:tripId/publish`
- **Auth**: Bearer `<JWT_TOKEN>`
- **cURL**:
```bash
curl -X PATCH http://localhost:5000/api/trips/TRIP_UUID/publish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7.2 Get Public Trip by Share Slug
- **Endpoint**: `GET /api/public/trips/:slug`
- **Auth**: None
- **cURL**:
```bash
curl -X GET http://localhost:5000/api/public/trips/european-grand-tour-2026-a1b2
```

### 7.3 Community Feed
- **Endpoint**: `GET /api/public/trips?search=&sort=`
- **Auth**: None
- **cURL**:
```bash
curl -X GET "http://localhost:5000/api/public/trips?sort=recent"
```

### 7.4 Clone/Copy Public Trip
- **Endpoint**: `POST /api/public/trips/:slug/copy`
- **Auth**: Bearer `<JWT_TOKEN>`
- **cURL**:
```bash
curl -X POST http://localhost:5000/api/public/trips/european-grand-tour-2026-a1b2/copy \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 8. Admin Statistics

### 8.1 Get Platform Stats
- **Endpoint**: `GET /api/admin/stats`
- **Auth**: Bearer `<ADMIN_JWT_TOKEN>` (role: ADMIN)
- **cURL**:
```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

## 9. Real-Time Socket.io Events

Connect to `http://localhost:5000` via Socket.io:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

// Join trip room
socket.emit("join_trip", tripId);

// Listen to real-time events
socket.on("trip:updated", (trip) => { /* Update UI state */ });
socket.on("section:created", (section) => { /* Append section */ });
socket.on("section:updated", (section) => { /* Update section */ });
socket.on("section:deleted", ({ sectionId }) => { /* Remove section */ });
socket.on("sections:reordered", ({ sections }) => { /* Re-render order */ });
socket.on("activity:assigned", ({ sectionId, sectionActivity }) => { /* Update budget/activities */ });
socket.on("activity:removed", ({ sectionId, sectionActivityId }) => { /* Update budget/activities */ });
```
