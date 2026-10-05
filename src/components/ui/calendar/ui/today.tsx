import React, { useContext } from "react";
import { Button } from "../../button";
import { personalData } from '../../../../data/dates'

const { date, month, day, weather, city, ip } = personalData;

const dayRender = (date: string) => {
    if (Number(date.split('/')[1]) <= 10) {
        return date.split('/')[1][1]
    }
    return date.split('/')[1]
}


export const Today = ({ onClickView }: { onClickView: (name: 'year' | 'month' | 'day') => void }) => {
    return <article className="day-frame bg-glass-light relative mx-auto flex w-full max-w-4xl flex-col items-center overflow-hidden rounded-2xl border-0 text-foreground shadow-2xl md:w-[75vw]">
        <div className="flex h-[72vh] min-h-152 w-full flex-col">
            <div className="min-h-0 w-full flex-1 overflow-y-auto">
                <header className="relative items-center px-16 flex w-full bg-primary py-3 text-primary-foreground">

                    <div className='absolute left-8 items-center flex gap-1'>
                        <p className='flex gap-x-1 items-center text-xl font-semibold'>{weather}  <svg className='w-3.5 text-white!' xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" fill="currentColor" clip-rule="evenodd" viewBox="0 0 486.87 404.07"><path fill-rule="nonzero"
                            d="M0 78.59c0-14.48 3.55-27.57 10.75-39.43 7.1-11.87 16.53-21.41 28.31-28.5C50.83 3.56 63.82 0 78.03 0c14.11 0 26.82 3.56 38.31 10.66 11.59 7.09 20.75 16.63 27.66 28.5 7.02 11.86 10.47 24.85 10.47 39.15 0 14.39-3.45 27.47-10.47 39.25-6.91 11.77-16.07 21.12-27.66 28.04-11.49 7-24.2 10.46-38.31 10.46-14.21 0-27.2-3.46-38.97-10.46-11.78-6.92-21.21-16.27-28.31-28.04C3.55 105.78 0 92.8 0 78.59zm44.67 0c0 9.44 3.36 17.29 10 23.55 6.63 6.17 14.48 9.25 23.36 9.25 8.97 0 16.54-3.08 22.62-9.25 6.07-6.26 9.15-14.11 9.15-23.55 0-9.72-3.08-17.75-9.15-24.29-6.08-6.45-13.65-9.73-22.62-9.73-8.88 0-16.73 3.28-23.36 9.73-6.64 6.54-10 14.57-10 24.29zm276.51 325.48H218.3V5.42h102.88v398.65zM472.1 250.44H292.49v-82.61H472.1v82.61zM486.87 88.4H292.49V5.42h194.38V88.4z" /></svg></p>
                        <span className='mx-2 font-thin text-2xl'>|</span>
                        <span className='text-orange-300 text-xl font-bold'>{city}</span>
                    </div>

                    <h2 className="mx-auto text-center text-2xl font-semibold">{`${month} ${dayRender(date)} - Sunday`}</h2>

                    <p className=" absolute right-8 mx-auto text-center text-lg font-semibold">IP: {<span className='text-orange-300'>{ip}</span>}</p>
                </header>
            </div>
            <nav className="flex shrink-0 justify-center gap-x-4 pb-8">
                <Button onClick={() => onClickView('month')} className='text-[15px] h-10 w-52 px-4 py-2'>View Month</Button>
            </nav>
        </div>
    </article>
};
