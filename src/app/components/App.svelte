<script lang="ts">
    import Analytics from "./Analytics.svelte";
    import Settings from "./Settings.svelte";
    import Workout from "./Workout.svelte";
    import { onMount } from "svelte";

    onMount(() => {
        try {
            navigator.serviceWorker.register("./worker.js");
        } catch {
            console.log("NO");
        }
    });
    const pages = {
        Analytics: Analytics,
        Workout: Workout,
        Settings: Settings,
    };
    let currentPage = "Analytics";
</script>

<style lang="scss">
    main {
        padding: 1em;
    }
</style>

<nav>
    <div class="g-container-small">
        {#each Object.keys(pages) as page}
            <button
                class:active={currentPage == page}
                on:click={() => (currentPage = page)}>{page}</button>
        {/each}
    </div>
</nav>
<main class="g-container">
    <svelte:component this={pages[currentPage]} />
</main>
