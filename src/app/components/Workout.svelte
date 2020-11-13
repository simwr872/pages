<script lang="ts">
    import DataList from './DataList.svelte';
    import type { Item as DataListItem } from './DataList.svelte';
    import { onMount } from 'svelte';
    import type { Item as ReorderableListItem } from './ReorderableList.svelte';
    import db from '../scripts/database';
    import { compactDate, dateString } from '../scripts/date';
    import ReorderableList from './ReorderableList.svelte';
    let exercises: DataListItem[] = [];

    async function fetchExercises() {
        exercises = (await db.exercises.toArray()).map((exercise) => ({
            value: exercise.id,
            text: exercise.name,
        }));
        exercises.sort((a, b) => a.text.localeCompare(b.text));
    }
    let selectedItem: DataListItem;
    async function createExercise(name: string): Promise<DataListItem> {
        let id = await db.exercises.put({ name });
        return { text: name, value: id };
    }

    let sets: ReorderableListItem[] = [];
    async function fetchSets(date: number) {
        let exercises = await db.exercises.toArray();
        let data = await db.sets.where({ date }).toArray();
        data.sort((a, b) => a.position - b.position);
        sets = data.map((set) => ({
            id: set.id,
            title: exercises.find((exercise) => exercise.id == set.exercise_id).name,
            body: `${set.repititions}x${set.weight} kg`,
        }));
    }

    function handleChange() {
        db.transaction('rw', db.sets, () => {
            sets.forEach((set, index) => {
                db.sets.update(set.id, { position: index });
            });
        });
    }

    let date = dateString(new Date());
    $: fetchSets(compactDate(date));

    onMount(fetchExercises);
</script>

<span>Date</span>
<input class="input" type="date" bind:value={date} />
<span>Exercise</span>
<DataList bind:selectedItem bind:items={exercises} create={createExercise} type="exercise" />
<button class="button">Add set</button>
<span>Sets</span>
<ReorderableList bind:items={sets} on:change={handleChange} />
