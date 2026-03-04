# Event Check-in and Attendance System (Engineering -> QA)

This document describes the backend implementation delivered for QA review.
The service provides course creation and student enrollment using an in-memory SQLite database.

## What Was Built

Three modules were implemented:

- `eventDb.js`: database connection, Promise-based query helpers, schema setup, teardown
- `eventRepo.js`: SQL data access events and attendees
- `eventManager.js`: input validation

The expected execution path is:

1. Service validates input.
2. Service calls repository methods.
3. Repository executes SQL using DB helpers.
4. Results return to service, then to caller.

## Database Schema

### `events`

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `event_name` TEXT NOT NULL
- `date` DATE NOT NULL

### `attendees`

- `email` TEXT PRIMARY KEY
- `attendee_name` TEXT NOT NULL
- `checked-in` BOOLEAN DEFAULT FALSE
- `event_id` INTEGER NOT NULL,
- `UNIQUE(email, event_id)`
- `FOREIGN KEY(event_id)` REFERENCES `events(id)`

## Service API Contract

### `createEvent(db, event)`

Input:

- `event.event_id`: non-empty int
- `event.event_name`: non-empty string
- `event.event_date`: non-empty date

Behavior:

- Trims `event_name`
- Inserts into `events`
- Returns `{ event_name, event_date }`

Error behavior:

- Invalid input throws `TypeError`

### `registerAttendee(db, attendeee)`

Input:

- `email`: non-empty string
- `attendee_name`: non-empty string
- `event_id`: non-empty int

Behavior:

- Trims `attendee_email` and `attendee_name`
- Rejects if event does not exist
- Rejects if email is a duplicate for the same event_id
- Inserts into `attendees`
- Returns `{ email, attendee_name, event_id }`

Error behavior:

- Invalid input throws `TypeError`
- Missing event throws `Error("event not found")`
- Duplicate registration fails with SQLite `UNIQUE constraint failed` error

### `checkInAttendee(db, email, event_id)`

Input:

- `email`: non-empty string
- `event_id`: non-empty int

Behavior:

- Modifies `attendees`

Error behavior:

- Invalid input throws `Error(attendee not found)`
