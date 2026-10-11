# Foreign keys, timestamps, validation, and running drizzle-kit

These notes come out of wiring the calendar app's tap logging into [[SQLite]] through [[Drizzle ORM]] and [[libSQL]]. The schema ended up as two tables: `task`, which describes what a task *is* (name, unit, increment), and `log`, which records what *happened* (one row per tap). Almost everything below hangs off the relationship between those two tables, the one column every log row needs (when it happened), and the question of what's allowed through the door when a request tries to write a row.

## The shape of the data first

Before foreign keys make any sense, the split itself has to make sense. The first instinct is to put everything in one table: a task with a running `total` that goes up every tap. That works until you want history. A single number can tell you "how much" but never "when," so there's nothing to chart and nothing to reset at midnight without destroying yesterday.

The fix is to separate the two kinds of data by how they behave. A task is a definition: it gets created, occasionally edited, maybe deleted. A tap is an event: it gets written once and never changes. One task has many taps, and whenever one thing has many of another, they belong in two tables connected by a column they share. That's a [[One-to-Many Relationships|one-to-many relationship]], and it's the backbone of most joins you'll ever write.

```ts
export const taskTable = sqliteTable("task", {
    name: text().notNull().unique(),       // unique: the log table points at this, so it must identify exactly one row
    unit: text().notNull(),
    increment: integer().notNull(),
    id: integer().primaryKey({ autoIncrement: true }),
    updatedAt: integer({ mode: "timestamp" }).notNull().$onUpdateFn(() => new Date()),
})

export const logTable = sqliteTable("log", {
    task: text().notNull().references(() => taskTable.name, { onUpdate: "cascade" }),
    amount: integer().notNull(),           // the increment *as it was* at the moment of the tap, a snapshot, not a link
    log_id: integer().primaryKey({ autoIncrement: true }),
    createdAt: integer({ mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
})
```

A day's total is never stored anywhere. It's a sum of `amount` over that day's rows, which means the "daily reset" isn't code that runs at midnight. It's just the query's date range moving forward. This is the core idea behind [[Event Logs|event logging]]: store what happened, derive everything else.

## Foreign keys

### What one is, and which side it lives on

A foreign key is a rule that says "the value in this column must match a value that exists in that other table's column." In the schema above, every log row's `task` must match some `task.name`. Log a tap for `"watr"` when only `"water"` exists, and the database refuses the write.

The reference always lives on the **many** side and points at the **one** side. A log row says "I belong to that task." A task never keeps a list of its logs. The logs point at it. That's why `.references(...)` is chained onto the `task` column inside `logTable`, the same way `.notNull()` and `.unique()` are chained: it's a column modifier that adds one more rule to that column.

The target column must be unique (or a primary key). That's not an arbitrary restriction. If two tasks could both be named `"water"`, a log saying `task: "water"` wouldn't identify *which* one it belongs to, and a join would match both and double every total.

### Why the reference is an arrow function

The reference is written `() => taskTable.name`, not `taskTable.name`. This is the same failure as the dropdown bug where `useContext` ran at the top level of a module. A `const` can't be read before the line that declares it has run. That's the [[Temporal Dead Zone]], and the error reads "Cannot access 'X' before initialization." If two tables reference each other, or a table references one declared further down the file, reading the other table directly at the top level would hit exactly that error. Wrapping it in a function delays the read until Drizzle actually asks for it, and by then both tables exist.

### How the rule gets created

Writing `.references(...)` in `schema.ts` does nothing on its own. At that point it's only TypeScript in a file, and the database knows nothing about it. The rule becomes real when you run `drizzle-kit push`, which reads the schema, translates each table into a SQL `CREATE TABLE` statement, and runs it against the database:

```sql
CREATE TABLE `log` (
    `task` text NOT NULL,
    `amount` integer NOT NULL,
    `log_id` integer PRIMARY KEY AUTOINCREMENT,
    `createdAt` integer DEFAULT (unixepoch()) NOT NULL,
    -- this line is the .references(...) call, translated
    CONSTRAINT `fk_log_task_task_name_fk` FOREIGN KEY (`task`) REFERENCES `task`(`name`) ON UPDATE CASCADE
);
```

