<script lang="ts">
    export let headings: string[] = [];
    export let rows: [any,any][] = [];
</script>

<style lang="scss">
    @use "../styles/colors.scss";

    table {
        width: 100%;
        background: #fff;
        border-radius: 3px;
        border: 1px solid colors.$border;
        padding: 1em;
        border-spacing: 0;
    }
    th, td {
        padding: 0.25em 0.5em;
        text-align: left;
        &:last-of-type {
            text-align: right;
        }
    }
    th {
        font-size: 0.75em;
        font-weight: bold;
        border-bottom: 1px solid colors.$border;
    }
</style>

<table>
    <tr>
        {#each headings as heading}
            <th>{heading}</th>
        {/each}
    </tr>
    {#each rows as row}
        <tr>
            {#each row as cell}
                <td>{cell}</td>
            {/each}
        </tr>
    {/each}
</table>
