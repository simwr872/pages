<script lang="ts">
    import { fade, slide } from 'svelte/transition';
    import SpinnerColumn from './SpinnerColumn.svelte';
    import type { Item as ColumnItem } from './SpinnerColumn.svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    export let name: string;

    interface Column {
        name: string;
        text: string;
        items: ColumnItem[];
        selectedIndex: number;
    }

    export let columns: Column[] = [];

    function handleConfirm() {
        hide();
        dispatch("confirm", columns.reduce((obj, column) => {
            obj[column.name] = column.items[column.selectedIndex].value;
            return obj;
        }, {}));
    }

    export let visible = true;

    function hide() {
        visible = false;
    }
</script>

<style lang="scss">
    @use '../styles/colors.scss';
    $z-index: 10;
    .overlay {
        background: rgba(0, 0, 0, 0.5);
        position: fixed;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        z-index: $z-index;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid colors.$border;
        padding: 5px;
    }
    .container {
        width: 100%;
        background: #fff;
        position: fixed;
        width: 100%;
        bottom: 0;
        left: 0;
        z-index: $z-index + 1;
    }
    .body {
        display: flex;
        justify-content: center;
    }
</style>

{#if visible}
    <div class="overlay" on:click={hide} transition:fade={{ duration: 100 }} />
    <div class="container" transition:slide={{ duration: 100 }}>
        <div class="header">
            <button class="button ghost" on:click={hide}>Cancel</button>
            <span>{name}</span>
            <button class="button primary" on:click={handleConfirm}>Confirm</button>
        </div>
        <div class="body">
            {#each columns as column}
                <SpinnerColumn bind:selectedIndex={column.selectedIndex} items={column.items} name={column.text}/>
            {/each}
        </div>
    </div>
{/if}
