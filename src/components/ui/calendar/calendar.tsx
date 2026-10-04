import { format, transpose, compareAsc } from "date-fns";
import { tz } from "@date-fns/tz";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
const today = new Date();

const res = await fetch('https://api.ipify.org?format=json');
const data = await res.json();
const myIp = data.ip

const VITE_IPKEY = import.meta.env.VITE_IPLOCATE_API_KEY;

const iplocateUrl = new URL(`https://iplocate.io/api/lookup/${myIp}`)
iplocateUrl.searchParams.set('apikey', `${VITE_IPKEY}`)

const response = await fetch(iplocateUrl)
  .then(res => res.json())
  .then(data => data);



let time_zone;

if (response) {
  console.log(response)
  const { time_zone } = await response;
  // today = transpose(new Date(), tz(time_zone));
}

import { useCalendarStore } from '../../../features/calendar/useCalendarState'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { UserContext } from "@/App";
import { RainbowButton } from "../rainbow-button";

const year = new Date().getFullYear();

import type { MonthName } from "@/types/dates";
import { months, weekdays } from "@/data/dates";

import type { Task, User } from '@/types/user'
import { useContext } from "react";
import { runViewTransition } from "@/lib/view-transition";
import alignToCenter from "../../../../Align To Center.svg";
import { Button } from '@/components/ui/button'
import { TaskComplete } from "../stats/taskComplete";

// --------------weekdays------------- //
const dayContainer = `bg-glass-light shadow-none! border border-muted-foreground/80 rounded flex justify-between mx-auto mb-4`
const dayClasses = `relative text-primary/80! font-extrabold! size-10 flex items-center justify-center
  after:absolute after:top-1/2 after:-right-1 after:h-[50%] after:w-[.24px] after:-translate-y-1/2
  after:bg-white/80 last:after:hidden`
// --------------days/number-------------- //
const numberClasses = `[&>span]:transition hover:scale-[.95] [&>span]:animation [&>span]:duration hover:[&>span]:scale-[1.3] grid size-10 select-none border-transparent border hover:border-secondary/40 font-semibold! text-secondary place-items-center rounded-sm lg:cursor-pointer transition duration-200 hover:border-muted-foreground animation hover:bg-primary/20`
// -------------task checkboxes------------ //
const checkboxClasses = `peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-red-600 checked:border-red-600`

export const Days = ({ completeTask, dayRender, dayIndex, expanded = false }: { completeTask: Function, dayRender: number, dayIndex: number, expanded?: boolean }) => {
  const num = Array.from({ length: dayRender }, (_, i) => i + 1)
  // Array.from has an optional second parameter called mapFn
  // it calls that function once per index while it builds the new array.
  const context = useContext(UserContext)
  if (!context) throw new Error("UserContext provider is missing")
  const { user } = context;

  return (
    <div className={expanded ? 'w-full px-4 py-6 md:px-10' : 'py-4'}>
      <section className={dayContainer}>
        {weekdays.map((d, i) => {
          return (
            <div key={i} className={expanded ? `${dayClasses} h-12! w-auto! flex-1 md:h-14!` : dayClasses}>{d}</div>
          )
        })}
      </section>
      <div className="grid grid-cols-7 gap-2">
        {
          num.map((n: any) => {
            return (
              <Popover>
                <PopoverContent className="bg-glass-dark rounded-lg w-48 px-6 py-4">
                  {user.tasks.map((task: Task) => {
                    return (
                      <TaskComplete task={task} />
                    )
                  })}
                  <RainbowButton>Submit</RainbowButton>
                </PopoverContent>
                <PopoverTrigger render={<div style={n === 1 ? { gridColumnStart: dayIndex } : undefined} key={n} className={expanded ? `${numberClasses} size-auto! text-xl min-h-18 w-full! md:min-h-16` : numberClasses}><span>{n}</span></div>} />
              </Popover>
            )
          })
        }
      </div>
    </div>
  )
}

export const Month = ({ monthRender, completeTask, expanded = false }: { completeTask: Function, monthRender: MonthName, expanded?: boolean }) => {
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
  const dayIndex = new Date(year, monthIndex, 1).getDay() + 1;
  console.log(monthIndex, dayIndex)

  return (
    <Days completeTask={completeTask} dayIndex={dayIndex} dayRender={dayCount} expanded={expanded} />
  )
}

export const Calendar = ({ completeTask }: { completeTask: Function }) => {
  const calendarView = useCalendarStore((state) => state.view)
  const setCalendarView = useCalendarStore((state) => state.setCalendarView)
  const firstMonth = months[0]

  function onClickView(name: 'year' | 'month' | 'day') {
    runViewTransition(() => setCalendarView(name), name === 'year' || calendarView === 'year' ? 'calendar' : 'day')
  }

  return (
    <section className='mx-auto flex max-w-7xl justify-center px-4 pb-12'>
      <div className="calendar-frame w-full">
        {calendarView === 'year' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
            {months.map((month: MonthName) => (
              <article key={month} className="bg-glass-light mx-auto flex w-full max-w-96 flex-col items-center overflow-hidden rounded-xl border-0 text-foreground">
                <div className="w-full bg-primary py-2 text-primary-foreground">
                  <figcaption className="w-full text-center text-xl font-medium">{month}</figcaption>
                </div>
                <Month completeTask={completeTask} monthRender={month} />
              </article>
            ))}
          </div>
        ) : calendarView === 'month' ? (
          <Carousel opts={{ align: 'start' }} className="day-frame mx-auto w-[calc(100%-6rem)] max-w-4xl">
            <CarouselContent>
              {months.map((month: MonthName) => (
                <CarouselItem key={month}>
                  <article className="bg-glass-light relative flex w-full flex-col items-center overflow-hidden rounded-2xl border-0 text-foreground shadow-2xl">
                    <div className="flex h-[72vh] min-h-152 w-full flex-col">
                      <div className="min-h-0 w-full flex-1 overflow-y-auto">
                        <div className="relative flex w-full bg-primary py-3 text-primary-foreground">
                          <figcaption className="mx-auto text-center text-2xl font-semibold">{month}</figcaption>
                        </div>
                        <Month completeTask={completeTask} monthRender={month} expanded />
                      </div>
                      <div className="flex shrink-0 justify-center gap-x-4 pb-8">
                        <Button onClick={() => onClickView('year')} className="flex h-10 w-52 items-center justify-center rounded-lg border-0 px-4 py-2 text-[15px] font-bold">
                          Back to Calendar
                        </Button>
                        <Button onClick={() => onClickView('day')} className="flex h-10 w-52 items-center justify-center rounded-lg border-0 px-4 py-2 text-[15px] font-bold">
                          View Today
                        </Button>
                      </div>
                    </div>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <article className="day-frame bg-glass-light relative mx-auto flex w-full max-w-4xl flex-col items-center overflow-hidden rounded-2xl border-0 text-foreground shadow-2xl md:w-[75vw]">
            <div className="flex h-[72vh] min-h-152 w-full flex-col">
              <div className="min-h-0 w-full flex-1 overflow-y-auto">
                <div className="relative flex w-full bg-primary py-3 text-primary-foreground">
                  <figcaption className="mx-auto text-center text-2xl font-semibold">{firstMonth}</figcaption>
                </div>
              </div>
              <div className="flex shrink-0 justify-center gap-x-4 pb-8">
                <Button onClick={() => onClickView('month')} className='text-[15px] h-10 w-52 px-4 py-2'>View Month</Button>
              </div>
            </div>
          </article>
        )}
      </div>
    </section >
  )
}
