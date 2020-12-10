<script lang="ts">
    import { date, exercise, weightIndex, repititionIndex } from '../scripts/stores';
    import { roundWeight, compressDate, randomID } from '../scripts/helper';
    import db from '../scripts/database';

    import DataList from './DataList.svelte';
    import ReorderableList from './ReorderableList.svelte';
    import Spinner from './Spinner.svelte';
    import Table from './Table.svelte';

    import type { Column } from './Spinner.svelte';
    import type { Item as DataListItem } from './DataList.svelte';
    import type { Item as ReorderableListItem } from './ReorderableList.svelte';

    let exercises = db.then((db) => db.getAll('exercises'));

    let spinnerTitle: string;

    let isDateError = false;
    function correctDateError() {
        if (isDateError) {
            isDateError = false;
        }
    }
    $: {
        if ($date) {
            correctDateError();
        }
        fetchSets();
    }

    async function fetchSets() {
        if ($date) {
            const arr = await exercises;
            let sets = await (await db).getAllFromIndex('sets', 'date', compressDate($date));
            sets.sort((a, b) => a.position - b.position);
            setList = sets.map((set) => ({
                id: set.id,
                title: arr.find((exercise) => exercise.id == set.exercise_id).name,
                body: `${set.repititions}x${set.weight} kg`,
                value: set,
            }));
        } else {
            setList = [];
        }
    }

    let exerciseList: DataListItem[] = [];
    $: exercises.then(
        (exercises) =>
            (exerciseList = exercises
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((exercise) => ({
                    text: exercise.name,
                    value: exercise.id,
                })))
    );

    async function createExercise(name: string): Promise<DataListItem> {
        let id = await (await db).put('exercises', { id: randomID(), name });
        exercises = (await db).getAll('exercises');
        return { text: name, value: id };
    }

    let setList: ReorderableListItem[] = [];

    async function onListReorder() {
        const tx = (await db).transaction('sets', 'readwrite');
        await Promise.all(
            setList.map((set, index) => {
                set.value.position = index;
                tx.store.put(set.value);
            })
        );
    }

    let isSpinnerVisible = false;

    function irregularInterval(checkpoints: [number, number][]) {
        let values = [];
        let value = 0;
        checkpoints.forEach(([step, limit]) => {
            while (value < limit) {
                value += step;
                values.push(value);
            }
        });
        return values;
    }

    let weights = irregularInterval([
        [1, 10],
        [2, 40],
        [2.5, 200],
        [10, 250],
    ]).map((value) => ({ value: value, text: value.toString() }));

    let reps = [];
    for (let i = 1; i <= 30; i++) {
        reps.push({ value: i, text: i.toString() });
    }

    const repColumn: Column = { text: 'Repititions', items: reps, selectedIndex: $repititionIndex };
    const weightColumn: Column = {
        text: 'Weight (kg)',
        items: weights,
        selectedIndex: $weightIndex,
    };
    const columns = [repColumn, weightColumn];

    function setsChanged() {
        fetchSets();
        updateEstimatedStrengthRows();
    }

    async function onSpinnerConfirm() {
        $repititionIndex = repColumn.selectedIndex;
        $weightIndex = weightColumn.selectedIndex;
        await (await db).add('sets', {
            id: randomID(),
            date: compressDate($date),
            exercise_id: $exercise.value,
            position: setList.length,
            weight: weightColumn.items[weightColumn.selectedIndex].value,
            repititions: repColumn.items[repColumn.selectedIndex].value,
        });
        setsChanged();
    }

    async function deleteSet(id: number) {
        await (await db).delete('sets', [id, compressDate($date)]);
        setsChanged();
    }

    function addSet() {
        isExerciseListError = !$exercise;
        isDateError = !$date;
        if (!isExerciseListError && !isDateError) {
            isSpinnerVisible = true;
        }
    }

    let estimatedStrengthRows: [any, any][];
    function populateEstimatedStrengthRows(oneRepMax: number = null) {
        estimatedStrengthRows = [1, 5, 8, 12].map((reps) => {
            if (oneRepMax == null) {
                return [reps, '-'];
            } else if (reps == 1) {
                return [reps, roundWeight(oneRepMax)];
            } else {
                return [reps, roundWeight(oneRepMax / (1 + reps / 30))];
            }
        });
    }

    async function updateEstimatedStrengthRows() {
        if ($exercise) {
            const now = Date.now();
            const records = (
                await (await db).getAllFromIndex(
                    'sets',
                    'date',
                    IDBKeyRange.bound(compressDate(now - 3600 * 24 * 30 * 1000), compressDate(now))
                )
            )
                .filter((set) => set.exercise_id == $exercise.value)
                .map((set) =>
                    set.repititions > 1 ? set.weight * (1 + set.repititions / 30) : set.weight
                );
            if (records.length) {
                return populateEstimatedStrengthRows(Math.max(...records));
            }
        }
        populateEstimatedStrengthRows();
    }

    let isExerciseListError = false;
    function correctExerciseListError() {
        if (isExerciseListError) {
            isExerciseListError = false;
        }
    }

    $: {
        if ($exercise) {
            spinnerTitle = $exercise.text;
            correctExerciseListError();
        }
        updateEstimatedStrengthRows();
    }
</script>

<section>
    <div class="label">Date</div>
    <input class:error={isDateError} type="date" placeholder="Select date" bind:value={$date} />
</section>

<section>
    <div class="label">Exercise</div>
    <DataList
        bind:selectedItem={$exercise}
        bind:items={exerciseList}
        create={createExercise}
        type="exercise"
        bind:isError={isExerciseListError} />
</section>

<section>
    <div class="label">Estimated strength</div>
    <Table rows={estimatedStrengthRows} headings={['Repititions', 'Weight (kg)']} />
</section>

<section><button class="primary" style="width: 100%;" on:click={addSet}>Add set</button></section>

<section>
    <div class="label">Sets</div>
    <ReorderableList
        bind:items={setList}
        on:reorder={onListReorder}
        onDelete={deleteSet}
        empty="No sets this date" />
    <Spinner
        bind:isVisible={isSpinnerVisible}
        {columns}
        title={spinnerTitle}
        on:confirm={onSpinnerConfirm} />
</section>
