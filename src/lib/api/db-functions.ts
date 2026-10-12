export async function getAllTasks() {
    try {
        const dbTasks = await fetch(`${import.meta.env.VITE_API_URL}/api/task`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json())
        if (!dbTasks.ok) {
            console.log(dbTasks.status)
            return dbTasks.status;
        }
        return dbTasks;
    }
    catch (err) {
        throw new Error(`no tasks found in DB: ${err}`)
    }
}

export async function getAllDBLogs() {
    const allLogs = await fetch(`${import.meta.env.VITE_API_URL}/api/log`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
    if (!allLogs) {
        return null;
    }

    let fullLogObject;
    if (allLogs) {
        fullLogObject = allLogs.log.reduce((groups: { [x: string]: any[]; }, log: { [x: string]: any; }) => {
            const name: string = log['name'];
            if (groups[name] === undefined) {
                groups[name] = [];
            }
            groups[name].push(log)
            return groups;
        }, {})
    }
    return fullLogObject;
}

export async function hasDayPassed() {
    const today = new Date();
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    try {
        const latestDBLog = await fetch(`${import.meta.env.VITE_API_URL}/api/log/latest`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json());

        if (!latestDBLog) {
            return latestDBLog.status
        }
        const { log: { date, task, amount } } = await latestDBLog;
        if (date < today) {
            const allLogs = await getAllDBLogs();

            const totals = Object.entries(allLogs).map(([task_name, logs]: any) => {
                const totalAmount = logs.reduce((total: number, log: { task: string, amount: number }) => total + log.amount, 0);
                return [task_name, totalAmount];
            });

            const taskNameWithTotal = Object.fromEntries(totals);

            return { refresh: true, record: taskNameWithTotal }
        }
        else {
            return { refresh: false, record: null }
        }
    }
    catch (err) {
        throw new Error(`latest logs not found - ${err}`)
    }

}