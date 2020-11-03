<script lang="ts">
    import DataList from './DataList.svelte';
    import type { Item } from './DataList.svelte';
    import db from '../database';
    import { onMount } from 'svelte';
    import { dateString } from '../date';

    let exercises: Item[] = [];

    async function fetchExercises() {
        exercises = (await db.exercises.toArray()).map((exercise) => ({
            value: exercise.id,
            text: exercise.name,
        }));
        exercises.sort((a, b) => a.text.localeCompare(b.text));
    }
    let selectedItem: Item;
    async function createExercise(name: string): Promise<Item> {
        let id = await db.exercises.put({ name });
        return { text: name, value: id };
    }

    onMount(fetchExercises);
</script>

<style lang="scss">
    :global(*) {
        box-sizing: border-box;
        font-family: inherit;
        font-size: inherit;
        color: inherit;
    }
    :global(body) {
        margin: 0 16px;
    }
    :global(html) {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu,
            Cantarell, 'Helvetica Neue', sans-serif;
        font-size: 16px;
        color: #363636;
    }
    :global(.input) {
        background: #fff;
        border: 1px solid #dbdbdb;
        border-radius: 3px;
        outline: 0;
        min-height: 2.5em;
        padding: 0.5em 0.75em;
        width: 100%;
        &:focus {
            border-color: #3273dc;
            box-shadow: 0 0 0 0.125em rgba(50, 115, 220, 0.25);
        }
    }
</style>

<span>Date</span>
<input class="input" type="date" value={dateString(new Date())} />
<span>Exercise</span>
<DataList bind:selectedItem bind:items={exercises} create={createExercise} type="exercise" />