SQLite saves that table definition, rule included, inside `local.db` itself, in a built-in table you can read with `select sql from sqlite_schema`. From then on the rule is part of the database, the same way a column is. Writes never create or teach the rule. They get checked against a rule that already exists. The frontend analogy is `<input required pattern="[0-9]+">`: the rule is declared once in markup, and the browser checks every submit against it.

### How it gets enforced

The database engine enforces it, on every write that could break it. Not Drizzle, not TypeScript, not your app. There are three moments that matter:

- **Inserting or updating a log row.** SQLite looks up `task.name` for the value (fast, because `UNIQUE` also builds an index). No match means the whole statement is rejected and nothing is written. The error is `SQLITE_CONSTRAINT: FOREIGN KEY constraint failed`, and it surfaces as a thrown error from `await db.insert(...)` on the server.
- **Changing a task's name.** SQLite finds every log pointing at the old name and applies whatever `onUpdate` says.
- **Deleting a task.** SQLite finds every log pointing at it and applies whatever `onDelete` says.

Plain SQLite does not enforce foreign keys unless each connection runs `PRAGMA foreign_keys = ON`. libSQL turns them on by default. That was confirmed by inserting a `"watr"` log against a `"water"` task and watching it get rejected.

### onUpdate and onDelete are about the parent

The easy misread is that `onUpdate` means "enforce the rule when the log is updated." It's the other direction. These settings describe what happens to the **logs** when the **task they point at** changes. And "update" here means a data change to that task row's `name` value, something like `UPDATE task SET name = 'hydration' WHERE name = 'water'`. Changing the task's `unit` or `increment` doesn't trigger it, and neither does changing the table's structure.

There are five possible actions, and the same five apply to both settings:

- `"no action"` (the default) refuses the parent change while children point at it.
- `"restrict"` does the same, checked immediately. In practice it's identical for this app.
- `"cascade"` makes the children follow. On update they get the new value; on delete they're deleted too.
- `"set null"` blanks out the children's reference. It's impossible here, because `task` is `notNull`.
- `"set default"` sets the children's reference to the column's default.

Real systems choose by asking whether the children mean anything without the parent. Login sessions mean nothing once the user is deleted, so they cascade. Invoices are history that must survive, so you can't delete a customer who has them, which is restrict. Blog posts still make sense with no author, so the author reference is set to null.

`onUpdate: "cascade"` is in this schema for a specific reason. Most apps reference an `id`, and ids never change, so `onUpdate` almost never matters for them. This schema references `name`, which *can* change when a task is renamed. With cascade, renaming `water` to `hydration` rewrites every past log to `hydration`, all in one atomic operation, and the history stays together. What it doesn't do is keep a record of the old name. That's overwritten everywhere.

`onDelete` was left at the default, so deleting a task that has logs is refused. That's a decision to revisit: cascade deletes the history with the task, while a "soft delete" (an `archived` column the app hides) keeps it.

### What a foreign key is not for

The tempting move is to make `amount` reference `task.increment`, since the amount logged *is* the increment at that moment. That's a real relationship, but a foreign key would describe the wrong one. A foreign key is a live link: "this belongs to that row as it is right now." The relationship here is a point-in-time copy: "this was the increment when I tapped." Foreign keys have no concept of time. If `amount` were linked, editing a task's increment would rewrite history, which is exactly what storing the amount avoids. Databases express "copied at that moment" by storing the value itself in the row. That's a snapshot, and price-at-purchase on an order line is the classic example. (It also couldn't be a foreign key mechanically: `increment` isn't unique.)

It's also worth knowing that **joins don't need foreign keys.** A join just compares values: `log.task = task.name`. It works with or without the `references` line. The foreign key is a guard, not the link. Without it, a typo'd log would save fine and then quietly drop out of every total because it matches no task. With it, the write fails loudly at the moment it happens.

### Where each kind of check lives

TypeScript can't enforce "this task exists," and that's not a gap to fix. It's a different layer's job. TypeScript checks code before it runs, and task names are created at runtime by whoever uses the app, so to TypeScript the column can only ever be "some string." What TypeScript *can* check is shape, and Drizzle generates those types from the schema so they never drift:

