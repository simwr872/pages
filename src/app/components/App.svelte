<script lang="ts">
    import { onMount } from 'svelte';
    import { each } from 'svelte/internal';
import Analytics from './Analytics.svelte';
import Settings from './Settings.svelte';
    import Workout from './Workout.svelte';

    onMount(() => {
        try {
            navigator.serviceWorker.register('./worker.js');
        } catch {
            console.log('NO');
        }
    });
    let pages = {
        Analytics: Analytics,
        Workout: Workout,
        Settings: Settings,
    };
    let page = 'Workout';
</script>

<nav>
    <ol>
        {#each Object.keys(pages) as name}
            <li class:active={page == name} on:click={() => (page = name)}>{name}</li>
        {/each}
    </ol>
</nav>
<main>
    <svelte:component this={pages[page]} />
</main>
