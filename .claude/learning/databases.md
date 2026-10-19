# Databases

Subject notes from the calendar project (Hono + Drizzle + Turso/SQLite, with Postgres for comparison). New lessons go in as new sections here, not as new files.

## Who hands out IDs

The database assigns primary keys, never the app. If two browsers each picked "the next number" on their own, they could pick the same one at the same moment. Letting the database do it means there's exactly one counter and one place that decides.

SQLite and Postgres keep that counter differently. In SQLite, a column declared `INTEGER PRIMARY KEY` is just another name for the table's built-in row number, the `rowid`. A new row normally gets one more than the current largest, which means that if you delete the row with the highest ID, the next insert can get that same number again. Adding `AUTOINCREMENT` changes the rule. SQLite records the highest ID it has *ever* handed out, in an internal table called `sqlite_sequence`, and always goes above it. That's why wiping a table doesn't restart the IDs at 1.

Postgres uses a **sequence**, a separate counter object that lives in the database. The modern way to attach one is an identity column; `SERIAL` is the older spelling of the same idea. A sequence never rolls back. If an insert fails halfway, the number it took is gone for good, so gaps in IDs are normal and don't mean anything was deleted. When you need IDs that can't be guessed or counted, Postgres can generate UUIDs instead with `gen_random_uuid()`.

```sql
-- SQLite: AUTOINCREMENT means "never reuse a number, even after deletes"
CREATE TABLE log (log_id INTEGER PRIMARY KEY AUTOINCREMENT, amount INTEGER NOT NULL);

-- Postgres: the identity column is backed by a sequence, and failed inserts leave gaps
CREATE TABLE log (log_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY, amount integer NOT NULL);
```

## How dates are stored

This is the biggest difference between the two. **SQLite has no date type at all.** It has five storage classes (NULL, INTEGER, REAL, TEXT, BLOB), and a column's declared type is only a preference. Unless the table is declared `STRICT`, SQLite will happily store `'banana'` in a column you called a date. So a date in SQLite is whatever you decide to store. There are three conventions: an ISO string as TEXT (`'2026-10-18 19:02:11'`), Unix seconds as an INTEGER, or a Julian day number as a REAL. SQLite's date functions (`date()`, `datetime()`, `strftime()`, `unixepoch()`) understand all three.

This project's schema uses the integer convention, and Drizzle does the translating:

```ts
// the database only ever sees a number; mode: 'timestamp' tells Drizzle
// to turn it into a JS Date on the way out, and back into a number on the way in
createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
```

```
server code        Drizzle                  SQLite row
new Date()     →   1792350131 (seconds)  →  1792350131
Date object    ←   × 1000 → new Date()   ←  1792350131
```

`'timestamp'` stores whole seconds, which is why these timestamps always come back with `.000` milliseconds. `'timestamp_ms'` would keep the milliseconds.

**Postgres has real time types, and it enforces them.** Inserting `'banana'` into a timestamp column is an error. These are the types that matter:

- `date`: a calendar day, with no time.
- `timestamp`: a date and time with **no time zone**. It's a photo of a wall clock that doesn't say which zone the clock was in, so the same value means different moments to people in different zones. It's a classic source of bugs.
- `timestamptz`: an exact moment. Postgres stores it in UTC and converts it to the session's time zone when it shows it to you. This is the usual right choice for "when did this happen."
- `interval`: a duration, so `now() - interval '1 day'` just works.

## Who stamps the time

A default value can come from two places, and the difference matters more than it looks.

A **database default** is part of the table definition. Postgres's `DEFAULT now()` runs inside the database for every insert, whoever sends it: your app, a SQL console, a migration script, another service. An **app-side default** lives in your code. Drizzle's `$defaultFn` runs in JavaScript on your server, and only for inserts that go through Drizzle. An insert that skips Drizzle, like raw SQL typed into a console, gets no value at all, and on a `NOT NULL` column that insert fails.

```ts
// app-side (SQLite): runs in the Hono server's JS, only for inserts made through Drizzle
createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),

// database-side (SQLite): SQLite fills it in itself, for every insert from anywhere
createdAt: integer({ mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),

// database-side (Postgres): becomes DEFAULT now() in the table definition
createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
```

The middle version needs the `sql` helper. That's what the commented-out `import { sql } from "drizzle-orm"` at the top of `server/db/schemas/log.ts` is for.

One Postgres quirk to know: `now()` is the time the *transaction* started, not the current instant, so every row written in one transaction gets the identical timestamp. `clock_timestamp()` gives the real current time if you ever need it.

The general rule is to let the database stamp creation times and IDs, and never the client. A browser's clock can be wrong, and anything the client sends can be faked. This project's insert schema backs that up: `newLogSchema` picks only `task` and `amount`, so the validator won't accept a `createdAt` or `log_id` from the browser even if one is sent.

## Date math in SQL

Because Postgres knows what a day is, "today's logs" is one condition:

```sql
-- current_date is today in the session's time zone; comparing a timestamptz
-- to a date treats the date as midnight
SELECT * FROM log WHERE created_at >= current_date;
```

SQLite can do the same, but it has to convert the stored integer first:

```sql
-- with Unix-seconds integers: turn the number into a day, then compare.
-- Both sides are UTC days unless you add the 'localtime' modifier.
SELECT * FROM log WHERE date(createdAt, 'unixepoch') = date('now');
```

That last comment is the hidden catch in any "is it today?" question: *whose* today? SQL runs on a server, so it uses the server's idea of the day (UTC by default in SQLite, the session time zone in Postgres). `isToday` in the browser uses your local day, which is the one you actually live in. For a personal tracker, that's a good reason to fetch the logs and filter them in JavaScript.

## What the app actually receives

Database drivers convert values into the language's own types. A Postgres driver in Node hands you a JS `Date` for a `timestamptz` column. SQLite hands back whatever was stored, a string or a number, unless an ORM like Drizzle converts it for you. Whichever database it came from, though, the value becomes a string the moment it goes out over HTTP as JSON, because JSON has no date type. That's why frontend types say `createdAt: string`, and why browser code wraps it in `new Date(...)` before doing any date logic.

## Deleting rows linked by a foreign key

`log.task` references `task.name`, which makes it a foreign key. The database refuses to delete a task while any log still points at it, because those logs would be left pointing at nothing. Deletes always go children first, then parents:

```sql
-- logs point at tasks, so the logs have to go first
DELETE FROM log;
DELETE FROM task;
```

Clearing only `log` is fine in any order, since nothing points at a log.
