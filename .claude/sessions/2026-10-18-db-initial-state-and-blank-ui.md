# Session handoff — last worked Mon 2026-10-19 — logs in state, taps update totals, todo.md

Tutor mode, but Bobby wants **brief, direct answers** and exact lines ("just show me what line"). Claude touches **only** what he asks for (see memory `one-function-means-one-function`). For planning, give 2-3 options per item, each with a one-line example, never the full solution. Learning notes go in subject files in `.claude/learning/` (append only).

**Start here: `todo.md` in the project root.** It's Bobby's list, with the options written out.

## Current state

Last commit: `89f8098` on dev, pushed. **Everything below is uncommitted** (ask before committing):

- **Taps update the total live.**
  - `createDBLog` (`log/log-functions.ts:25`) returns `data.newLog`.
  - `handleIncrementClick` (`taskView.tsx:69`) is async: `await createDBLog(task)`, then `dispatch({ type: 'add_log', log: newLog })`.
  - The prop type is `Promise<Log>` (`taskView.tsx:43`).
  - The reducer case `add_log` (`App.tsx:102`) appends to `user.logs`.
- **`src/types/user.ts`:** `Log = { task, amount, log_id, createdAt: string }`, `logs: Log[]` on `User`, and the `add_log` action.
- **`App.tsx`:** seeds `user.logs` with **all** logs from `getAllLogs()`.
- **`src/lib/totals.ts`:**
  - `todayLogs(logs, name?)`
  - `todayTotal(logs, name)`, used on the task card
  - `logTotal(logs, task)`, which returns `{ task, total }` for all time and isn't used yet
- **Bobby's `getDBTodayLogs(name?)`** stays as he wrote it, still called once in `taskView.tsx`. He wants it kept.
- `tsc -b` passes.
- **Bobby is logging real data now.** Back up before any migration that touches `log`.

## todo.md (his order)

1. **Delete a task → delete its logs.** Either in the route (`server/routes/task.ts:39`), or with `onDelete: "cascade"` on the FK (needs a migration, so back up). The `delete_task` reducer should also drop that task's logs from `user.logs`.
2. **Stats table:** `stats/ui/totalsByTask.tsx` has hardcoded rows. Either map `user.logs` from context, or give the table its own `useState` + `useEffect` fetch.
3. **Favorite quick-log:** a Zustand store (like `useView`), the user state, or its own context.
4. **Charts:** `react-chartjs-2` (`stats/ui/linechart.tsx`) or recharts (`barchart.tsx`). Both are installed.

## Later

- **Day records:**
  - export `day_record` in `server/schemas.ts` and push
  - a POST route that skips dates already saved
  - make `hasDayPassed` sum only the latest log's day (`isSameDay`)
  - call it on load
  - delete `day_record` rows when a task is deleted
- **Edit task** has no server route, so edits are screen-only.
- **Calendar taps** (`month.tsx` gets `createDBLog`) don't dispatch `add_log`.
- `Task.total` is still in the type, used in `editTask.tsx` and `selectedDayStats.tsx`.
- Local `main` tracks `origin/dev`. Fix with `git branch -u origin/main main`.
