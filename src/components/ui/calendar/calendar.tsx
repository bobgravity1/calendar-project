import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useCalendarStore } from '../../../features/calendar/useCalendarState'
import { tz } from "@date-fns/tz";
import { format, formatDistanceStrict } from "date-fns";
import type { MonthName } from "@/types/dates";
import { months } from "@/data/dates";
import { Month, MonthCard } from "./ui/month";

import { runViewTransition } from "@/lib/view-transition";
import alignToCenter from "../../../../Align To Center.svg";
import { Button } from '@/components/ui/button'

import { Today } from "./ui/today";

import { personalData } from '../../../data/dates'

const { date, month, day, weather, city, ip } = personalData;

export const Calendar = ({ createDBLog }: { createDBLog: Function }) => {
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
                <header className="w-full bg-primary py-2 text-primary-foreground">
                  <h2 className="w-full text-center text-xl font-medium">{month}</h2>
                </header>
                <Month createDBLog={createDBLog} monthRender={month} />
              </article>
            ))}
          </div>
        ) : calendarView === 'month' ? (
          <Carousel opts={{ loop: true, align: 'start' }} className="day-frame mx-auto w-[calc(100%-6rem)] max-w-4xl">
            <CarouselContent>
              {Array.from({ length: 12 }).map((_, index) => {
                const slideMonth = months[(months.indexOf(month) + index) % months.length]
                return (
                  <CarouselItem className='basis-1/1' key={index}>
                    <MonthCard createDBLog={createDBLog} slideMonth={slideMonth} onClickView={onClickView} />
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <div className="relative bottom-[50vh]">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        ) : (
          <Today onClickView={onClickView} />
        )}
      </div>
    </section >
  )
}
