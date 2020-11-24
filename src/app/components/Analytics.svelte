<script lang="ts">
    import { lerp, map } from '../scripts/math';
    import db from '../scripts/database';

    const width = 700;
    const height = 400;
    const em = 16;
    const w = width - 2 * em;
    const h = height - 2 * em;
    const x = em;
    const y = em;

    function translate(point: [number, number]) {
        return `${lerp(x, x + w, point[0])},${lerp(y + h, y, point[1])}`;
    }

    (async () => {
        let records = (await (await db).getAll('sets'))
            .filter((set) => set.exercise_id == 0)
            .map((set) =>
                set.repititions > 1 ? set.weight * (1 + set.repititions / 30) : set.weight
            );
        let nth = 3;
        records = records.reduce(function (r, a, i) {
            var ii = Math.floor(i / nth);
            // @ts-ignore
            r[ii] = ((r[ii] || 0) + a) / (i % nth !== nth - 1 || nth);
            return r;
        }, []);
        const min = Math.min(...records);
        const max = Math.max(...records);
        const data = records.map((record, i): [number, number] => [
            i / records.length,
            map(record, min, max, 0, 1),
        ]);

        for (let i = 0; i < data.length; i++) {
            path += ` ${translate(data[i])}`;
        }
    })();

    let path = '';
</script>

<style lang="scss">
    @use "../styles/colors.scss";
    svg {
        background: #fff;
        border-radius: 3px;
        border: 1px solid colors.$border;
    }
    .crisp {
        shape-rendering: crispedges;
        vector-effect: non-scaling-stroke;
        stroke: #000;
        fill: none;
    }
    .line {
        vector-effect: non-scaling-stroke;
        stroke: #f00;
        fill: none;
    }
</style>

<svg viewBox={`0 0 ${width} ${height}`}>
    <path class="crisp" d={`M${x} ${y}V${y + h}H${x + w}`} />
    <polyline class="line" points={path} />
</svg>
