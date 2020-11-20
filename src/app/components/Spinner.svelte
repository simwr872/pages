<script lang="ts">
    import { slide } from 'svelte/transition';
    import SpinnerColumn from './SpinnerColumn.svelte';
    import type { Item as ColumnItem } from './SpinnerColumn.svelte';
    import { createEventDispatcher } from 'svelte';
    import Overlay from './Overlay.svelte';

    export let name: string;
    export let visible = true;
    export let columns: Column[] = [];

    const dispatch = createEventDispatcher();

    interface Column {
        name: string;
        text: string;
        items: ColumnItem[];
        selectedIndex: number;
    }


    function handleConfirm() {
        visible = false;
        dispatch(
            'confirm',
            columns.reduce((obj, column) => {
                obj[column.name] = column.items[column.selectedIndex].value;
                return obj;
            }, {})
        );
    }

</script>

<style lang="scss">
    @use '../styles/colors.scss';
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid colors.$border;
        padding: .5em;
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

<Overlay bind:visible>
    <div class="g-container-small" transition:slide={{ duration: 100 }}>
        <div class="content">
            <div class="header">
                <button class="gray" on:click={() => (visible = false)}>Cancel</button>
                <span>{name}</span>
                <button class="primary" on:click={handleConfirm}>Confirm</button>
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
