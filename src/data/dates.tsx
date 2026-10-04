export const months = ["January", "February", "March", "April", "May",
    "June", "July", "August", "September", "October", "November", "December"] as const;

export const leap_years = [2028, 2032]

export const today = new Date().toISOString();

export const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
