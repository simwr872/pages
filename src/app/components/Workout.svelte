<script lang="ts">
    import DataList from './DataList.svelte';
    import type { Item as DataListItem } from './DataList.svelte';
    import type { Item as ReorderableListItem } from './ReorderableList.svelte';
    import db from '../scripts/database';
    import { roundWeight } from '../scripts/math';
    import { compactDate } from '../scripts/date';
    import ReorderableList from './ReorderableList.svelte';
    import Spinner from './Spinner.svelte';
    import type { Column } from './Spinner.svelte';
    import Table from './Table.svelte';
    import { date, exerciseId, exercises, weightIndex, repititionIndex } from '../scripts/stores';

    let spinnerTitle: string;
    $: if ($exerciseId != null) {
        $exercises.then((arr) => (spinnerTitle = arr.find((obj) => obj.id == $exerciseId).name));
    }

    $: $date, fetchSets();
    async function fetchSets() {
        if ($date) {
            const arr = await $exercises;
            let sets = await (await db).getAllFromIndex('sets', 'date', compactDate($date));
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
    $: $exercises.then(
        (exercises) =>
            (exerciseList = exercises
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((exercise) => ({
                    text: exercise.name,
                    value: exercise.id,
                })))
    );

    let selectedExercise: DataListItem;
    if ($exerciseId != null) {
        $exercises.then((exercises) => {
            let obj = exercises.find((obj) => obj.id == $exerciseId);
            selectedExercise = {
                value: obj.id,
                text: obj.name,
            };
        });
    }
    async function createExercise(name: string): Promise<DataListItem> {
        let id = await (await db).put('exercises', { name });
        $exercises = (await db).getAll('exercises');
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
            date: compactDate($date),
            exercise_id: selectedExercise.value,
            position: setList.length,
            weight: weightColumn.items[weightColumn.selectedIndex].value,
            repititions: repColumn.items[repColumn.selectedIndex].value,
        });
        setsChanged();
    }

    async function deleteSet(id: number) {
        await (await db).delete('sets', id);
        setsChanged();
    }

    let isExerciseListError = false;
    $: if (isExerciseListError && !!selectedExercise) {
        isExerciseListError = false;
    }

    function addSet() {
        if (!selectedExercise) {
            isExerciseListError = true;
        } else {
            isExerciseListError = false;
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
        if (selectedExercise) {
            const now = Date.now();
            const records = (
                await (await db).getAllFromIndex(
                    'sets',
                    'date',
                    IDBKeyRange.bound(compactDate(now - 86400000), compactDate(now))
                )
            )
                .filter((set) => set.exercise_id == selectedExercise.value)
                .map((set) =>
                    set.repititions > 1 ? set.weight * (1 + set.repititions / 30) : set.weight
                );
            if (records.length) {
                return populateEstimatedStrengthRows(Math.max(...records));
            }
        }
        populateEstimatedStrengthRows();
    }

    $: {
        // selectedItem
        if (selectedExercise) $exerciseId = selectedExercise.value;
        updateEstimatedStrengthRows();
    }
</script>

<section>
    <div class="label">Date</div>
    <input type="date" placeholder="Select date" bind:value={$date} />
</section>

<section>
    <div class="label">Exercise</div>
    <DataList
        bind:selectedItem={selectedExercise}
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
