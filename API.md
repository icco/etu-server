# Etu Server API Documentation

This document provides comprehensive documentation for the Etu Server REST API. The API allows you to programmatically create, read, update, and delete notes and tags.

## Base URL

```
https://your-etu-server.com/api/v1
```

For local development:
```
http://localhost:3000/api/v1
```

## Authentication

All API endpoints require authentication using an API key. You can generate an API key from the Settings page in the web interface.

### Using API Keys

Include your API key in the `Authorization` header of every request:

```bash
Authorization: etu_your_api_key_here
```

### Example Authentication

```bash
curl -H "Authorization: etu_1234567890abcdef..." \
  https://your-etu-server.com/api/v1/notes
```

### Generating API Keys

1. Log in to the web interface
2. Navigate to Settings
3. Click "Generate New API Key"
4. Give your key a name (e.g., "CLI", "Mobile App")
5. Copy the generated key immediately (it will only be shown once)

## Response Format

All API responses are returned as JSON with the following general structure:

### Success Response
```json
{
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message here"
}
```

## HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid API key
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Endpoints

### Notes

#### List Notes

Get a list of notes with optional filtering.

**Endpoint:** `GET /api/v1/notes`

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `search` | string | Search notes by content (case-insensitive) | - |
| `tags` | string | Comma-separated list of tags to filter by | - |
| `start_date` | ISO 8601 date | Filter notes created after this date | - |
| `end_date` | ISO 8601 date | Filter notes created before this date | - |
| `limit` | integer | Maximum number of notes to return (max 100) | 50 |
| `offset` | integer | Number of notes to skip for pagination | 0 |

**Response:**

```json
{
  "notes": [
    {
      "id": "abc123",
      "content": "My first note #journal",
      "tags": ["journal"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

**Examples:**

```bash
# Get all notes
curl -H "Authorization: etu_your_key" \
  https://your-etu-server.com/api/v1/notes

# Search notes containing "meeting"
curl -H "Authorization: etu_your_key" \
  "https://your-etu-server.com/api/v1/notes?search=meeting"

# Get notes with specific tags
curl -H "Authorization: etu_your_key" \
  "https://your-etu-server.com/api/v1/notes?tags=work,important"

# Get notes with pagination
curl -H "Authorization: etu_your_key" \
  "https://your-etu-server.com/api/v1/notes?limit=10&offset=20"

# Get notes from date range
curl -H "Authorization: etu_your_key" \
  "https://your-etu-server.com/api/v1/notes?start_date=2024-01-01T00:00:00Z&end_date=2024-01-31T23:59:59Z"
