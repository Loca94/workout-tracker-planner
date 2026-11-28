import { describe, expect, it } from 'vitest';
import { resolveWorkout, type ResolvedWorkout } from '#lib/model/resolveWorkout.ts';
import { sampleExercises } from '#lib/model/sampleExercises.ts';
import { sampleWorkouts } from '#lib/model/sampleWorkouts.ts';
import { buildTimeline } from './buildTimeline';

function resolvedSample(id: string): ResolvedWorkout {
	const workout = sampleWorkouts.find((sample) => sample.id === id);
	if (!workout) throw new Error(`No sample workout "${id}"`);

	const result = resolveWorkout(workout, sampleExercises);
	if (!result.ok) throw new Error(result.problems.join('\n'));

	return result.resolved;
}

describe('buildTimeline', () => {
	const emom = resolvedSample('sample-emom');

	it('starts with a 10-second prep by default', () => {
		const timeline = buildTimeline(emom);

		expect(timeline.segments[0]).toEqual({
			startMs: 0,
			endMs: 10_000,
			kind: 'prep'
		});
	});

	it('shifts the workout segments to after the prep', () => {
		const timeline = buildTimeline(emom);

		expect(timeline.segments[1]).toEqual({
			startMs: 10_000,
			endMs: 70_000,
			kind: 'work',
			itemIndex: 0
		});
	});

	it('sets the total to prep plus every interval', () => {
		expect(buildTimeline(emom).totalMs).toBe(10_000 + 9 * 60_000);
	});

	it('uses a custom prep length', () => {
		const timeline = buildTimeline(emom, { prepSec: 5 });

		expect(timeline.segments[0].endMs).toBe(5_000);
		expect(timeline.totalMs).toBe(5_000 + 9 * 60_000);
	});

	it('leaves out the prep when it is 0', () => {
		const timeline = buildTimeline(emom, { prepSec: 0 });

		expect(timeline.segments[0].kind).toBe('work');
		expect(timeline.segments[0].startMs).toBe(0);
		expect(timeline.segments).toHaveLength(9);
	});

	it('has no alerts yet', () => {
		expect(buildTimeline(emom).alerts).toEqual([]);
	});

	it('builds an AMRAP as prep plus one 20-minute work segment', () => {
		const timeline = buildTimeline(resolvedSample('sample-amrap'));

		expect(timeline.segments).toEqual([
			{ startMs: 0, endMs: 10_000, kind: 'prep' },
			{ startMs: 10_000, endMs: 1_210_000, kind: 'work' }
		]);
		expect(timeline.totalMs).toBe(1_210_000);
	});

	it('builds the Tabata sample: prep, then 8 work blocks and 7 rests', () => {
		const timeline = buildTimeline(resolvedSample('sample-tabata'));

		expect(timeline.segments).toHaveLength(1 + 15);
		expect(timeline.totalMs).toBe(10_000 + 8 * 20_000 + 7 * 10_000);
	});

	it('builds the mobility flow from the hold durations', () => {
		const timeline = buildTimeline(resolvedSample('sample-mobility'));

		expect(timeline.segments.map((segment) => segment.kind)).toEqual(['prep', 'work', 'work']);
		expect(timeline.totalMs).toBe(10_000 + 60_000 + 45_000);
	});
});
