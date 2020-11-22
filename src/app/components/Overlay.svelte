<script lang="ts">
    import { fade } from 'svelte/transition';
    export let isVisible = false;

    let overlay: HTMLElement;
    function handleClick(event: MouseEvent) {
        if (event.target == overlay) {
            isVisible = false;
        }
    }
</script>

<style lang="scss">
    .overlay {
        background: rgba(0, 0, 0, 0.5);
        position: fixed;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        z-index: 10;
        display: flex;
        align-items: flex-end;
    }
</style>

{#if isVisible}
    <div
        bind:this={overlay}
        class="overlay"
        on:click={handleClick}
        transition:fade={{ duration: 100 }}>
        <slot />
    </div>
{/if}
