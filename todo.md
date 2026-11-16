# To do

- [ ] Optional: run the day check on tap too (`handleIncrementClick` in `taskView.tsx`)
  - Covers a tab left open overnight: the load check never runs, so the first tap would make today the newest log and the previous day would never get a record.
  - Use the same block as `App.tsx`: `hasDayPassed()`, then the `for...of` + `try/catch` loop over `writeRecord`. It has to go **above** `createDBLog`.
    - imports: add `hasDayPassed` (log-functions) and `writeRecord` (daily-record-functions) back to `taskView.tsx`
    - replace the empty `lastLog` check (around lines 81–84) with the block

- [ ] Reducer action so records written mid-session reach `user.records`
  - Add the action to `TaskAction` in `src/types/user.ts`, and add a `case` to the reducer in `App.tsx` next to `add_log`.
    - set_records (refetch, replace): `dispatch({ type: 'set_records', records: await getRecords() })`
    - add_record (push each one, like add_log): `dispatch({ type: 'add_record', record: newRecord })`

- [ ] Add records into the UI
