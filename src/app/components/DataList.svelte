<script lang="ts" context="module">
    export interface Item {
        value: any;
        text: string;
    }
</script>

<script lang="ts">
    import { fade } from 'svelte/transition';

    export let isError = false;
    export let items: Item[] = [];
    export let type = 'item';
    export let create: (filter: string) => Promise<Item>;

    async function handleCreate() {
        deactivate();
        selectedItem = await create(filter);
        items.push(selectedItem);
        items.sort((a, b) => a.text.localeCompare(b.text));
    }

    let itemsElement: HTMLElement;
    let filteredItems: Item[];
    let filter: string = '';
    $: filteredItems = items.filter((item) =>
        item.text.toLowerCase().includes(filter.toLowerCase())
    );
    $: isActive && filteredItems.length && setTimeout(activateItem, 0);
    let validItem = false;
    $: validItem =
        filter &&
        !filteredItems.map((item) => item.text.toLowerCase()).includes(filter.toLowerCase());

    let activeIndex: number;
    function activateItem() {
        if (filteredItems.length) {
            activeIndex = 0;
            if (selectedItem) {
                for (let i = 0; i < filteredItems.length; i++) {
                    if (filteredItems[i].value == selectedItem.value) {
                        activeIndex = i;
                        break;
                    }
                }
            }
            scrollToActiveItem('center');
        }
    }

    function scrollToActiveItem(block: ScrollLogicalPosition = 'nearest') {
        itemsElement.children[activeIndex].scrollIntoView({ block });
    }

    export let selectedItem: Item;
    function select() {
        if (filteredItems.length) {
            selectedItem = filteredItems[activeIndex];
        }
        deactivate();
    }

    let isActive = false;
    let element: HTMLElement;
    let listElement: HTMLElement;
    function handleKeydown(event: KeyboardEvent) {
        if (event.code == 'Enter' || event.code == 'Space') {
            isActive = true;
        } else if (event.code == 'Backspace' || event.code == 'Delete') {
            selectedItem = null;
        }
    }
    function handleMousedown(event: MouseEvent) {
        if (event.target == element || element.contains(event.target as Node)) {
            isActive = !isActive;
        } else if (isActive) {
            if (event.target != listElement && !listElement.contains(event.target as Node)) {
                deactivate();
            }
        }
    }
    function activated(node: HTMLElement) {
        filter = '';
        setTimeout(() => {
            node.focus();
            activateItem();
        }, 0);
    }
    function deactivate() {
        isActive = false;
        element.focus();
    }

    function handleFilterKeydown(event: KeyboardEvent) {
        if (event.code == 'Escape') {
            deactivate();
        } else if (event.code == 'Enter' || event.code == 'Tab') {
            event.preventDefault();
            event.stopPropagation();
            select();
        } else if (event.code == 'ArrowDown') {
            event.preventDefault();
            activeIndex = Math.min(activeIndex + 1, filteredItems.length - 1);
            scrollToActiveItem();
        } else if (event.code == 'ArrowUp') {
            event.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            scrollToActiveItem();
        } else if (event.code == 'Backspace' || event.code == 'Delete') {
            event.stopPropagation();
        }
    }
</script>

<style lang="scss">
    @use "sass:color";
    @use '../styles/mixins.scss';
    @use '../styles/colors.scss';
    .container {
        position: relative;
    }
    .faded {
        color: colors.$placeholder;
    }
    .placeholder {
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        &.active {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            z-index: 2;
        }
    }
    .list {
        background: #fff;
        position: absolute;
        top: 44px;
        z-index: 1;
        width: 100%;
        display: flex;
        flex-direction: column;
        border-bottom-left-radius: 3px;
        border-bottom-right-radius: 3px;
        overflow: hidden;
        border: 1px solid colors.$border;
        border-top: 0;
        box-shadow: 0 0.5em 1em -0.125em rgba(0, 0, 0, 0.4);
    }
    .items {
        max-height: 10em;
        overflow-y: auto;
    }
    .item {
        @include mixins.target;
        cursor: pointer;
        padding: 0 1em;
        display: flex;
        align-items: center;
        &.active {
            background: colors.$focus !important;
            color: #fff;
        }
        &.selected {
            background: #ddd;
        }
    }
    .create {
        border-top: 1px solid colors.$border;
        padding: 0.5em 0.75em;
        font-weight: bold;
        &:hover {
            background: colors.$focus;
            color: #fff;
        }
    }
    .filter {
        padding: 0.5em 0.75em;
        border-bottom: 1px solid colors.$border;
    }
</style>

<svelte:window on:mousedown={handleMousedown} />
<div class="container">
    <div
        class="input placeholder"
        class:error={isError}
        class:faded={!selectedItem}
        class:active={isActive}
        tabindex="0"
        on:keydown={handleKeydown}
        bind:this={element}>
        <span>{selectedItem ? selectedItem.text : `Select ${type}`}</span>
        <span>▼</span>
    </div>
    {#if isActive}
        <div class="list" transition:fade={{ duration: 100 }} bind:this={listElement}>
            <div class="filter">
                <input
                    type="text"
                    class="input ghost block"
                    use:activated
                    on:keydown={handleFilterKeydown}
                    bind:value={filter}
                    placeholder={`Type to filter${create != null ? ' or create ' : ' '}${type}`} />
            </div>
            <div class="items" bind:this={itemsElement}>
                {#each filteredItems as item, index}
                    <div
                        class="item"
                        class:selected={selectedItem == item}
                        class:active={activeIndex == index}
                        on:mouseover={() => (activeIndex = index)}
                        on:click={select}>
                        {item.text}
                    </div>
                {/each}
                {#if !filteredItems.length}
                    <div class="faded item">No results found</div>
                {/if}
            </div>
            {#if validItem && create != null}
                <div class="create item" on:click={handleCreate}>Create {type} "{filter}"</div>
            {/if}
        </div>
    {/if}
</div>
