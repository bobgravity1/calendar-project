// type User = {
//   streak: number,
//   today: {
//     kratom: number | null,
//     leg: number | null
//   }
//   name: string,
// }

const year = new Date().getFullYear();

const months = ['january', 'february', 'march', 'april', 'may',
  'june', 'july', 'august', 'september', 'october', 'november',
  'december'] as const;


type Month = (typeof months)[number];

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const dayContainer = `bg-glass-light shadow-none! border border-muted-foreground/80 rounded flex justify-between mx-auto mb-4`
const dayClasses = `relative text-primary/80! font-extrabold! size-10 flex items-center justify-center
  after:absolute after:top-1/2 after:-right-1 after:h-[50%] after:w-[.24px] after:-translate-y-1/2
  after:bg-white/80 last:after:hidden`
const numberClasses = ` [&>span]:transition hover:scale-[.95] [&>span]:animation [&>span]:duration hover:[&>span]:scale-[1.3]  grid size-10 border-transparent border hover:border-secondary/40 font-semibold! text-secondary place-items-center rounded-sm lg:cursor-pointer transition duration-200 hover:border-muted-foreground animation hover:bg-primary/20`

export const Days = ({ dayRender, dayIndex }: { dayRender: number, dayIndex: number }) => {
  const num = Array.from({ length: dayRender }, (_, i) => i + 1)
  // Array.from has an optional second parameter called mapFn
  // it calls that function once per index while it builds the new array.
  return (
    <div className='py-4'>
      <section className={dayContainer}>
        {weekdays.map((d, i) => {
          return (
            <div key={i} className={dayClasses}>{d}</div>
          )
        })}
      </section>
      <div className='grid grid-cols-7 gap-2 '>
        {
          num.map((n: any) => {
            return (
              <div style={n === 1 ? { gridColumnStart: dayIndex } : undefined} key={n} className={`${numberClasses}`}><span>{n}</span></div>
            )
          })
        }
      </div >
    </div >
  )
}

export const Month = ({ monthRender }: { monthRender: Month }) => {
  let dayCount = 31;
  const short = ['june', 'september', 'november', 'april'];
  if (monthRender === 'february') {
    dayCount = year === 2028 ? 29 : 28;
  }
  let thirty = short.includes(monthRender);
  if (thirty) {
    dayCount = 30
  }

  const monthIndex = months.indexOf(monthRender);
  const dayIndex = new Date(2026, monthIndex, 1).getDay() + 1;
  console.log(monthIndex, dayIndex)

  return (
    <Days dayIndex={dayIndex} dayRender={dayCount} />
  )
}

export const Calendar = () => {
  return (
    <section className='max-w-7xl flex justify-center mx-auto'>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mx-auto gap-4 xl:gap-8">
        {months.map((month: Month) => {
          const capitalized = `${month.charAt(0).toUpperCase() + month.slice(1)}`
          return (
            <article key={month} className="bg-glass-light border-0 z-0! text-card-foreground rounded-xl w-96 overflow-hidden flex flex-col items-center">
              <div className='w-full bg-card py-2 border-muted-foreground '><figcaption className='w-full text-center text-xl font-medium'>{capitalized}</figcaption></div>
              <Month monthRender={month} />
            </article>
          )
        })}
      </div>
    </section>
  )
}


