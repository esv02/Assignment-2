const { run, get, all } = require('./eventDb');

const addEvent = async (db, event) => {
    const result = await run(
        db,
        `INSERT INTO events (event_name, date) VALUES (?, ?)`,
        [event.event_name, event.date]
    );

    return {
        id: result.lastID,
        event_name: event.event_name,
        date: event.date
    };
};

const findEventById = async (db, id) => {
    return get (
        db,
        `SELECT * FROM events WHERE id = ?`,
        [id]
    );
};

const addAttendee = async (db, attendee) => {
    const result = await run(
        db,
        `INSERT INTO attendees (email, attendee_name, event_id) VALUES (?, ?, ?)`,
        [attendee.email, attendee.attendee_name, attendee.event_id]
    );

    return {
        email: attendee.email,
        attendee_name: attendee.attendee_name,
        event_id: attendee.event_id
    };
};

const listAttendeesByEventId = async (db, event_id) => {
    return all(
        db,
        `SELECT a.email, a.attendee_name, a.checked_in, e.event_name
         FROM attendees a
         JOIN events e ON a.event_id = e.id
         WHERE a.event_id = ?`,
        [event_id]
    );
};

const checkIn = async (db, email, event_id) => {
    await run(
        db,
        `UPDATE attendees SET checked_in = TRUE WHERE email = ? AND event_id = ?`,
        [email, event_id]
    );
};

const listCheckedInAttendeesByEventId = async (db, event_id) => {
    return all(
        db,
        `SELECT a.email, a.attendee_name, e.event_name
         FROM attendees a
         JOIN events e ON a.event_id = e.id
         WHERE a.event_id = ? AND a.checked_in = TRUE`,
        [event_id]
    );
};

module.exports = {
    addEvent,
    findEventById,
    addAttendee,
    listAttendeesByEventId,
    checkIn,
    listCheckedInAttendeesByEventId,
};