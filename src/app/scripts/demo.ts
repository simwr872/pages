import type { IDBPDatabase } from 'idb';
import type { DB, ISet } from './database';
import { compactDate } from './date';
import { roundWeight } from './math';

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function lerp(v0: number, v1: number, t: number) {
    return v0 * (1 - t) + v1 * t;
}

interface Exercise {
    name: string;
    start: number;
    end: number;
}

const DAYS = 30;
const REPS = [8,6,4];
const now = Date.now();
const exercises: Exercise[] = [
    { name: 'Bench press', start: 85, end: 90 },
    { name: 'Squat', start: 112.5, end: 120 },
    { name: 'Deadlift', start: 142.5, end: 150 },
];

export default async (db: IDBPDatabase<DB>) => {
    const tx1 = db.transaction('exercises', 'readwrite');
    await Promise.all(
        exercises.map((exercise, index) => tx1.store.put({ id: index, name: exercise.name }))
    );
    await tx1.done;
    let sets: ISet[] = [];
    let id = 0;
    for (let day = 0; day < DAYS; day++) {
        let pos = 0;
        exercises.forEach((exercise, exercise_id) => {
            let tDays = day / (DAYS - 1);
            let date = compactDate(now - 3600 * 24 * 1000 * (DAYS - 1 - day));
            for (let set = 0; set < REPS.length; set++) {
                let oneRepMax = lerp(exercise.start, exercise.end, tDays);
                let repititions = REPS[set] + randomInt(-1, 1);
                let weight = oneRepMax / (1 + repititions/30);
                sets.push({
                    id: id++,
                    date,
                    exercise_id,
                    repititions,
                    weight: roundWeight(weight),
                    position: pos++,
                });
            }
        });
    }

    const tx2 = db.transaction('sets', 'readwrite');
    await Promise.all(sets.map((set) => tx2.store.put(set)));
    await tx2.done;
};