```ts
type NewLog = typeof logTable.$inferInsert  // an insert missing `task`, or with amount: "5", fails to compile
type Log = typeof logTable.$inferSelect     // what a row looks like when you read it back
```

So the checks stack up, each catching what the others can't see. TypeScript checks the shape of your code while you write it. [[Zod]] on a route checks the shape of incoming JSON when a request arrives. The foreign key checks the data against what actually exists at the moment of the write. Only the database knows what rows exist, so only the database can answer "does this task exist?"

## Timestamps in SQLite

### SQLite has no date type

[[PostgreSQL]] has a real `timestamp` type with `.defaultNow()`. SQLite stores everything as one of a handful of types (integer, real, text, blob), so `timestamp` and `defaultNow` don't exist in `drizzle-orm/sqlite-core`. Copying the Postgres line into a SQLite schema fails at the import. Drizzle's answer is a *mode* on an ordinary column:

```ts
// stored as an integer: seconds since 1970, always UTC.
// mode tells Drizzle to convert, so you write and read normal JS Date objects
createdAt: integer({ mode: "timestamp" })
```

There are three ways to fill that in automatically, and they differ in who writes the time.

### Option one: the server writes it (`$defaultFn`)

```ts
createdAt: integer({ mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
```

When your code calls `db.insert(...)`, Drizzle runs that function in JavaScript and puts the result into the insert before sending it. The database itself has no default at all. Its table definition only says the column can't be empty. That means an insert that skips your Drizzle code (a raw SQL command, a SQL tool, a future script) gets rejected for leaving the column empty.

### Option two: the database writes it (`unixepoch()`)

```ts
createdAt: integer({ mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
```

Here the default becomes part of the table definition inside `local.db`, exactly like the foreign key did: `DEFAULT (unixepoch())`. SQLite fills it in for any insert that leaves it out, no matter where the insert came from. `unixepoch()` returns the current moment as a number, so Drizzle's timestamp mode still hands back a correct `Date`. This is the one the schema uses, for the same reason the foreign key exists: let the database guarantee what the database can guarantee.

### Option three: text, and the trap inside it

Drizzle's docs show this for SQLite:

```ts
timestamp: text("timestamp").notNull().default(sql`(current_timestamp)`),
```

It works, and the docs say exactly what it produces: "text representation of the current UTC date and time (YYYY-MM-DD HH:MM:SS)." The catch is that the text carries no timezone marker. Here's what happened when it ran at 3:09pm Central:

```ts
// current_timestamp returned "2026-10-10 20:09:58", which is UTC
new Date("2026-10-10 20:09:58")
// → Sat Oct 10 2026 20:09:58 GMT-0500 (Central Daylight Time)
// JS assumed the text was LOCAL time: five hours off, with no error
```

Every tap after 7pm local would land on tomorrow. That's the exact late-night bug the logging design has to avoid, built in at the storage layer. You also get strings back instead of `Date` objects, and filtering for "today" means formatting local midnight into that same UTC text before comparing. None of it is impossible, but every step is a place to get it wrong.

### updatedAt: `$onUpdateFn`

SQLite has no built-in "touch this column on edit." Drizzle fills the gap:

```ts
updatedAt: integer({ mode: "timestamp" }).notNull().$onUpdateFn(() => new Date()),
```

Whenever a row is updated through Drizzle, the function runs and its value is written. Per Drizzle's docs, when the column has no other default, the function runs on insert too, so new tasks get a value. Like `$defaultFn`, this lives in your code, not the database: an update or insert that skips Drizzle won't touch it. The generated SQL is just `updatedAt integer NOT NULL`, with no default.

### The rule that cuts through all of it

Dates feel hard because three separate problems are tangled together. *Storage* is how a moment is written down. *Timezone* is whose clock measured it. *Meaning* is whether you mean "the moment it happened" or "which calendar day it counts toward." The rule that handles most of it: **store moments as UTC numbers, and convert to local time only when you display them or group them by day.** In this app that leaves exactly one place where local time matters, computing "start of today" for queries:

```ts
const startOfToday = new Date()
startOfToday.setHours(0, 0, 0, 0)  // local midnight for whatever day it is *right now*, recomputed on every query
```

