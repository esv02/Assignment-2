const sqlite3 = require('sqlite3').verbose();

const createDb = () => {
  return new sqlite3.Database(":memory:");
};

const run = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
};

const get = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

const all = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const initSchema = async (db) => {
  await run(
    db,
    `CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL,
      date DATE NOT NULL
    )`,
  );

  await run(
    db,
    `CREATE TABLE attendees (
      email TEXT PRIMARY KEY,
      attendee_name TEXT NOT NULL,
      checked_in BOOLEAN DEFAULT FALSE,
      event_id INTEGER NOT NULL,
      UNIQUE(email, event_id),
      FOREIGN KEY(event_id) REFERENCES events(id)
    )`,
  );
};

const closeDb = (db) => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

module.exports = {
  createDb,
  initSchema,
  run,
  get,
  all,
  closeDb,
};