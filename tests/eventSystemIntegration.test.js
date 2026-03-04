//Title: Lab 3 - Event Check-in and Attendance System Tests
//Date: 2026-03-02

//imports
const test = require("node:test");
const assert = require("node:assert/strict");

const { createDb, initSchema, closeDb } = require("../eventDb");
const {
  createEvent,
  registerAttendee,
  checkInAttendee,
} = require("../eventManager");

const {
  addEvent,
  findEventById,
  addAttendee,
  listAttendeesByEventId,
  checkIn,
} = require("../eventRepo");

let db;

test.describe("Event Check in and Attendence system tests", () => {
  test.beforeEach(async () => {
    db = await createDb();
    await initSchema(db);
  });

  test.afterEach(async () => {
    await closeDb(db);
  });

  // Test for createEvent
  test("createEvent should create an event", async () => {
    const event = await createEvent(db, {
      event_name: "Birthday Party",
      date: "2026-05-12",
    });
    assert.ok(event.id);

    const found = await findEventById(db, event.id);
    assert.deepStrictEqual(found, {
      id: event.id,
      event_name: "Birthday Party",
      date: "2026-05-12",
    });
  });

  // Test for registerAttendee
  test("registerAttendee should register an attendee", async () => {
    const event = await createEvent(db, {
      event_name: "Conference",
      date: "2027-10-26",
    });
    const attendee = await registerAttendee(db, {
      attendee_name: "Robert Ford",
      email: "robert.ford@email.com",
      event_id: event.id,
    });
    assert.ok(attendee.email);

    const found = await listAttendeesByEventId(db, event.id);
    assert.deepStrictEqual(found[0], {
      email: "robert.ford@email.com",
      attendee_name: "Robert Ford",
      checked_in: 0,
      event_name: "Conference",
    });
  });

  test("registerAttendee should reject duplicate emails for the same event", async () => {
    const event = await createEvent(db, {
      event_name: "Conference",
      date: "2024-12-31",
    });
    await registerAttendee(db, {
      attendee_name: "Dolores Abernathy",
      email: "dolores.abernathy@email.com",
      event_id: event.id,
    });
    assert.rejects(
      () =>
        registerAttendee(db, {
          attendee_name: "Dolores Abernath",
          email: "dolores.abernathy@email.com",
          event_id: event.id,
        }),
      {
        name: "Error",
      },
    );
    /UNIQUE constraint failed/;
  });

  // Tests for checkInAttendee
  test("checkInAttendee should check in an attendee", async () => {
    const event = await createEvent(db, {
      event_name: "Christmas Party",
      date: "2026-12-25",
    });
    await registerAttendee(db, {
      attendee_name: "James Delos",
      email: "james.delos@email.com",
      event_id: event.id,
    });
    await checkInAttendee(db, "james.delos@email.com", event.id);

    const found = await listAttendeesByEventId(db, event.id);

    assert.deepStrictEqual(found[0], {
      email: "james.delos@email.com",
      attendee_name: "James Delos",
      checked_in: 1,
      event_name: "Christmas Party",
    });
  });

  test("checkInAttendee should reject non-existent attendees", async () => {
    const event = await createEvent(db, {
      event_name: "Expo",
      date: "2028-08-08",
    });

    assert.rejects(() => checkInAttendee(db, "test@email.com", event.id), {
      message: "attendee not found",
    });
  });
});
