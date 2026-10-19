# Fetch and error handling

Subject notes from the calendar project. New lessons go in as new sections here, not as new files.

## A completely blank page means the module died

A component that crashes usually takes down only part of the tree, so you still see something. A *totally* blank page, with not even the header, means React never mounted. Something that runs before React starts must have thrown. In this app, that's the code at the top of `App.tsx`, outside any function:

```ts
// runs the moment main.tsx imports App.tsx, before React renders anything
const dbTasks = await getAllTasks()
const user: User = { name: 'Bobby', tasks: [...dbTasks], reminders: [] } // throws if dbTasks isn't an array
```

That's a **top-level await**. If it rejects, or the line after it throws, the import of `App.tsx` fails. `main.tsx` then never reaches `createRoot(...).render(...)`, and you get a white screen with one red error in the console. It happened twice for two different reasons. The first time, the API wasn't running, so `fetch` rejected. The second time, `getAllTasks` returned `undefined`, and `[...undefined]` threw "not iterable." Top-level await is a fine way to guarantee data exists before the first render, but it bets the whole app on that request succeeding.

## fetch gives you a Response first and the body second

`fetch` doesn't hand you your data. It hands you a **Response**, and the data is a second step:

```ts
const response = await fetch(url)  // { ok: true, status: 200, headers, ... }  no data on it yet
const body = await response.json() // { tasks: [...] }  whatever the route sent; no .ok on it
```

`.ok` and `.status` exist only on the Response. The common shortcut `.then(res => res.json())` throws the Response away in the same line, so afterwards you're holding only the body, and `body.ok` is `undefined` every time. That makes `!body.ok` always true, which is how `getAllTasks` ended up always returning `undefined`.

The `ok` check exists because **fetch does not reject on a 404 or a 500**. It only rejects when the request couldn't happen at all, like the server being down. A 500 is a "successful" fetch of an error page, so you have to check for it yourself.

## Check things in a fixed order

The order is: fetch, check the response, parse, check the body, destructure. `response` answers "did the request work?" and `body` answers "what did I get?"

```ts
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/log/latest`)
if (!response.ok) throw new Error(`failed to get latest log: ${response.status}`) // failure → throw
const body = await response.json()
if (body === null) return { refresh: false, record: null } // legitimate empty answer → return
const { latestLog: { createdAt } } = body                  // only now is it safe to destructure
```

Those two checks handle different things. A failed request is an error, so it throws. A `null` body is the server honestly saying "there are no logs yet," so it's a normal return.

## Destructure with the server's names, and unwrap the wrapper

`const { logs } = await response.json()` works only because the Hono route sends `c.json({ logs })`, which is shorthand for `{ logs: logs }`, so the key is literally `"logs"`. Destructure a name that isn't a key and you silently get `undefined`. When unsure, open the route and read what's inside `c.json(...)` rather than guessing.

The route also wraps the array in an object, so a helper should hand back the array itself. Returning the whole body gives the caller `{ tasks: [...] }`, and `[...{ tasks: [...] }]` throws the same "not iterable" error as `undefined` does.

## Helpers throw; they never return an error

```ts
} catch (err) {
  return err // looks careful, but `return` means "finished normally"
}
```

Returning from a `catch` resolves the promise, so the caller thinks it succeeded and gets an `Error` object where it expected data. Any `try/catch` the caller wrote never fires. Returning `null` or `response.status` in place of data does the same thing more quietly: the crash moves downstream and stops making sense. The rule: **when a helper can't do its job, it throws.**

Only write a `catch` where you can do something useful with the error. There are three such things: add context and rethrow, recover with a real fallback, or show the user something. Otherwise, leave the `try/catch` out and let the error travel up.

```ts
} catch (err) {
  // says WHICH task failed, and keeps the original error (and its stack) attached
  throw new Error(`task ${name} not deleted`, { cause: err })
}
```

`{ cause: err }` beats `` `...: ${err}` ``, because building a string from the error throws away its stack trace.

The catch that actually *does* something usually belongs to the caller. With optimistic updates, the component that dispatched is the only code that can undo the dispatch or show a toast. So the helper's job is to make sure there's something to catch.

## `res.json()` returns `any`

TypeScript can't know what a server will send, so `response.json()` is typed `any`. Your `Task` type is a promise you made about the data, and nothing checks it at runtime. That's how the `Task` type kept promising a `total` that the database rows never had, with no warning anywhere.
