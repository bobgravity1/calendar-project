
import { tz } from "@date-fns/tz";
import { compareAsc, format, transpose } from "date-fns";

export const months = ["January", "February", "March", "April", "May",
    "June", "July", "August", "September", "October", "November", "December"] as const;

export const leap_years = [2028, 2032]

export const today = new Date().toISOString();

export const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
export const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const VITE_IPKEY = import.meta.env.VITE_IPLOCATE_API_KEY;
const VITE_VISUAL_API_KEY = import.meta.env.VITE_VISUAL_CROSSING_API_KEY;

const res = await fetch('https://api.ipify.org?format=json');
const data = await res.json();
const myIp = data.ip

const iplocateUrl = new URL(`https://iplocate.io/api/lookup/${myIp}`)
iplocateUrl.searchParams.set('apikey', `${VITE_IPKEY}`)

const response = await fetch(iplocateUrl)
    .then(res => res.json())
    .then(data => data);

let time_zone;
let time;
let city;
if (response) {
    const { time_zone } = await response;
    time = format(new Date(), "MM/dd/yyyy");
    city = response.city;
}

let date = format(new Date(), "MM/dd/yyyy")

const weatherData = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?
  unitGroup=us
  &key=${VITE_VISUAL_API_KEY}`).then(res => res.json()).then(data => data)

let temp;
if (weatherData) {
    temp = weatherData.temp;
}

export const personalData = {
    ip: response.ip,
    city: city,
    longitude: response.longitude,
    latitude: response.latitude,
    date: date,
    month: months[new Date().getMonth()],
    day: days[new Date().getDay()],
    weather: weatherData.currentConditions.temp
}


