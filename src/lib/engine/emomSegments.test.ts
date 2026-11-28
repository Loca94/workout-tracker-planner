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
});
