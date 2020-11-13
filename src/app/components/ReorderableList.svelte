<script lang="ts" context="module">
    export interface Item {
        id: number;
        title: string;
        body: string;
    }
</script>

<script lang="ts">
    import { flip } from 'svelte/animate';
    import { fade } from 'svelte/transition';
    import { clamp } from '../scripts/math';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let items: Item[] = [];

    let grabbedId: number;
    let grabbedOffset: number;
    let grabbedY: number;
    let grabbedIndex: number;
    let itemsElement: HTMLElement;
    let grabbedHTML: string;

    function hoveredIndex(y: number) {
        let rect = itemsElement.getBoundingClientRect();
        y = clamp(rect.top, y, rect.bottom - 1) - rect.top;
        return Math.floor((y * items.length) / rect.height);
    }

    function calculateY(y: number) {
        let itemsRect = itemsElement.getBoundingClientRect();
        grabbedY = clamp(0, y - itemsRect.top, itemsRect.height) - grabbedOffset;
    }

    function drag(y: number) {
        if (grabbedId) {
            calculateY(y);
            let index = hoveredIndex(y);
            if (index != grabbedIndex) {
                let item = items.splice(grabbedIndex, 1)[0];
                items.splice(index, 0, item);
                grabbedIndex = index;
                items = [...items];
            }
        }
    }

    function drop() {
        grabbedId = null;
        dispatch('change');
    }

    function grab(y: number, id: number) {
        let itemElement = itemsElement.querySelector(`[data-id="${id}"`);
        grabbedHTML = itemElement.innerHTML;
        let itemRect = itemElement.getBoundingClientRect();
        grabbedOffset = y - itemRect.top;
        calculateY(y);
        grabbedIndex = items.findIndex((item) => item.id == id);
        grabbedId = id;
    }
</script>

<style lang="scss">
    .items {
        background: #ddd;
        padding: 0;
        margin: 0;
        border: 1px solid #dbdbdb;
        border-radius: 3px;
        position: relative;
    }
    .item {
        overflow: hidden;
        border-top: 1px solid #dbdbdb;
        border-bottom: 1px solid #dbdbdb;
        background: #fff;
        margin: -1px 0;
        height: 3em;
        &:first-of-type,
        .grabbed + & {
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
        }
        &:last-of-type {
            border-bottom-left-radius: 3px;
            border-bottom-right-radius: 3px;
        }
        &,
        & > div {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }
    .delete {
        cursor: pointer;
        outline: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 0;
        padding: 2px;
        height: 3em;
        width: 3em;
        background: 0;
        &:hover {
            background: rgba(0, 0, 0, 0.1);
        }
    }
    .handle {
        border-right: 1px solid #dbdbdb;
        display: flex;
        font-size: 1.5em;
        height: 2em;
        width: 1em;
        font-family: icons;
        color: #dbdbdb;
        cursor: move;
        align-items: center;
        justify-content: center;
    }
    .grabbed {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 1;
        margin: -1px;
        width: calc(100% + 2px);
        border-radius: 3px;
        border: 1px solid #3273dc;
        box-shadow: 0 0 0 0.125em rgba(50, 115, 220, 0.25);
    }
    .ghost,
    .ghost * {
        background: 0;
        border-color: transparent;
        color: transparent;
    }
    .text {
        padding-left: 0.75em;
        display: flex;
        flex-direction: column;
        & > *:first-child {
            font-size: 0.75em;
        }
    }
    .placeholder {
        height: 3em;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>

<svelte:window on:mousemove={(event) => drag(event.clientY)} on:mouseup={drop} />
<ol class="items" bind:this={itemsElement}>
    {#if grabbedId != null}
        <li class="item grabbed" style="top: {grabbedY}px" out:fade={{ duration: 100 }}>
            {@html grabbedHTML}
        </li>
    {/if}
    {#if !items.length}
        <div class="placeholder">Empty</div>
    {/if}
    {#each items as item (item.id)}
        <li
            animate:flip={{ duration: 100 }}
            class="item"
            class:ghost={grabbedId == item.id}
            data-id={item.id}>
            <div>
                <span
                    class="handle"
                    on:mousedown={(event) => {
                        event.preventDefault();
                        grab(event.clientY, item.id);
                    }}
                    on:touchstart={(event) => {
                        event.preventDefault();
                        grab(event.touches[0].clientY, item.id);
                    }}
                    on:touchmove={(event) => drag(event.touches[0].clientY)}
                    on:touchend={drop}
                    on:touchcancel={drop}>&dots;</span>
                <div class="text"><span>{item.title}</span><span>{item.body}</span></div>
            </div>
            <button class="delete">✕</button>
        </li>
    {/each}
</ol>
