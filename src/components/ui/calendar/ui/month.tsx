import { useContext } from "react";
import { UserContext } from "@/App";
import { months, weekdays } from "@/data/dates";
import type { MonthName } from "@/types/dates";
import type { Task } from "@/types/user";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SelectedDayStats } from "../../stats/ui/selectedDayStats";
import { Button } from "../../button";
import { format, formatDistance } from "date-fns";

const year = new Date().getFullYear();

// --------------weekdays------------- //
const dayContainer = `bg-glass-light shadow-none! border border-muted-foreground/80 rounded flex justify-between mx-auto mb-4`
const dayClasses = `relative text-primary/80! font-extrabold! size-10 flex items-center justify-center
  after:absolute after:top-1/2 after:-right-1 after:h-[50%] after:w-[.24px] after:-translate-y-1/2
  after:bg-white/80 last:after:hidden`
// --------------days/number-------------- //
const numberClasses = `[&>span]:transition not-data-popup-open:hover:scale-[.95] [&>span]:animation [&>span]:duration hover:[&>span]:scale-[1.3] grid size-10 select-none border-transparent border hover:border-secondary/40 font-semibold! text-secondary place-items-center rounded-sm lg:cursor-pointer transition duration-200 hover:border-muted-foreground animation hover:bg-primary/20`
const todayClasses = `ring-2 scale-[.9] hover:[&>span]:scale-[1.3] [&>span]:scale-[1.1] ring-inset ring-secondary/40 hover:ring-0`
// -------------task checkboxes------------ //
const checkboxClasses = `peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-red-600 checked:border-red-600`

export const Days = ({ createDBLog, dayRender, startDay, expanded = false, currentMonthIndex }: { currentMonthIndex: number, createDBLog: Function, dayRender: number, startDay: number, expanded?: boolean }) => {
  const num = Array.from({ length: dayRender }, (_, i) => i + 1)
  // Array.from has an optional second parameter called mapFn
  // it calls that function once per index while it builds the new array.
  const context = useContext(UserContext)
  if (!context) throw new Error("UserContext provider is missing")
  const { user } = context;
  return (
    <div className={expanded ? 'w-full px-4 py-6 md:px-10' : 'py-4'}>
      <div className={dayContainer}>
        {weekdays.map((d, i) => {
          return (
            <div key={i} className={expanded ? `${dayClasses} h-12! w-auto! flex-1 md:h-14!` : dayClasses}>{d}</div>
          )
        })}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {
          num.map((n: number) => {
            const todayIndex = () => {
              const now = new Date()
              // now getDate() returns 4. 
              return now.getMonth() === currentMonthIndex ? now.getDate() : undefined
            }

            return (
              <Popover>
                <PopoverContent className="rounded-lg w-48 px-6 py-4">
                  <SelectedDayStats day={n} month={currentMonthIndex} />
                </PopoverContent>
                <PopoverTrigger render={<div style={n === 1 ? { gridColumnStart: startDay } : undefined} key={n} className={`${expanded ? `${numberClasses} size-auto! text-xl min-h-18 w-full! md:min-h-16` : numberClasses} ${todayIndex() === n ? todayClasses : ''}`}><span>{n}</span></div>} />
              </Popover>
            )
          })
        }
      </div>
    </div >
  )
}

export const Month = ({ monthRender, createDBLog, expanded = false }: { createDBLog: Function, monthRender: MonthName, expanded?: boolean }) => {
  let dayCount = 31;
  const short: MonthName[] = ['June', 'September', 'November', 'April'];
  if (monthRender === 'February') {
    dayCount = year === 2028 ? 29 : 28;
  }
  let thirty = short.includes(monthRender);
  if (thirty) {
    dayCount = 30
  }

  const monthIndex = months.indexOf(monthRender);
  const startDay = new Date(year, monthIndex, 1).getDay() + 1;
  console.log(`monthIndex:${monthIndex}`, startDay)

  return (
    <Days createDBLog={createDBLog} startDay={startDay} dayRender={dayCount} expanded={expanded} currentMonthIndex={monthIndex} />
  )
}

export const MonthCard = ({ createDBLog, slideMonth, onClickView }: { createDBLog: Function, slideMonth: MonthName, onClickView: (name: 'year' | 'month' | 'day') => void }) => {
  return <article className="bg-glass-light relative flex w-full flex-col items-center overflow-hidden rounded-2xl border-0 text-foreground shadow-2xl">
    <div className="flex min-h-152 w-full flex-col">
      <div className="min-h-0 w-full flex-1 overflow-y-auto">
        <header className="relative flex w-full bg-primary py-3 text-primary-foreground">
          <h2 className="mx-auto text-center text-2xl font-semibold">{slideMonth}</h2>
        </header>
        <Month createDBLog={createDBLog} monthRender={slideMonth} expanded />
      </div>
      <nav className="flex shrink-0 justify-center gap-x-4 pb-8">
        <Button onClick={() => onClickView('year')} className="flex h-10 w-52 items-center justify-center rounded-lg border-0 px-4 py-2 text-[15px] font-bold">
          Back to Calendar
        </Button>
        <Button onClick={() => onClickView('day')} className="flex h-10 w-52 items-center justify-center rounded-lg border-0 px-4 py-2 text-[15px] font-bold">
          View Today
        </Button>
      </nav>
    </div>
  </article>
}
