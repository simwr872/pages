<script lang="ts">
    import db from '../scripts/database';
    async function clearDB() {
        (await db).clear("sets");
        (await db).clear("exercises");
    }
</script>

Settings!

<button on:click={clearDB}>Clear database</button>
<button>Clear cache</button>
