<script lang="ts" context="module">
    export interface Item {
        value: any;
        text: string;
    }
</script>

<script lang="ts">
    import { onMount } from "svelte";
    export let items: Item[] = [];
    export let selectedIndex: number = 0;
    export let name: string;

    let element: HTMLElement;
    let touching = false;
    let timeout: number;
    function handleScroll() {
        clearTimeout(timeout);
        if (!touching) {
            timeout = setTimeout(() => {
                let index = Math.round(element.scrollTop / 44);
                select(index);
            }, 100);
        }
    }

    function handleTouchstart() {
        touching = true;
    }

    function handleTouchend() {
        touching = false;
        handleScroll();
    }

    function select(index: number, smooth: boolean = true) {
        selectedIndex = index;
        let offset = index * 44;
        if (smooth) {
            element.scroll({
                top: offset,
                behavior: "smooth",
            });
        } else {
            element.scrollTop = offset;
        }
    }
    onMount(() => {
        select(selectedIndex, false);
    });
</script>

<style lang="scss">
    @use '../styles/colors.scss';
    $items: 7;
    $itemheight: 44px;
    $height: calc(100vh - #{$itemheight * 2});
    $max-height: $itemheight * $items;
    $breakpoint: $itemheight * ($items + 2);
    .column {
        overflow-y: auto;
        flex-grow: 1;
        flex-basis: 0;
        height: $height;
        max-height: $max-height;
        position: relative;
    }
    .sticky {
        height: 0;
        position: sticky;
        bottom: 0;
        pointer-events: none;
    }
    .fade {
        position: relative;
        max-height: $max-height;
        height: $height;
        bottom: $max-height;
        @media (max-height: $breakpoint) {
            bottom: $height;
        }
        display: flex;
        justify-content: center;
        flex-direction: column;
        background: linear-gradient(
            to bottom,
            #fff 0.5em,
            rgba(255, 255, 255, 0) calc(0.5em + (44px * 1.5)),
            rgba(255, 255, 255, 0) calc(100% - (44px * 1.5)),
            #fff 100%
        );
    }
    .selector {
        height: 44px;
        border-top: 1px solid colors.$border;
        border-bottom: 1px solid colors.$border;
    }
    .item {
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
    }
    .filler {
        max-height: $itemheight * ($items - 1)/2;
        height: calc((#{$height} - #{$itemheight}) / 2);
    }
    .name {
        margin-top: 5px;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        text-align: center;
        font-size: 0.75em;
    }
</style>

<div
    bind:this={element}
    class="column"
    on:scroll={handleScroll}
    on:touchstart={handleTouchstart}
    on:touchend={handleTouchend}
    on:mousedown={handleTouchstart}
    on:mouseup={handleTouchend}>
    <div class="filler" />
    {#each items as item, index}
        <div class="item" on:click={() => select(index)}>{item.text}</div>
    {/each}
    <div class="filler" />
    <div class="sticky">
        <div class="fade">
            <div class="name">{name}</div>
            <div class="selector" />
        </div>
    </div>
</div>
