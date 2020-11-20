<script lang="ts">
    import { onMount } from 'svelte';
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

<style lang="scss">
    main {
        padding: 1em;
    }
</style>

<nav>
    <div class="g-container-small">
        {#each Object.keys(pages) as name}
            <button class:active={page == name} on:click={() => (page = name)}>{name}</button>
        {/each}
    </div>
</nav>
<main class="g-container">
    <svelte:component this={pages[page]} />
</main>