Timestamps also only record what succeeded. A write rejected by a foreign key or a unique constraint is undone completely and leaves nothing behind, so tracking *failures* belongs in server logging, not the schema.

## Validating requests: why Zod is still needed

### Where the server lives

The queries need somewhere to run, and it can't be the browser. The browser can't open the database file, and anything shipped to it is public. So the server is a [[Hono]] app in `server/index.ts`, sitting next to `server/db/db.ts` and `server/data/env.ts`. It isn't a separate project. There's still one `package.json` and one `bun.lock`, and `server/` imports Drizzle and libSQL from the same `node_modules` as everything else. Two processes run side by side during development: Vite serving the React app, and `bun --watch server/index.ts` serving the API.

### Types disappear before the code runs

The tempting thought, once Drizzle hands you types like `typeof logTable.$inferInsert`, is that the types themselves can guard incoming requests. They can't, and the reason is the same one that put [[Zod]] in `env.ts`. TypeScript is a checker that runs *before* your program does. When Bun runs the server, every type annotation has already been stripped away. A type describes what your code *expects*. It has no way to inspect what actually arrives over the network at runtime. A request body is data from outside the program, in the same category as `.env` values and form input. `curl`, the ESP32, or a buggy `fetch` can send `{ "amount": "five" }`, and nothing in the type system is awake to stop it.

Here's what the unprotected version looks like, and why it's worse than it seems:

```ts
app.post("/logs", async c => {
    const body = await c.req.json() as NewLog  // `as` is a promise to the compiler, not a check; nothing verifies it
    await db.insert(logTable).values(body)      // whatever was sent goes straight to the database
})
```

The `as` silences TypeScript, but at runtime `body` is whatever the sender typed. SQLite makes this worse, because it doesn't strictly enforce column types. It uses "type affinity," so an `integer` column will quietly store the text `"five"` if that's what it's given. `NOT NULL` and the foreign key still hold, but the wrong *kind* of value gets through without any error, and you'd find out later when a sum comes out strange. (SQLite has an opt-in `STRICT` table mode that changes this. The `strict: true` in `drizzle.config.ts` is unrelated: that one only makes `push` ask before running.)

### Compile time versus runtime

The precise way to say it: **TypeScript does no checking at runtime at all.** It only checks while you write and build. By the time the server is handling a request, the types are gone. So there are two separate moments, and each needs its own protection.

At **compile time**, while you write code, TypeScript catches *your* mistakes. Write this and the editor flags it before the code ever runs:

```ts
db.insert(logTable).values({ amount: "5" })  // compile-time error: amount must be a number, and task is missing
```

At **runtime**, while the server handles a request, the data comes from *outside*: `curl`, the ESP32, the React app. TypeScript isn't there to look at it. Zod checks it at this moment, and after Zod the database enforces its own rules (`NOT NULL`, the foreign key).

Zod is what joins the two moments. A single schema checks real data at runtime and also gives TypeScript the type to use at compile time. That's why `c.req.valid("json")` is both trustworthy and typed.

### Zod at the door

The fix is to check the body at the boundary, before the handler ever sees it. That's what `sValidator` from `@hono/standard-validator` does. It's middleware: it runs first, parses the JSON against a Zod schema, and responds with a 400 on its own if the body doesn't match. The handler only runs for valid requests:

```ts
app.post("/logs", sValidator("json", newLogSchema), async c => {
    const log = c.req.valid("json")  // already checked at runtime AND typed from the schema: the one place both meet
    const [row] = await db.insert(logTable).values(log).returning()
    return c.json(row, 201)
})
```

This is why Zod in particular is worth the effort. It's the one tool that is both a runtime check *and* a source of compile-time types. The schema rejects bad data while the program runs, and TypeScript reads the same schema to know the shape of `c.req.valid("json")` while you write code. `env.ts` uses exactly the same trick for environment variables.

### Generating the schema from the table

Writing a Zod schema by hand means describing every column twice: once in `schema.ts` for the database, once in Zod for requests. The two will drift apart the first time you change a table and forget the other. Drizzle removes the duplication by generating Zod schemas from the table itself. In Drizzle v1 this is built into `drizzle-orm` (it used to be a separate `drizzle-zod` package):

