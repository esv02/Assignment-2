const test = require("node:test");
const assert = require("node:assert/strict");

const { createDb, initSchema, closeDb } = require("../eventDb");

const {
  validateEvent,
  validateAttendee,
  createEvent,
  registerAttendee,
} = require("../eventManager");

test.describe("Event Check-in and Attendance System Unit Tests", () => {
  // Tests for validateEvent
  test("validateEvent shouldn't throw an error for a valid event", () => {
    assert.doesNotThrow(() =>
      validateEvent({ event_name: "Birthday Party", date: "2026-05-12" }),
    );
  });
  test("validateEvent should throw an error for an invalid event", () => {
    assert.throws(() => validateEvent({}), TypeError);
    assert.throws(() => validateEvent({ event_name: "" }), TypeError);
    assert.throws(
      () => validateEvent({ event_name: "Halloween", date: "date" }),
      TypeError,
    );
  });

  // Tests for validateAttendee
  test("validateAttendee shouldn't throw an error for a valid attendee", () => {
    assert.doesNotThrow(() =>
      validateAttendee({
        email: "maeve.millay@email.com",
        attendee_name: "Maeve Millay",
        event_id: 1,
      }),
    );
  });
  test("validateAttendee should throw an error for an invalid attendee", () => {
    assert.throws(() => validateAttendee({}), TypeError);
    assert.throws(
      () => validateAttendee({ attendee_name: "Maeve Millay" }),
      TypeError,
    );
  });
  test("validateAttendee should throw an error for a duplicate email", async () => {
    const db = await createDb();
    await initSchema(db);
    const event = await createEvent(db, {
      event_id: 1,
      event_name: "Conference",
      date: "2027-10-26",
    });
    await registerAttendee(db, {
      attendee_name: "Maeve Millay",
      email: "maeve.millay@email.com",
      event_id: 1,
    });
    await assert.rejects(async () => {
      await registerAttendee(db, {
        attendee_name: "Maeve Mill",
        email: "maeve.millay@email.com",
        event_id: 1,
      });
    }, Error);
    await closeDb(db);
  });
});
