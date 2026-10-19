# JavaScript

Subject notes from the calendar project. New lessons go in as new sections here, not as new files.

## Reshaping data: write both shapes first

Any time data is in one shape and you need another, write the shape you **have** and the shape you **want**, with real values, as a comment *before* writing code:

```ts
// { kratom: [...logs], leg: [...logs] } => [ { task: 'kratom', total: 300 }, { task: 'leg', total: 17 } ]
```

Comparing the two tells you which tool to use:

- Same number of items, each transformed: `map`.
- Fewer items: `filter`.
- Many things collapsing into one value: `reduce`.
- Going between an object and an array: `Object.entries` (object → `[key, value]` pairs) or `Object.fromEntries` (pairs → object).

Writing that comment is most of the work. The code mostly follows from it.

## map vs reduce

Both take a callback, so they blur together. The difference is what carries over from one call to the next.

`reduce` carries a **running result**, and needs a **starting value** as its second argument. It's the same callback-then-config shape as `useEffect(fn, [deps])`. It ends with *one* thing:

```ts
// 30 kratom logs collapse into a single number
const totalAmount = logs.reduce((total, log) => total + log.amount, 0)
//                               ↑ running result             ↑ what it starts as
```

`map` carries **nothing**. Each call gets one item and returns one item, and whatever the callback returns *is* the new item:

```ts
['kratom', 'leg'].map((name) => ({ name, done: false }))
// [ { name: 'kratom', done: false }, { name: 'leg', done: false } ]
```

The trap is using `reduce` with a `{}` start to build an array of objects:

```ts
Object.entries(totals).reduce((acc, [key, value]) => {
  return { task: key, value: acc + value } // first call: {} + 300 → "[object Object]300"
}, {})
```

Object plus number gives the string `"[object Object]300"`. Every call also *replaces* the accumulator, so only the last task survives. Because the goal was one item out per item in, it was a `map` job. The fix was changing what the existing `map` returned:

```ts
const totals = Object.entries(allLogs).map(([task_name, logs]) => {
  const totalAmount = logs.reduce((total, log) => total + log.amount, 0) // many → one number
  return { task: task_name, total: totalAmount }                        // one in, one out
})
```

`Object.entries` is what makes the object mappable, which is why the callback destructures `[task_name, logs]`.

## A moment vs a calendar day

"Is this from an earlier day?" and "is this earlier than now?" are different questions:

```
now                          Oct 18, 2:00 PM
latest log                   Oct 18, 1:55 PM   (five minutes ago, same day)

new Date(createdAt) < now    → true    "a day passed"  (wrong)
!isToday(new Date(...))      → false   "same day"      (right)
```

Every log ever made is earlier than now, so `<` would report a new day constantly. `date-fns`'s `isToday` compares calendar days in your *local* time zone. Without a library, compare against midnight this morning instead (`const start = new Date(); start.setHours(0, 0, 0, 0)`).

Also: `createdAt` arrives from the API as a string, because JSON has no date type. Comparing a string to a `Date` with `<` doesn't do what you mean, so wrap it in `new Date(createdAt)` first. A string ending in `Z` is UTC, and `new Date` reads it correctly.
