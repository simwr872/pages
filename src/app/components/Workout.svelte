<script lang="ts">
    import DataList from './DataList.svelte';
    import type { Item as DataListItem } from './DataList.svelte';
    import { onMount } from 'svelte';
    import type { Item as ReorderableListItem } from './ReorderableList.svelte';
    import db from '../scripts/database';
    import { compactDate, dateString } from '../scripts/date';
    import ReorderableList from './ReorderableList.svelte';
    import Spinner from './Spinner.svelte';
    let exercises: DataListItem[] = [];

    async function fetchExercises() {
        exercises = (await (await db).getAll('exercises')).map((exercise) => ({
            value: exercise.id,
            text: exercise.name,
        }));
        exercises.sort((a, b) => a.text.localeCompare(b.text));
    }
    let selectedItem: DataListItem;
    async function createExercise(name: string): Promise<DataListItem> {
        let id = await (await db).put('exercises', { name });
        return { text: name, value: id };
    }

    let sets: ReorderableListItem[] = [];
    async function fetchSets(date: number) {
        let exercises = await (await db).getAll('exercises');
        let data = await (await db).getAllFromIndex('sets', 'date', date);
        data.sort((a, b) => a.position - b.position);
        sets = data.map((set) => ({
            id: set.id,
            title: exercises.find((exercise) => exercise.id == set.exercise_id).name,
            body: `${set.repititions}x${set.weight} kg`,
            value: set,
        }));
    }

    async function handleChange() {
        const tx = (await db).transaction('sets', 'readwrite');
        await Promise.all(
            sets.map((set, index) => {
                set.value.position = index;
                tx.store.put(set.value);
            })
        );
        /*db.transaction('rw', db.sets, () => {
            sets.forEach((set, index) => {
                db.sets.update(set.id, { position: index });
            });
        });*/
    }

    let date = dateString(new Date());
    $: if(date) {
        fetchSets(compactDate(date));
    } else {
        sets = [];
    }

    onMount(fetchExercises);

    let spinner = false;

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

    let columns = [
        { text: 'Weight (kg)', name: 'weight', items: weights, selectedIndex: 0 },
        { text: 'Repititions', name: 'repititions', items: reps, selectedIndex: 0 },
    ];

    async function handleConfirm(event: CustomEvent) {
        let data = event.detail;
        await (await db).add('sets', {
            date: compactDate(date),
            exercise_id: selectedItem.value,
            position: sets.length,
            weight: data.weight,
            repititions: data.repititions,
        });
        fetchSets(compactDate(date));
    }

    async function deleteSet(id: number) {
        await (await db).delete('sets', id);
        fetchSets(compactDate(date));
    }

    let error = false;
    $: if (error && !!selectedItem) {
        error = false;
    }

    function handleAdd() {
        if (!selectedItem) {
            error = true;
        } else {
            error = false;
            spinner = true;
        }
    }
</script>

<section>
    <div class="label">Date</div>
    <input type="date" placeholder="Select date" bind:value={date} />
</section>

<section>
    <div class="label">Exercise</div>
    <DataList bind:selectedItem bind:items={exercises} create={createExercise} type="exercise" bind:error />
</section>

<section><button class="primary" style="width: 100%;" on:click={handleAdd}>Add set</button></section>

<section>
    <div class="label">Sets</div>
    <ReorderableList bind:items={sets} on:change={handleChange} onDelete={deleteSet} />
    <Spinner
        bind:visible={spinner}
        {columns}
        name={selectedItem ? selectedItem.text : ''}
        on:confirm={handleConfirm} />
</section>
