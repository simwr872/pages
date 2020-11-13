import Dexie from 'dexie';

// TODO: is this always a singleton?
export default new (class extends Dexie {
    sets: Dexie.Table<ISet, number>;
    exercises: Dexie.Table<IExercise, number>;

    constructor() {
        super('database');
        this.version(1).stores({
            sets: '++id,date,exercise_id',
            exercises: '++id,&name',
        });
    }
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