```ts
import { createInsertSchema } from "drizzle-orm/zod"

// pick only what a client is allowed to send. log_id and createdAt are filled in by the database and your code,
// and accepting createdAt from a request would let any client backdate a log
const newLogSchema = createInsertSchema(logTable).pick({ task: true, amount: true })
```

There are three generators, one per job:

- `createInsertSchema(table)` describes what a new row needs, for `POST` bodies.
- `createUpdateSchema(table)` makes every field optional, for `PATCH` requests that change only part of a row.
- `createSelectSchema(table)` describes what a row looks like when read back, useful for checking data that arrives in the React app.

That gives you one source of truth that flows in one direction: table → Zod schema → TypeScript type. Change a column, and the validator and the types follow automatically.

The generated schema only knows the rules the database knows: `amount` is an integer and `task` is text. Rules that live only in your head, like "an amount must be positive," aren't in the table, so they aren't in the generated schema either. Add them on top:

```ts
const newLogSchema = createInsertSchema(logTable)
    .pick({ task: true, amount: true })
    .extend({ amount: z.number().int().positive() })  // a business rule the database doesn't know about
```

### Every layer catches something different

Put together with the foreign key, a single log write passes three checks, and none of them can do another's job. TypeScript checks your code's shape while you write it. Zod checks the request's shape at the moment it arrives: is `amount` a number, is `task` a string? The foreign key checks the data against what actually exists at the moment of the write: is there a task with that name? Zod can't answer that last question, because only the database knows which rows exist. Each layer is the only one positioned to catch its own kind of mistake.

## Barrels and relations

### What a barrel file is

Once the tables were split into their own files (`server/db/schemas/task.ts` and `server/db/schemas/log.ts`), several places needed "all the tables": `drizzle.config.ts` to create them, and the relations setup to connect them. A **barrel** is a file whose only job is to re-export other files, so everything can be imported from one place. It contains no code of its own. It's a front door to the folder:

```ts
// server/schemas.ts: the barrel
export * from "./db/schemas/log.ts";
export * from "./db/schemas/task.ts";
```

`export * from` means "take everything that file exports and export it from here too." Written out the long way, the first line is the same as importing every name from `log.ts` and exporting each one again, except `export *` keeps working when you add a new export to `log.ts` without touching the barrel.

There are two ways to use a barrel. `import { taskTable } from "./schemas.ts"` picks specific names from one place instead of two files. `import * as schema from "./schemas.ts"` grabs everything as a single object (`schema.taskTable`, `schema.logTable`, and so on). The one gotcha: if two files export the same name, `export *` can't decide which one you mean, so it exports neither, and TypeScript reports a conflict. Unique export names avoid it.

Two notes on naming. Drizzle's docs default to a single `schema.ts` for small projects, and splitting into a folder plus a barrel is the common move once tables multiply. Either works. And a folder `index.ts` normally exists so you can import the folder by name (`from "./schemas"`), but this server uses Node-style imports, which need an exact file path (it's the same reason every server import ends in `.ts`), so `index.ts` buys nothing here. A plainly named barrel like `schemas.ts` is clearer.

### Why `db.query` was empty

Importing `taskTable` into a route file doesn't tell `db` anything about it. `db` only knows what was handed to `drizzle()` when it was created in `db.ts`. Drizzle's relational query API, `db.query`, is built from the `relations` you pass in. With none passed, `db.query` is an empty object and there's nothing to autocomplete after the dot. It's the same idea as React context: a component can only read what its Provider was given, and here `drizzle({ ... })` is the Provider.

The plain query builder doesn't have this requirement, because you hand it the table inside the query itself:

```ts
const tasks = await db.select().from(taskTable)  // works with no relations at all: the table is passed right here
```

`db.select`, `db.insert`, `db.update` and `db.delete` cover every simple read and write. `db.query` is worth setting up for one thing the builder makes awkward: fetching connected rows together in a single nested result, like each task with its logs.

### Defining relations (the v1 way)

