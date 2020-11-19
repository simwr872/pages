import { openDB, deleteDB } from 'idb';
import type { DBSchema } from 'idb';
import demo from './demo';
declare var __DEMO__: boolean;

export interface DB extends DBSchema {
    sets: {
        key: number;
        value: ISet;
        indexes: {
            date: number;
        };
    };
    exercises: {
        key: number;
        value: IExercise;
        indexes: {
            name: string;
        };
    };
}

const name = 'database';

export default (async () => {
    if (__DEMO__) {
        await deleteDB(name);
    }
    const db = openDB<DB>(name, 1, {
        upgrade(db) {
            let sets = db.createObjectStore('sets', { keyPath: 'id', autoIncrement: true });
            sets.createIndex('date', 'date', { unique: false });

            let exercises = db.createObjectStore('exercises', {
                keyPath: 'id',
                autoIncrement: true,
            });
            exercises.createIndex('name', 'name', { unique: true });
        },
    });
    if (__DEMO__) {
        await demo(await db);
    }
    return db;
})();

export interface ISet {
    id?: number;
    date: number;
    exercise_id: number;
    weight: number;
    repititions: number;
    position: number;
}

export interface IExercise {
    id?: number;
    name: string;
}
