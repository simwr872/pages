<script lang="ts">
    import {
        roundDecimal,
        groupBy,
        decompressDate,
        compressDate,
        round,
        shortDateString,
        oneRepMax,
    } from "../scripts/helper";
    import db from "../scripts/database";
    import LineChart from "./LineChart.svelte";
    import DataList from "./DataList.svelte";
    import type { Item as DataListItem } from "./DataList.svelte";
    import { analyticsExercise } from "../scripts/stores";

    let exercises = db.then((db) => db.getAll("exercises"));

    interface Point {
        x: number;
        y: number;
    }
    let dataDaily: Point[] = [];
    async function updateData() {
        const now = Date.now();
        let raw: Point[] = (
            await (await db).getAllFromIndex(
                "sets",
                "date",
                IDBKeyRange.bound(
                    compressDate(now - 1000 * 3600 * 730 * 3),
                    compressDate(now)
                )
            )
        )
            .filter((set) => set.exercise_id == $analyticsExercise.value)
            .map((set) => {
                let y = oneRepMax(set.repititions, set.weight);
                let x = round(
                    decompressDate(set.date).getTime(),
                    1000 * 3600 * 24 * 3
                );
                return { x, y };
            });

        let combinedDaily = groupBy(raw, (point) => point.x.toString());
        dataDaily = Object.entries(combinedDaily).map(([x, points]) => {
            let y = Math.max(...points.map((point) => point.y));
            return { x: parseInt(x), y };
        });
    }

    let exerciseList: DataListItem[] = [];
    $: exercises.then(
        (exercises) =>
            (exerciseList = exercises
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((exercise) => ({
                    text: exercise.name,
                    value: exercise.id,
                })))
    );

    $: if ($analyticsExercise) {
        updateData();
    } else {
        dataDaily = [];
    }
</script>

<style lang="scss">
    @use '../styles/colors.scss';
    .chart {
        background: #fff;
        border: 1px solid colors.$border;
        border-radius: 3px;
        padding: 0.5em;
    }
    .title {
        margin-bottom: 0.5em;
        font-weight: bold;
    }
</style>

<section>
    <div class="label">Exercise</div>
    <DataList
        bind:selectedItem={$analyticsExercise}
        bind:items={exerciseList}
        type="exercise" />
</section>

<section>
    <div class="chart">
        <div class="title">Estimated strength last 3 months</div>
        <LineChart
            bind:data={dataDaily}
            xFunction={shortDateString}
            yFunction={roundDecimal}
            xAxis="Date"
            yAxis="Est. strength (kg)" />
    </div>
</section>