Relations teach Drizzle how to *navigate* between tables. They are not the foreign key. The foreign key in `log.ts` is what the database enforces; relations only exist inside Drizzle so it knows how to answer "give me this task's logs." The two describe the same link for two different audiences:

```ts
// server/relations.ts
import { defineRelations } from "drizzle-orm";
import { logTable, taskTable } from "./schemas.ts";

// the KEYS of this object become the names under db.query: db.query.task and db.query.log.
// with `import * as schema` instead, the keys would be the export names (db.query.taskTable)
const schema = { task: taskTable, log: logTable };

export const relations = defineRelations(schema, r => ({
    log: {
        // each log belongs to ONE task, linked by log.task → task.name.
        // named taskDetails, not task, because log already has a column called task, and a relation
        // can't share a name with a column: both would want the same key in the result object
        taskDetails: r.one.task({
            from: r.log.task,
            to: r.task.name,
        }),
    },
    task: {
        // each task has MANY logs: the same link read from the other side, so it needs no from/to
        logs: r.many.log(),
    },
}));
```

The `r` helper knows every table in the object. `r.one.task({ from, to })` declares the "belongs to one" side and spells out which columns connect. `r.many.log()` declares the "has many" side, and Drizzle works out the columns from the matching `one`. The names you choose (`taskDetails`, `logs`) are what you'll write in queries later.

Then `db.ts` hands the relations to Drizzle:

```ts
const db = drizzle({
    relations,  // this is what fills in db.query
    connection: { url: env.url, authToken: env.authToken },
});
```

And the payoff, nested results in one call:

```ts
await db.query.task.findMany({ with: { logs: true } })      // every task, each with an array of its logs
await db.query.log.findMany({ with: { taskDetails: true } }) // every log, each with its full task row attached
```

One thing that trips people up when copying from older tutorials: before Drizzle v1, you passed `drizzle(client, { schema })`. In v1 that became `relations`, built with `defineRelations`. The barrel itself isn't the "old way." Barrels are as current as ever. What changed is what you hand to `drizzle()`.

## Running drizzle-kit

### Why `drizzle-kit export` says "command not found"

When you type a command, the shell searches a fixed list of folders called your [[PATH]]. `bun add -d drizzle-kit` installs the executable into this project's `node_modules/.bin/`, which is not on that list. That's deliberate: each project carries its own copy of its tools, at its own version, instead of sharing one global install.

You'd already been relying on this. `"dev": "vite"` in `package.json` works through `bun run dev`, but typing plain `vite` would fail the same way. Package scripts add `node_modules/.bin` to the search path while they run; a bare terminal command doesn't.

There are three ways to reach a project-local tool:

```sh
bunx drizzle-kit export        # bunx looks in node_modules/.bin first
bun run drizzle-kit export     # bun run falls back to node_modules/.bin when no script has that name
bun run db:export              # the script in package.json: "db:export": "drizzle-kit export"
```

The `db:export` script is a convenience, not a requirement. It's worth having for commands you run constantly, so you don't have to remember flags.

### What each command actually does

`export` prints the SQL that would build your whole schema from an empty database. It's read-only: it touches no database and writes no files. It's how you see the translation from schema to SQL, like the `CREATE TABLE` block above. Its help text says it outputs "in specified formats: sql," which is where "format" comes from. SQL is the output format; there is no `drizzle-kit format` command.

`push` compares your schema directly against the live database and applies the difference immediately, with no files left behind. It's fast and ideal while the schema is still changing. Because the config has `strict: true`, it shows the SQL and asks for confirmation first, and `verbose: true` prints the statements it runs.

`generate` and `migrate` are the careful two-step version of `push`. `generate` compares your schema against the last saved snapshot and writes only the changes into a new SQL file under `./drizzle`. It doesn't touch the database. `migrate` then applies any migration files that haven't run yet, keeping track of which ones have in a migrations table. The payoff is a committed, replayable history of every schema change, which matters once there's data you care about or a second machine (like the thin client) to set up.

`studio` opens a browser view of your tables and rows, the easiest way to watch log rows land. `pull` goes the other direction: it reads an existing database and writes a schema file from it.

## Frontend requests and database state — October 11 session

