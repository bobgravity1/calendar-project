# To do

- [ ] Delete a task → delete all of its logs too
  - Either delete the logs in the delete route first, or let the database do it with a cascade on the foreign key.
    - route: `await db.delete(logTable).where(eq(logTable.task, submittedName));`
    - cascade: `references(() => taskTable.name, { onUpdate: "cascade", onDelete: "cascade" })`

- [ ] Table integration: show the logs in the stats table
  - Either read the logs from the user context, or have the table fetch and hold its own.
    - context: `{user.logs.map((log) => <TableRow key={log.log_id}>…</TableRow>)}`
    - own state: `useEffect(() => { getAllLogs().then(setLogs) }, [])`

- [ ] Favorite feature: quick log on every view
  - You can use a Zustand store (like the view manager), attach it to the user state, or give it its own context.
    - zustand: `const favorite = useFavorite((state) => state.favorite)`
    - user state: `dispatch({ type: 'set_favorite', name: task.name })`
    - context: `const { favorite, setFavorite } = useContext(FavoriteContext)`

- [ ] Chart.js
  - Either build on the existing Chart.js line chart, or use the shadcn/recharts charts already in stats.
    - chart.js: `<Line data={{ labels: days, datasets: [{ data: totals }] }} />`
    - recharts: `<BarChart data={dailyTotals}><Bar dataKey="total" /></BarChart>`


    foreign key log delete with task.
