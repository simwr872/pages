import db, { ISet } from './database';
import { compactDate } from './date';

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
const SETS = 3;
const now = Date.now();
const exercises: Exercise[] = [
    { name: 'Bench press', start: 85, end: 90 },
    { name: 'Squat', start: 112.5, end: 120 },
    { name: 'Deadlift', start: 142.5, end: 150 },
];

export default () =>
    db.on('ready', () =>
        db.transaction('rw', db.exercises, db.sets, () => {
            db.exercises.clear();
            db.sets.clear();
            db.exercises.bulkPut(
                exercises.map((exercise, id) => {
                    return {
                        id,
                        name: exercise.name,
                    };
                })
            );
            let sets: ISet[] = [];
            let id = 0;
            for (let day = 0; day < DAYS; day++) {
                let pos = 0;
                exercises.forEach((exercise, exercise_id) => {
                    let tDays = day / (DAYS - 1);
                    let date = compactDate(now - 86400000 * (DAYS - 1 - day));
                    for (let set = 0; set < SETS; set++) {
                        let oneRepMax = lerp(exercise.start, exercise.end, tDays);
                        let repititions =
                            Math.round(lerp(8, 6, set / (SETS - 1))) + randomInt(-1, 1);
                        //let weight = oneRepMax / (1 + repititions/30);
                        let weight = oneRepMax / (1 + 8 / 30);
                        sets.push({
                            id: id++,
                            date,
                            exercise_id,
                            repititions,
                            weight: Math.round(weight / 2.5) * 2.5,
                            position: pos++,
                        });
                    }
                });
            }

            db.sets.bulkPut(sets);
        })
    );