The frontend and database are separate stores of state. Dispatching a React action updates the screen, but it does not prove that the server saved anything. Tonight the frontend removed `bathroom` while an earlier database deletion failed, leaving the row in SQLite. This is why [[HTTP Requests|request handling]] eventually needs to check the HTTP status and decide when to update local state. `fetch` rejects for network failures, but a server response such as 400 or 500 still resolves. Parsing its JSON does not make it a successful write.

For a JSON request, `JSON.stringify` converts a JavaScript object into the text sent over HTTP. The `Content-Type` header tells Hono which format to parse. Input values arrive as strings even when they look numeric, so the task request converts `increment` with `Number(increment)` before sending it to the generated validator. TypeScript annotations do not perform that conversion at runtime.

The backend now uses Bun's native server export. Previously the file called the Node adapter's `serve` and also exported the Hono app. Bun recognized the exported `fetch` handler and attempted another listener on port 3000. The two startup paths collided. Exporting just the port and handler leaves one owner of the listener:

```ts
export default {
    fetch: app.fetch,
    port: 3000,
}
```

The frontend and backend are separate processes. `vite && bun --watch server/index.ts` waits for Vite to finish before starting Hono, so it cannot run both development servers together. The project now runs them concurrently:

```sh
bun run dev:all
# package.json runs: bun run --parallel dev dev:server
```

The frontend API URL is `VITE_API_URL=http://localhost:3000` in the ignored `.env.local`. Vite needs restarting after an env change. A `VITE_` value is exposed to browser code, so this is suitable for a public server address, never a database credential. Hono's local CORS middleware permits localhost and 127.0.0.1 frontend origins on development ports. CORS is browser permission to read a response, not authentication.

## Manually removing one leftover row from the command line

Deleting a row and dropping a table are different operations. `DELETE FROM task WHERE ...` removes matching task records and keeps the table. `DROP TABLE task` removes the entire table, including every task and its structure. For a frontend/database mismatch involving one task, delete the row. A `DELETE` without `WHERE` removes every row, so inspect the target first.

The database in this project is opened through [[libSQL]] using `server/data/env.ts`. The following command runs from the project root, uses the same configured database as the backend, and does not print its credentials. It first inspects the named task and counts its dependent logs:

```sh
bun -e '
import { createClient } from "@libsql/client";
import { env } from "./server/data/env.ts";
const client = createClient({ url: env.url, authToken: env.authToken });
try {
    console.log((await client.execute({
        sql: "SELECT id, name, unit, increment FROM task WHERE name = ?",
        args: ["bathroom"], // A parameter supplies a value without building SQL from user text.
    })).rows);
    console.log((await client.execute({
        sql: "SELECT count(*) AS logs FROM log WHERE task = ?",
        args: ["bathroom"],
    })).rows);
} finally {
    client.close();
}
'
```

Tonight the inspection found exactly `bathroom`, id 3, unit `trip`, increment 1, with zero logs. Only after confirming that target did we execute the deletion below. For a future cleanup, replace both the id and name with the values you inspected; id 3 is the historical target, not a reusable cleanup id.

```sh
bun -e '
import { createClient } from "@libsql/client";
import { env } from "./server/data/env.ts";
const client = createClient({ url: env.url, authToken: env.authToken });
try {
    console.log((await client.execute({
        sql: "DELETE FROM task WHERE id = ? AND name = ? RETURNING id, name",
        args: [3, "bathroom"], // Both conditions narrow the operation to the inspected record.
    })).rows);
    console.log((await client.execute({
        sql: "SELECT count(*) AS remaining FROM task WHERE name = ?",
        args: ["bathroom"],
    })).rows);
} finally {
    client.close();
}
'
```

`RETURNING` reports which row was actually removed. The final count was zero, confirming the cleanup. This deletion was committed without a recovery copy; Git does not version database rows. The saved values above describe the removed task, but reinserting it would be a new database operation.

If the task has logs, the default foreign-key delete action can refuse the deletion. Do not disable foreign keys or erase the logs merely to make the error disappear. Decide whether that history should survive before choosing a deletion policy. Dropping a table is for intentionally discarding a whole schema object, not reconciling one missing frontend task.
