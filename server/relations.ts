import { defineRelations } from "drizzle-orm";
import { logTable, taskTable } from "./schemas.ts";

// The keys of this object become the names under db.query: db.query.task and db.query.log
const schema = { task: taskTable, log: logTable };

// Relations teach Drizzle how to fetch connected rows together (db.query ... `with`);
// the foreign key in db/schemas/log.ts is still what enforces the link in the database.
export const relations = defineRelations(schema, r => ({
    log: {
        // named taskDetails, not task, because log already has a column called task
        taskDetails: r.one.task({
            from: r.log.task,
            to: r.task.name,
        }),
    },
    task: {
        logs: r.many.log(),
    },
}));
