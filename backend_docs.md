# Ultimate Search API Backend Documentation

This document provides details on the backend RESTful API endpoints, their expected inputs, and authentication mechanisms.

## Authentication System

The application uses JSON Web Tokens (JWT) along with session tracking in the PostgreSQL database. This ensures that:
- Tokens expire automatically after 24 hours.
- A user can only be logged in on **one device at a time**.
- If a user logs in from a new device, any previous session tokens are immediately invalidated in the database.

> [!IMPORTANT]
> All protected endpoints require an `Authorization` header formatted as:
> `Authorization: Bearer <your-jwt-token>`

---

## Endpoints

### 1. Authentication

#### Create Account
- **Endpoint**: `POST /api/auth/signup`
- **Description**: Registers a new user account, creates a session token, and returns a JWT.
- **Body**: 
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "user": {
      "id": 1,
      "email": "user@example.com"
    }
  }
  ```

#### Log In
- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticates an existing user, updates their session token (invalidating previous logins), and returns a JWT.
- **Body**: 
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "email": "user@example.com"
    }
  }
  ```

#### Log Out
- **Endpoint**: `POST /api/auth/logout`
- **Description**: Clears the current session token in the database, requiring the user to authenticate again.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK):
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

---

### 2. Items Management

#### Get Paginated Items
- **Endpoint**: `GET /api/items`
- **Description**: Retrieves a paginated list of items belonging to the authenticated user.
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Number of items per page (default: 10)
- **Response** (200 OK):
  ```json
  {
    "items": [
      {
        "id": 1,
        "title": "Item title",
        "description": "Item description",
        "created_at": "2026-05-25T10:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pages": 10
  }
  ```

#### Search Items
- **Endpoint**: `GET /api/items/search`
- **Description**: Searches for items using a Bloom filter and text search based on the query.
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `q` (required): Search query
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Number of items per page (default: 10)
- **Response** (200 OK): Returns the same structure as `GET /api/items`.

#### Add Item
- **Endpoint**: `POST /api/items`
- **Description**: Creates a new item for the authenticated user.
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
  ```json
  {
    "title": "New Item",
    "description": "Optional description"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "message": "Item added successfully",
    "item": {
      "id": 1,
      "title": "New Item",
      "description": "Optional description",
      "user_id": 1
    }
  }
  ```

---

## Error Handling

If a request fails authentication (e.g., expired token or logged into another device), the server responds with a `401 Unauthorized` status:

```json
{
  "error": "Session expired or logged in from another device"
}
```

Other general errors return corresponding HTTP status codes (400, 404, 500) and an `error` message in the JSON payload.
