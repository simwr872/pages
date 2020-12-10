import { writable } from 'svelte/store';
import { dateString } from './helper';

interface DataListItem {
    value: any;
    text: string;
}

export const date = writable(dateString(new Date()));
export const exercise = writable<DataListItem>(null);
export const weightIndex = writable(0);
export const repititionIndex = writable(0);


export const analyticsExercise = writable<DataListItem>(null);
