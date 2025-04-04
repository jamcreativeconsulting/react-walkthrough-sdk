# Walkthrough SDK API Reference

## Authentication

All API requests require authentication using an API key and must come from an allowed origin.

### Headers
- `X-API-Key`: Your API key (required)
- `Origin`: The origin of your request (required)

### Error Responses
- `401`: Missing API key or origin
- `403`: Invalid API key or unauthorized origin
- `404`: Resource not found
- `400`: Invalid request data
- `500`: Server error

## Configuration

The backend service can be configured using environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `API_KEY` | Yes | - | API key for authentication |
| `ALLOWED_ORIGINS` | Yes | - | Comma-separated list of allowed origins |
| `PORT` | No | 3000 | Port to run the server on |
| `DATABASE_PATH` | No | ./data/walkthrough.db | Path to SQLite database file |

## Endpoints

### Walkthroughs

#### Create Walkthrough
```http
POST /api/walkthroughs
```

Request body:
```json
{
  "title": "string",
  "description": "string",
  "steps": [
    {
      "title": "string",
      "content": "string",
      "target": "string",
      "order": "number"
    }
  ]
}
```

Response:
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "steps": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "target": "string",
      "order": "number"
    }
  ],
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### List Walkthroughs
```http
GET /api/walkthroughs
```

Response:
```json
{
  "walkthroughs": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "steps": [
        {
          "id": "string",
          "title": "string",
          "content": "string",
          "target": "string",
          "order": "number"
        }
      ],
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

#### Get Walkthrough
```http
GET /api/walkthroughs/:id
```

Response:
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "steps": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "target": "string",
      "order": "number"
    }
  ],
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### Update Walkthrough
```http
PUT /api/walkthroughs/:id
```

Request body:
```json
{
  "title": "string",
  "description": "string",
  "steps": [
    {
      "title": "string",
      "content": "string",
      "target": "string",
      "order": "number"
    }
  ]
}
```

Response:
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "steps": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "target": "string",
      "order": "number"
    }
  ],
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### Delete Walkthrough
```http
DELETE /api/walkthroughs/:id
```

Response:
```json
{
  "success": true
}
```

### User Progress

#### Get User Progress
```http
GET /api/progress/:userId
```

Response:
```json
{
  "userId": "string",
  "progress": [
    {
      "walkthroughId": "string",
      "completed": "boolean",
      "currentStep": "number",
      "completedAt": "string"
    }
  ]
}
```

#### Update User Progress
```http
PUT /api/progress/:userId/:walkthroughId
```

Request body:
```json
{
  "completed": "boolean",
  "currentStep": "number"
}
```

Response:
```json
{
  "userId": "string",
  "walkthroughId": "string",
  "completed": "boolean",
  "currentStep": "number",
  "completedAt": "string"
}
```

### Analytics

#### Get Analytics
```http
GET /api/analytics
```

Query parameters:
- `startDate`: ISO date string
- `endDate`: ISO date string
- `walkthroughId`: (optional) Filter by walkthrough

Response:
```json
{
  "totalViews": "number",
  "completionRate": "number",
  "averageTimeSpent": "number",
  "walkthroughs": [
    {
      "id": "string",
      "title": "string",
      "views": "number",
      "completions": "number",
      "averageTimeSpent": "number"
    }
  ]
}
```

### Health Check

#### Get Health Status
```http
GET /api/health
```

Response:
```json
{
  "status": "string",
  "version": "string",
  "uptime": "number",
  "database": {
    "status": "string",
    "migrations": "number"
  }
}
``` 