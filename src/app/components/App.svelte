<script lang="ts">
    import { onMount } from 'svelte';
    import Workout from './Workout.svelte';

    onMount(() => {
        try {
            navigator.serviceWorker.register('./worker.js');
        } catch {
            console.log("NO");
        }
    });
</script>

<Workout />