```

---

#### Create Note

Create a new note.

**Endpoint:** `POST /api/v1/notes`

**Request Body:**

```json
{
  "content": "Note content in markdown",
  "tags": ["optional", "array", "of", "tags"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | The note content (supports markdown) |
| `tags` | array | No | Array of tag names to associate with the note |

**Response:** `201 Created`

```json
{
  "id": "new_note_id",
  "content": "Note content in markdown",
  "tags": ["optional", "array", "of", "tags"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Examples:**

```bash
# Create a simple note
curl -X POST \
  -H "Authorization: etu_your_key" \
  -H "Content-Type: application/json" \
  -d '{"content":"My first API note"}' \
  https://your-etu-server.com/api/v1/notes

# Create a note with tags
curl -X POST \
  -H "Authorization: etu_your_key" \
  -H "Content-Type: application/json" \
  -d '{"content":"Meeting notes from today","tags":["work","meeting"]}' \
  https://your-etu-server.com/api/v1/notes

# Create a note with markdown
curl -X POST \
  -H "Authorization: etu_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# Project Update\n\n- Completed feature A\n- Started on feature B\n- **Important:** Review code by Friday",
    "tags": ["project", "status"]
  }' \
  https://your-etu-server.com/api/v1/notes
```

---

#### Get Note

Get a specific note by ID.

**Endpoint:** `GET /api/v1/notes/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The note ID |

**Response:**

```json
{
  "id": "abc123",
  "content": "Note content",
  "tags": ["tag1", "tag2"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Example:**

```bash
curl -H "Authorization: etu_your_key" \
  https://your-etu-server.com/api/v1/notes/abc123
```

---

#### Update Note

Update an existing note.

**Endpoint:** `PUT /api/v1/notes/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The note ID |

**Request Body:**

```json
{
  "content": "Updated content (optional)",
  "tags": ["updated", "tags", "optional"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | No | New content for the note |
| `tags` | array | No | New array of tags (replaces existing tags) |

**Response:**

```json
{
  "id": "abc123",
  "content": "Updated content",
  "tags": ["updated", "tags"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T12:45:00.000Z"
}
```

**Examples:**

```bash
# Update note content only
curl -X PUT \
  -H "Authorization: etu_your_key" \
  -H "Content-Type: application/json" \
  -d '{"content":"Updated note content"}' \
  https://your-etu-server.com/api/v1/notes/abc123

# Update tags only
curl -X PUT \
  -H "Authorization: etu_your_key" \
  -H "Content-Type: application/json" \
  -d '{"tags":["new","tags"]}' \
  https://your-etu-server.com/api/v1/notes/abc123

# Update both content and tags
curl -X PUT \
  -H "Authorization: etu_your_key" \
  -H "Content-Type: application/json" \
  -d '{"content":"New content","tags":["updated"]}' \
  https://your-etu-server.com/api/v1/notes/abc123
```

---

#### Delete Note

Delete a note.

**Endpoint:** `DELETE /api/v1/notes/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The note ID |

**Response:**

```json
{
  "success": true
}
```

**Example:**

```bash
curl -X DELETE \
  -H "Authorization: etu_your_key" \
  https://your-etu-server.com/api/v1/notes/abc123
```

---

### Tags

#### List Tags

Get all tags for the authenticated user.

**Endpoint:** `GET /api/v1/tags`

**Response:**

```json
{
  "tags": [
    {
      "id": "tag_id_1",
      "name": "work",
      "count": 15,
      "createdAt": "2024-01-01T10:00:00.000Z"
    },
    {
      "id": "tag_id_2",
      "name": "personal",
      "count": 23,
      "createdAt": "2024-01-02T14:30:00.000Z"
    }
  ]
}
```

**Example:**

```bash
curl -H "Authorization: etu_your_key" \
  https://your-etu-server.com/api/v1/tags
```

---

## Complete Usage Examples

### Shell Script Example

```bash
#!/bin/bash

API_KEY="etu_your_api_key_here"
BASE_URL="https://your-etu-server.com/api/v1"

# Create a new note
NOTE_ID=$(curl -s -X POST \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content":"Daily standup notes","tags":["work","standup"]}' \
  "$BASE_URL/notes" | jq -r '.id')

echo "Created note: $NOTE_ID"

# Get the note
curl -H "Authorization: $API_KEY" \
  "$BASE_URL/notes/$NOTE_ID"

# Update the note
curl -X PUT \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content":"Updated standup notes with action items"}' \
  "$BASE_URL/notes/$NOTE_ID"

# List all work-related notes
curl -H "Authorization: $API_KEY" \
  "$BASE_URL/notes?tags=work"

# Get all tags
curl -H "Authorization: $API_KEY" \
  "$BASE_URL/tags"
```

### Python Example

```python
import requests
import json

API_KEY = "etu_your_api_key_here"
BASE_URL = "https://your-etu-server.com/api/v1"

headers = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

# Create a note
note_data = {
    "content": "Python API test note",
    "tags": ["python", "test"]
}
response = requests.post(f"{BASE_URL}/notes", 
                        headers=headers, 
                        json=note_data)
note = response.json()
print(f"Created note: {note['id']}")

# List notes
response = requests.get(f"{BASE_URL}/notes", headers=headers)
notes = response.json()
print(f"Total notes: {notes['total']}")

# Search notes
response = requests.get(f"{BASE_URL}/notes?search=python", headers=headers)
results = response.json()
print(f"Found {len(results['notes'])} notes matching 'python'")

# Get tags
response = requests.get(f"{BASE_URL}/tags", headers=headers)
tags = response.json()
for tag in tags['tags']:
    print(f"Tag: {tag['name']} ({tag['count']} notes)")
```

### JavaScript/Node.js Example

```javascript
const API_KEY = "etu_your_api_key_here";
const BASE_URL = "https://your-etu-server.com/api/v1";

const headers = {
  "Authorization": API_KEY,
  "Content-Type": "application/json"
};

// Create a note
async function createNote() {
  const response = await fetch(`${BASE_URL}/notes`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      content: "JavaScript API test",
      tags: ["javascript", "test"]
    })
  });
  
  const note = await response.json();
  console.log("Created note:", note.id);
  return note.id;
}

// List notes
async function listNotes() {
  const response = await fetch(`${BASE_URL}/notes`, {
    headers: headers
  });
  
  const data = await response.json();
  console.log(`Total notes: ${data.total}`);
  return data.notes;
}

// Update a note
async function updateNote(noteId) {
  const response = await fetch(`${BASE_URL}/notes/${noteId}`, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify({
      content: "Updated content"
    })
  });
  
  const note = await response.json();
  console.log("Updated note:", note.id);
}

// Delete a note
async function deleteNote(noteId) {
  const response = await fetch(`${BASE_URL}/notes/${noteId}`, {
    method: "DELETE",
    headers: headers
  });
  
  const result = await response.json();
  console.log("Deleted:", result.success);
}

// Example usage
(async () => {
  const noteId = await createNote();
  await listNotes();
  await updateNote(noteId);
  await deleteNote(noteId);
})();
```

---

## Error Handling

### Common Error Responses

#### 401 Unauthorized

```json
{
  "error": "Unauthorized. Please provide a valid API key in the Authorization header."
}
```

**Cause:** Missing or invalid API key

**Solution:** Check that you're including the correct API key in the Authorization header

#### 400 Bad Request

```json
{
  "error": "Content is required and must be a string"
}
```

**Cause:** Invalid request parameters

**Solution:** Verify your request body matches the expected format

#### 404 Not Found

```json
{
  "error": "Note not found"
}
```

**Cause:** The requested resource doesn't exist or you don't have access to it

**Solution:** Verify the resource ID and that it belongs to your account

#### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

**Cause:** Server-side error

**Solution:** Check server logs or contact support if the issue persists

---

## Rate Limiting

Currently, there are no enforced rate limits. However, please be considerate with your API usage to ensure the best experience for all users.

---

## Best Practices

1. **Store API Keys Securely**: Never commit API keys to version control. Use environment variables or secure configuration management.

2. **Use HTTPS**: Always use HTTPS in production to encrypt API communications.

3. **Handle Errors Gracefully**: Always check response status codes and handle errors appropriately in your application.

4. **Pagination**: When fetching large numbers of notes, use the `limit` and `offset` parameters to paginate results.

5. **Tag Filtering**: Use tag filtering instead of searching when you want precise categorization.

6. **Markdown Support**: Take advantage of markdown formatting in note content for rich text capabilities.

7. **Date Filtering**: Use ISO 8601 format for dates (e.g., `2024-01-15T10:30:00Z`) for best compatibility.

---

## Support

For issues, questions, or feature requests:

- **GitHub Issues**: https://github.com/icco/etu-server/issues
- **CLI Tool**: https://github.com/icco/etu
- **Mobile App**: https://github.com/icco/etu-mobile

---

## Changelog

### v1 (2024-01)
- Initial API release
- Notes CRUD operations
- Tags listing
- API key authentication
