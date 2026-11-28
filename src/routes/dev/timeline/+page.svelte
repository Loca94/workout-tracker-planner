<script lang="ts">
	import { buildTimeline } from '#lib/engine/buildTimeline.ts';
	import type { Segment, SegmentKind, Timeline } from '#lib/engine/timeline.ts';
	import { formatClock } from '#lib/format/clock.ts';
	import { itemLabel } from '#lib/format/itemLabel.ts';
	import { resolveWorkout, type ResolvedWorkout } from '#lib/model/resolveWorkout.ts';
	import { sampleExercises } from '#lib/model/sampleExercises.ts';
	import { sampleWorkouts } from '#lib/model/sampleWorkouts.ts';

	type Inspection =
		{ ok: true; resolved: ResolvedWorkout; timeline: Timeline } | { ok: false; message: string };

	let workoutId = $state(sampleWorkouts[0].id);

	const inspection = $derived(inspect(workoutId));

	function inspect(id: string): Inspection {
		const workout = sampleWorkouts.find((sample) => sample.id === id);
		if (!workout) return { ok: false, message: `No sample workout "${id}"` };

		const result = resolveWorkout(workout, sampleExercises);
		if (!result.ok) return { ok: false, message: result.problems.join('\n') };

		try {
			return { ok: true, resolved: result.resolved, timeline: buildTimeline(result.resolved) };
		} catch (problem) {
			return { ok: false, message: problem instanceof Error ? problem.message : String(problem) };
		}
	}

	const kindColour: Record<SegmentKind, string> = {
		prep: 'bg-amber-300',
		work: 'bg-emerald-500',
		rest: 'bg-sky-400'
	};

	function describe(segment: Segment, resolved: ResolvedWorkout): string {
		if (segment.itemIndex === undefined) return segment.kind === 'prep' ? 'Get ready' : '—';
		return itemLabel(resolved.items[segment.itemIndex]);
	}

	function percent(ms: number, timeline: Timeline): string {
		return `${(ms / timeline.totalMs) * 100}%`;
	}
</script>

<svelte:head>
	<title>Timeline inspector</title>
</svelte:head>

<main class="mx-auto max-w-5xl space-y-6 p-4">
	<h1 class="text-2xl font-bold">Timeline inspector</h1>

	<label class="flex flex-col gap-1">
		<span class="text-sm font-medium">Sample workout</span>
		<select bind:value={workoutId} class="rounded border p-2">
			{#each sampleWorkouts as workout (workout.id)}
				<option value={workout.id}>{workout.name} ({workout.mode})</option>
			{/each}
		</select>
	</label>

	{#if !inspection.ok}
		<p class="rounded border border-red-300 bg-red-50 p-3 whitespace-pre-line text-red-800">
			{inspection.message}
		</p>
	{:else}
		{@const { timeline, resolved } = inspection}

		<p>
			Total <strong>{formatClock(timeline.totalMs)}</strong> · {timeline.segments.length} segments ·
			{timeline.alerts.length} alerts
		</p>

		<div class="relative">
			<div class="flex h-12 overflow-hidden rounded border">
				{#each timeline.segments as segment, index (index)}
					<div
						class="{kindColour[segment.kind]} border-r border-white last:border-r-0"
						style:width={percent(segment.endMs - segment.startMs, timeline)}
						title="{describe(segment, resolved)} ({formatClock(segment.startMs)}–{formatClock(
							segment.endMs
						)})"
					></div>
				{/each}
			</div>
			{#each timeline.alerts as alert, index (index)}
				<div
					class="absolute top-0 h-12 w-0.5 bg-black"
					style:left={percent(alert.atMs, timeline)}
					title="{alert.type} at {formatClock(alert.atMs)}"
				></div>
			{/each}
		</div>

		<section>
			<h2 class="mb-2 text-lg font-semibold">Segments</h2>
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="border-b">
						<th class="p-1">#</th>
						<th class="p-1">Start</th>
						<th class="p-1">End</th>
						<th class="p-1">Kind</th>
						<th class="p-1">Side</th>
						<th class="p-1">Item</th>
					</tr>
				</thead>
				<tbody class="tabular-nums">
					{#each timeline.segments as segment, index (index)}
						<tr class="border-b">
							<td class="p-1">{index}</td>
							<td class="p-1">{formatClock(segment.startMs)}</td>
							<td class="p-1">{formatClock(segment.endMs)}</td>
							<td class="p-1">{segment.kind}</td>
							<td class="p-1">{segment.side ?? ''}</td>
							<td class="p-1">{describe(segment, resolved)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>

		<section>
			<h2 class="mb-2 text-lg font-semibold">Alerts</h2>
			{#if timeline.alerts.length === 0}
				<p class="text-sm text-gray-600">No alerts yet.</p>
			{:else}
				<table class="w-full text-left text-sm">
					<thead>
						<tr class="border-b">
							<th class="p-1">At</th>
							<th class="p-1">Type</th>
							<th class="p-1">Segment</th>
						</tr>
					</thead>
					<tbody class="tabular-nums">
						{#each timeline.alerts as alert, index (index)}
							<tr class="border-b">
								<td class="p-1">{formatClock(alert.atMs)}</td>
								<td class="p-1">{alert.type}</td>
								<td class="p-1">{alert.segmentIndex}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</section>

		<details>
			<summary class="cursor-pointer font-semibold">Raw JSON</summary>
			<pre class="mt-2 overflow-x-auto rounded bg-gray-100 p-3 text-xs">{JSON.stringify(
					timeline,
					null,
					2
				)}</pre>
		</details>
	{/if}
</main>
