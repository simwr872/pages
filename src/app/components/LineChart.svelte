<script type="ts">
    import { map, lerp } from "../scripts/helper";

    interface Range {
        min: number;
        max: number;
    }
    interface Point {
        x: number;
        y: number;
    }

    export let width = 700;
    export let height = 400;
    export let padding = 16 * 0.75;
    export let horizontalLines = 4;
    export let verticalLines = 3;
    export let data: Point[] = [];
    export let xFunction = (value: number): any => value;
    export let yFunction = (value: number): any => value;
    export let xAxis: string;
    export let yAxis: string;

    const w = width - 2 * padding;
    const h = height - 2 * padding;
    const x = padding;
    const y = padding;
    const xRange = { min: x, max: x + w };
    const yRange = { min: y + h, max: y };

    const axis = `M0 ${y + h}H${width}M${x} ${height}V0`;
    let hLines = "";
    for (let i = 0; i < horizontalLines; i++) {
        hLines += `M0 ${y + (i * h) / horizontalLines}H${width}`;
    }
    let vLines = "";
    for (let i = 0; i < verticalLines; i++) {
        vLines += `M${x + w - (i * w) / verticalLines} ${height}V0`;
    }
    const grid = hLines + vLines;

    function translatePoint(
        point: Point,
        xOldRange: Range,
        yOldRange: Range,
        xRange: Range,
        yRange: Range
    ): Point {
        const x = map(
            point.x,
            xOldRange.min,
            xOldRange.max,
            xRange.min,
            xRange.max
        );
        const y = map(
            point.y,
            yOldRange.min,
            yOldRange.max,
            yRange.min,
            yRange.max
        );
        return { x, y };
    }

    function cosineBezier(from: Point, to: Point) {
        let K = (Math.PI - 2) / Math.PI;
        let diff = K * (to.x - from.x);
        return `C${from.x + diff} ${from.y} ${to.x - diff} ${to.y} ${to.x} ${
            to.y
        }`;
    }

    let path: string;
    let points: Point[] = [];
    let xTicks = [];
    let yTicks = [];
    $: computePoints(data);
    $: if (points.length) {
        path = points
            .map((point, index) => {
                if (index > 0) {
                    return cosineBezier(points[index - 1], point);
                } else {
                    return `M${point.x} ${point.y}`;
                }
            })
            .join(" ");
    } else {
        path = "";
    }
    function computePoints(data: Point[]) {
        if (data.length) {
            data.sort((a, b) => a.x - b.x);
            let xOldRange: Range = {
                min: data[0].x,
                max: data[data.length - 1].x,
            };
            let y = data.map((point) => point.y);
            let yOldRange: Range = { min: Math.min(...y), max: Math.max(...y) };
            points = data.map((point) =>
                translatePoint(point, xOldRange, yOldRange, xRange, yRange)
            );
            let steps = [xFunction(xOldRange.min)];
            for (let i = 1; i < verticalLines; i++) {
                steps.push(
                    xFunction(
                        lerp(xOldRange.min, xOldRange.max, i / verticalLines)
                    )
                );
            }
            steps.push(xFunction(xOldRange.max));
            xTicks = steps;
            steps = [yFunction(yOldRange.min)];
            for (let i = 1; i < horizontalLines; i++) {
                steps.push(
                    yFunction(
                        lerp(yOldRange.min, yOldRange.max, i / horizontalLines)
                    )
                );
            }
            steps.push(yFunction(yOldRange.max));
            yTicks = steps.reverse();
        } else {
            points = [];
            xTicks = [];
            yTicks = [];
        }
    }
</script>

<style lang="scss">
    @use "../styles/colors.scss";
    .container {
        display: grid;
        grid-template-columns: auto auto 1fr;
        grid-template-rows: 1fr auto auto;
        grid-template-areas:
            "y ya g"
            "_ _ xa"
            "_ _ x";
    }
    .grid {
        stroke: #999;
        fill: none;
        stroke-dasharray: 4;
    }
    .axis {
        stroke: #000;
        fill: none;
        stroke-dasharray: 4;
    }
    .line {
        stroke: #f00;
        fill: none;
        stroke-linejoin: round;
        stroke-width: 4;
    }
    .point {
        fill: #f00;
        stroke-width: 2;
        stroke: #fff;
    }
    .g {
        grid-area: g;
    }
    .y {
        grid-area: y;
        text-align: center;
        writing-mode: vertical-rl;
        transform: rotate(-180deg);
    }
    .x {
        grid-area: x;
        text-align: center;
    }
    .ya {
        color: #999;
        grid-area: ya;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        text-align: right;
        padding-left: 0.5em;
        font-size: 0.75em;
    }
    .xa {
        color: #999;
        grid-area: xa;
        display: flex;
        justify-content: space-between;
        font-size: 0.75em;
        span {
            margin: 0 0.25em;
            &:first-of-type {
                margin-left: 0;
            }
            &:last-of-type {
                margin-right: 0;
                text-align: right;
            }
        }
    }
</style>

<div class="container">
    <div class="y">{yAxis}</div>
    <div class="ya">
        {#each yTicks as value}<span>{value}</span>{/each}
    </div>
    <svg class="g" viewBox={`0 0 ${width} ${height}`}>
        <g vector-effect="non-scaling-stroke">
            <g shape-rendering="crispedges">
                <path class="grid" d={grid} />
                <path class="axis" d={axis} />
            </g>
            <path class="line" d={path} />
            {#each points as point}
                <circle cx={point.x} cy={point.y} r="5" class="point" />
            {/each}
        </g>
    </svg>
    <div class="xa">
        {#each xTicks as value}<span>{value}</span>{/each}
    </div>
    <div class="x">{xAxis}</div>
</div>
