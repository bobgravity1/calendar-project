# Foreign keys, cascades, and the database schema

The task and log tables have a one-to-many relationship: one task can have many logs, and each individual log belongs to one task. Having many tasks and many logs overall does not make this many-to-many. The question is how many rows each individual row can relate to on the other side.

In this app, `log.task` references `task.name`. Tasks have an integer primary key too, but the current foreign key targets their unique name. A foreign key protects the connection between stored rows: a log cannot refer to a task name that does not exist when that constraint is enforced.

```sql
-- This constraint belongs inside the log table definition.
FOREIGN KEY (task) REFERENCES task(name)
```

A JOIN serves a different purpose: it matches rows when reading data. A foreign key enforces valid references when writing data. You can JOIN tables without a foreign key and have a foreign key without using a JOIN. Cascade is therefore not an opposite JOIN. It is behavior attached to a foreign key.

Suppose Walking has three logs. A DELETE statement names the table being changed, and WHERE chooses its matching rows:

```sql
DELETE FROM task
WHERE name = 'Walking';
```

That statement directly selects only the task. Without a delete cascade, an enforced foreign key normally blocks the deletion while logs still reference Walking. Otherwise those logs would point at a nonexistent task. You could manually delete the logs first and then delete the task, ideally in one transaction so both changes succeed or fail together.

The alternative is a database rule defined beforehand:

```sql
-- Define the behavior once, when creating or changing the constraint.
FOREIGN KEY (task) REFERENCES task(name)
ON UPDATE CASCADE
ON DELETE CASCADE
```

Now the same ordinary DELETE automatically removes Walking's three logs as part of that operation. The DELETE query does not need to mention CASCADE because the database remembers the rule. It applies whether the deletion comes from an API, a script, or a SQL console. It deletes matching rows, not entire tables. The direction is parent to child: deleting one log does not delete its task.

ON UPDATE CASCADE follows changes to the referenced value. Renaming Walking updates the task reference in its logs. Changing an increment or unit does not trigger it, since the foreign key references the name. ON DELETE and ON UPDATE are independent rules. Alternatives include NO ACTION and RESTRICT, which block changes that leave invalid references; SET NULL, which requires a nullable reference; and SET DEFAULT, whose resulting value must still satisfy the foreign key.

## Drizzle's two definitions have different jobs

The `.references()` call in `server/db/schemas/log.ts` describes the actual database foreign key. This is where Bobby added the delete cascade tonight:

```ts
task: text().notNull().references(() => taskTable.name, {
  onUpdate: 'cascade', // Follow renames of the referenced task name.
  onDelete: 'cascade', // Remove dependent logs when their task is deleted.
}),
```

The separate `defineRelations()` in `server/relations.ts` teaches Drizzle's query API how to fetch nested objects. This project already defines task.logs and log.taskDetails. These definitions enable a query shaped like this:

```ts
const tasksWithLogs = await db.query.task.findMany({
  with: { logs: true }, // Each returned task includes its own logs array.
})
```

These query conveniences do not create database constraints or set cascade behavior. You can instead retrieve related data through explicit SQL-style joins. Similar naming makes the two layers confusing, but their responsibilities are separate: references protects stored data; defineRelations supports convenient nested reads.

## Why the first test failed

Bobby added the correct cascade option to the TypeScript schema, but deleting test still failed with SQLITE_CONSTRAINT_FOREIGNKEY. The source file described the desired schema while the actual database still stored ON DELETE NO ACTION. We verified the actual rule with read-only SQL:

```sql
-- Inspect the database's stored constraint, not the TypeScript description.
PRAGMA foreign_key_list(log);
```

The result showed update CASCADE and delete NO ACTION. The delete route did not need another references function or a manual log deletion. The missing step was applying the schema change:

```sh
# Back up real log data and review the proposed changes before applying.
bunx drizzle-kit push
```

After applying it, Bobby confirmed the deletion worked. Editing a schema file describes a change; applying it changes what the database enforces. Opening Studio and restarting the app do not apply it.

```sh
# Studio browses the database; it does not apply schema changes.
bunx drizzle-kit studio
```

The earlier CLI error came from appending drizzle-kit studio to bun run dev. That passed the words to Vite as arguments. Studio is a separate command. The blank screen at session start had a separate cause: the frontend was running while the API on port 3000 was not. App.tsx waits for API data before rendering. bun run dev:server starts the API; bun run dev:all starts both processes.

A cascade changes database rows, not React memory. The delete_task reducer still removes only the task from user.tasks; removing its logs from user.logs is unfinished UI work. That is separate from the now-working database cascade.

Looking up syntax is normal. The reusable understanding is which layer owns each responsibility: database constraints protect stored rows, queries read them, and React state determines what the current screen remembers.

Sources: [Drizzle relations and foreign keys](https://orm.drizzle.team/docs/relations#foreign-keys), [foreign key actions](https://orm.drizzle.team/docs/relations#foreign-key-actions), [schema push](https://orm.drizzle.team/docs/drizzle-kit-push).
