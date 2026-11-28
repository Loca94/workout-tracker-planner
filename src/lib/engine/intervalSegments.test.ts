import { describe, expect, it } from 'vitest';
import type { ResolvedItem } from '#lib/model/resolveWorkout.ts';
import { intervalSegments } from './intervalSegments';

const names = { exerciseId: 'x', variationId: 'x', exerciseName: 'X', variationName: 'X' };

function reps(): ResolvedItem {
	return { ...names, kind: 'reps', reps: 10, perSide: false };
}

function hold(holdSec: number, perSide = false): ResolvedItem {
	return { ...names, kind: 'hold', holdSec, perSide };
}

function kinds(segments: ReturnType<typeof intervalSegments>) {
	return segments.map((segment) => segment.kind);
}

describe('intervalSegments', () => {
	it('builds a Tabata as 8 work blocks and 7 rests', () => {
		const segments = intervalSegments({ workSec: 20, restSec: 10, rounds: 8 }, [reps()]);

		expect(segments.filter((segment) => segment.kind === 'work')).toHaveLength(8);
		expect(segments.filter((segment) => segment.kind === 'rest')).toHaveLength(7);
		expect(segments.at(-1)).toEqual({
			startMs: 210_000,
			endMs: 230_000,
			kind: 'work',
			itemIndex: 0
		});
	});

	it('goes through every item in each round, with rest after each', () => {
		const segments = intervalSegments({ workSec: 30, restSec: 15, rounds: 2 }, [reps(), reps()]);

		expect(kinds(segments)).toEqual(['work', 'rest', 'work', 'rest', 'work', 'rest', 'work']);
		expect(segments.map((segment) => segment.itemIndex)).toEqual([
			0,
			undefined,
			1,
			undefined,
			0,
			undefined,
			1
		]);
	});

	it('uses the rest between rounds instead of the last rest of each round', () => {
		const segments = intervalSegments(
			{ workSec: 30, restSec: 15, rounds: 2, restBetweenRoundsSec: 60 },
			[reps(), reps()]
		);

		expect(segments.map((segment) => segment.endMs - segment.startMs)).toEqual([
			30_000, 15_000, 30_000, 60_000, 30_000, 15_000, 30_000
		]);
	});

	it('creates no rest segments when rest is 0', () => {
		const segments = intervalSegments({ workSec: 60, restSec: 0, rounds: 1 }, [reps(), reps()]);

		expect(kinds(segments)).toEqual(['work', 'work']);
		expect(segments[1].startMs).toBe(60_000);
	});

	it('times a hold by its own duration, not by workSec', () => {
		const segments = intervalSegments({ workSec: 20, restSec: 0, rounds: 1 }, [hold(60), hold(45)]);

		expect(segments.map((segment) => [segment.startMs, segment.endMs])).toEqual([
			[0, 60_000],
			[60_000, 105_000]
		]);
	});

	it('splits a per-side hold into left and right before the rest', () => {
		const segments = intervalSegments({ workSec: 20, restSec: 10, rounds: 1 }, [
			hold(30, true),
			reps()
		]);

		expect(segments).toEqual([
			{ startMs: 0, endMs: 30_000, kind: 'work', itemIndex: 0, side: 'L' },
			{ startMs: 30_000, endMs: 60_000, kind: 'work', itemIndex: 0, side: 'R' },
			{ startMs: 60_000, endMs: 70_000, kind: 'rest' },
			{ startMs: 70_000, endMs: 90_000, kind: 'work', itemIndex: 1 }
		]);
	});
});
