import { describe, expect, it } from 'vitest';
import type { ResolvedItem } from '#lib/model/resolveWorkout.ts';
import { emomSegments } from './emomSegments';

function item(variationName: string): ResolvedItem {
	return {
		kind: 'reps',
		exerciseId: 'x',
		variationId: 'x',
		exerciseName: variationName,
		variationName,
		reps: 10,
		perSide: false
	};
}

const abc = [item('A'), item('B'), item('C')];

describe('emomSegments', () => {
	it('creates one work segment per interval', () => {
		const segments = emomSegments({ intervalSec: 60, intervals: 4 }, abc);

		expect(segments).toHaveLength(4);
		expect(segments.every((segment) => segment.kind === 'work')).toBe(true);
	});

	it('cycles items A → B → C → A', () => {
		const segments = emomSegments({ intervalSec: 60, intervals: 7 }, abc);

		expect(segments.map((segment) => segment.itemIndex)).toEqual([0, 1, 2, 0, 1, 2, 0]);
	});

	it('places E90s boundaries every 90 seconds, starting at 0', () => {
		const segments = emomSegments({ intervalSec: 90, intervals: 3 }, abc);

		expect(segments.map((segment) => [segment.startMs, segment.endMs])).toEqual([
			[0, 90_000],
			[90_000, 180_000],
			[180_000, 270_000]
		]);
	});

	it('places E2MOM boundaries every 2 minutes', () => {
		const segments = emomSegments({ intervalSec: 120, intervals: 10 }, abc);

		expect(segments[9]).toMatchObject({ startMs: 1_080_000, endMs: 1_200_000 });
	});

	it('repeats a single item every interval', () => {
		const segments = emomSegments({ intervalSec: 60, intervals: 3 }, [item('Swing')]);

		expect(segments.map((segment) => segment.itemIndex)).toEqual([0, 0, 0]);
	});

	describe('with holds', () => {
		function hold(holdSec: number, perSide: boolean): ResolvedItem {
			return { ...item('Couch stretch'), kind: 'hold', holdSec, perSide };
		}

		it('times a per-side hold left then right, then rests for the rest of the interval', () => {
			const segments = emomSegments({ intervalSec: 60, intervals: 1 }, [hold(20, true)]);

			expect(segments).toEqual([
				{ startMs: 0, endMs: 20_000, kind: 'work', itemIndex: 0, side: 'L' },
				{ startMs: 20_000, endMs: 40_000, kind: 'work', itemIndex: 0, side: 'R' },
				{ startMs: 40_000, endMs: 60_000, kind: 'rest' }
			]);
		});

		it('adds no rest when the hold fills the interval exactly', () => {
			const segments = emomSegments({ intervalSec: 60, intervals: 1 }, [hold(30, true)]);

			expect(segments.map((segment) => segment.kind)).toEqual(['work', 'work']);
		});

		it('keeps the interval grid when holds and reps alternate', () => {
			const segments = emomSegments({ intervalSec: 60, intervals: 2 }, [
				hold(45, false),
				item('Swing')
			]);

			expect(segments).toEqual([
				{ startMs: 0, endMs: 45_000, kind: 'work', itemIndex: 0 },
				{ startMs: 45_000, endMs: 60_000, kind: 'rest' },
				{ startMs: 60_000, endMs: 120_000, kind: 'work', itemIndex: 1 }
			]);
		});
	});
});
