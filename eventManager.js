const { create } = require("node:domain");
const {
  addEvent,
  findEventById,
  addAttendee,
  listAttendeesByEventId,
  checkIn,
  listCheckedInAttendeesByEventId,
} = require("./eventRepo");

const validateEvent = (event) => {
  if (!event || typeof event !== "object") {
    throw new TypeError("event must be an object");
  }
  if (typeof event.event_name !== "string" || event.event_name.trim() === "") {
    throw new TypeError("event.event_name must be a non-empty string");
  }
  if (isNaN(Date.parse(event.date))) {
    throw new TypeError("event.date must be a valid date");
  }
};

const validateAttendee = (attendee) => {
  if (!attendee || typeof attendee !== "object") {
    throw new TypeError("attendee must be an object");
  }
  if (typeof attendee.email !== "string" || attendee.email.trim() === "") {
    throw new TypeError("attendee.email must be a non-empty string");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email)) {
    throw new TypeError("attendee.email must be a valid email address");
  }
  if (
    typeof attendee.attendee_name !== "string" ||
    attendee.attendee_name.trim() === ""
  ) {
    throw new TypeError("attendee.attendee_name must be a non-empty string");
  }
  if (typeof attendee.event_id !== "number" || attendee.event_id <= 0) {
    throw new TypeError("attendee.event_id must be a valid id");
  }
};

const createEvent = async (db, event) => {
  validateEvent(event);
  return addEvent(db, {
    event_name: event.event_name.trim(),
    date: event.date,
  });
};

const registerAttendee = async (db, attendee) => {
  validateAttendee(attendee);

  const event = await findEventById(db, attendee.event_id);
  if (!event) {
    throw new Error("event not found");
  }

  const attendees = await listAttendeesByEventId(db, attendee.event_id);
  if (attendees.some((a) => a.email === attendee.email.trim())) {
    throw new Error("email already registered for this event");
  }

  return addAttendee(db, {
    email: attendee.email.trim(),
    attendee_name: attendee.attendee_name.trim(),
    event_id: attendee.event_id,
  });
};

const checkInAttendee = async (db, email, event_id) => {
  const attendees = await listAttendeesByEventId(db, event_id);
  const attendee = attendees.find((a) => a.email === email.trim());
  if (!attendee) {
    throw new Error("attendee not found");
  } else {
    checkIn(db, email, event_id);
  }
};

const generateAttendanceReport = async (db, event_id) => {
  const event = await findEventById(db, event_id);
  const attendees = await listAttendeesByEventId(db, event_id);
  const checkedInAttendees = await listCheckedInAttendeesByEventId(
    db,
    event_id,
  );

  console.log(`Event Name: ${event.event_name}`);
  console.log(`Event Date: ${event.date}`);
  console.log(`Total Registered Attendees: ${attendees.length}`);
  console.log(`Total Checked-in Attendees: ${checkedInAttendees.length}`);
  console.log("List of Checked-in Attendees:");
  console.table(checkedInAttendees);
};

module.exports = {
  validateEvent,
  validateAttendee,
  createEvent,
  registerAttendee,
  checkInAttendee,
  generateAttendanceReport,
};
