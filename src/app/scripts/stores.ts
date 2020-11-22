import { writable } from 'svelte/store';
import {  dateString } from './date';
import db from './database';

export const date = writable(dateString(new Date()));
export const exercises = writable(db.then((db) => db.getAll('exercises')));
export const exerciseId = writable<number>(null);
export const weightIndex = writable(0);
export const repititionIndex = writable(0);
