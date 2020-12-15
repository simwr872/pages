<script lang="ts" context="module">
    export interface Column {
        text: string;
        items: ColumnItem[];
        selectedIndex: number;
    }
</script>

<script lang="ts">
    import { slide } from "svelte/transition";
    import SpinnerColumn from "./SpinnerColumn.svelte";
    import type { Item as ColumnItem } from "./SpinnerColumn.svelte";
    import { createEventDispatcher } from "svelte";
    import Overlay from "./Overlay.svelte";

    export let title: string;
    export let isVisible = false;
    export let columns: Column[] = [];

    const dispatch = createEventDispatcher();

    function handleConfirm() {
        isVisible = false;
        dispatch("confirm");
    }
</script>

<style lang="scss">
    @use '../styles/colors.scss';
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid colors.$border;
        padding: 0.5em;
    }
    .body {
        display: flex;
        justify-content: center;
        background: #fff;
    }
    .content {
        background: #fff;
        border: 1px solid colors.$border;
        border-bottom: 0;
        border-top-left-radius: 3px;
        border-top-right-radius: 3px;
        @media (max-width: 700px) {
            border-radius: 0;
            border-left: 0;
            border-right: 0;
        }
    }
</style>

<Overlay bind:isVisible>
    <div class="g-container-small" transition:slide={{ duration: 100 }}>
        <div class="content">
            <div class="header">
                <button
                    class="gray"
                    on:click={() => (isVisible = false)}>Cancel</button>
                <span>{title}</span>
                <button
                    class="primary"
                    on:click={handleConfirm}>Confirm</button>
            </div>
            <div class="body">
                {#each columns as column}
                    <SpinnerColumn
                        bind:selectedIndex={column.selectedIndex}
                        items={column.items}
                        name={column.text} />
                {/each}
            </div>
        </div>
    </div>
</Overlay>
