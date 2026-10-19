# React state

Subject notes from the calendar project. New lessons go in as new sections here, not as new files.

## Store the logs, compute the total

A task is a definition: "kratom, measured in mg, +10 per tap." A log is one tap. A total is the taps added up, which makes it **derived** data, like a cart total derived from the items in the cart. Store derived data separately and it drifts out of sync with what it's derived from. So the state holds tasks and logs, and the total is calculated when it's displayed.

This also makes the daily reset free:

```
today:     logs = [kratom 5, kratom 5]   → kratom total = 10
tomorrow:  logs = []                      → kratom total = 0
```

No code resets the total. There's just nothing from today to add up. One caveat: if "today's logs" is filtered once at page load, a tab left open past midnight keeps showing yesterday's logs until the page is refreshed.

## Reducers must be pure

A reducer takes the current state and an action, returns the new state, and does nothing else: no fetches, no timers, no logging to a server. React relies on this. In `StrictMode` (on in this app, `src/main.tsx`), React calls reducers **twice** in development on purpose, to expose side effects. A reducer that wrote to the database would create two logs per tap.

## The handler does the side effects

The event handler is where the outside world gets touched. It sends the change down two separate branches:

```ts
const deleteTask = (task: Task) => {
  dispatch({ type: 'delete_task', task }) // branch 1: reducer → new state → screen
  deleteDBTask(task)                      // branch 2: helper → server → database
}
```

These two branches don't feed into each other. The DB call never passes through the reducer, and the reducer never knows the database exists.

For comparison, Zustand actions are *allowed* to be async and call `fetch`, because they aren't reducers. They're plain functions that happen to call `set`. In this app, Zustand holds only UI state (the current view, the calendar mode), while tasks and logs live in the `useReducer` in `App.tsx`.

## The action type is the contract

```ts
export type TaskAction =
  | { type: 'add_task'; task: Task }
  | { type: 'delete_task'; task: Task }
  | { type: 'add_log'; log: Log }       // a new action picks its payload shape once, here
```

TypeScript rejects any dispatch that doesn't match one of these shapes, so the reducer never has to wonder whether it got a task or just a name. Converting messy input into the right shape is the handler's job. For example, the handler turns a `task` into a `log` before dispatching, so the reducer only has to append it.

## Optimistic updates vs waiting for the server

**Optimistic** means dispatching first and letting the database catch up, so the screen changes instantly. That works when you already have everything the new state needs. Deleting is a good example: you already know which task to remove. If the request then fails, the handler's `catch` is where you undo the dispatch or show a toast.

**Waiting** means calling the server first and dispatching what it returns. Use it when the server creates part of the data. A new log's `log_id` and `createdAt` are made on the server, so the trustworthy version is to await the insert and dispatch the real row:

```ts
const newLog = await createDBLog(task)      // server filled in log_id + createdAt
dispatch({ type: 'add_log', log: newLog })  // state holds exactly what the DB holds
```

The cost is a short delay before the number changes, which a button animation easily covers.
