import { describe, expect, it } from 'vitest';
import { holdSegments, type ResolvedHold } from './holdSegments';

function hold(holdSec: number, perSide: boolean): ResolvedHold {
	return {
		kind: 'hold',
		exerciseId: 'couch-stretch',
		variationId: 'couch-stretch',
		exerciseName: 'Couch stretch',
		variationName: 'Couch stretch',
		holdSec,
		perSide
	};
}

describe('holdSegments', () => {
	it('splits a per-side hold into left then right', () => {
		expect(holdSegments(hold(60, true), 2, 10_000)).toEqual([
			{ startMs: 10_000, endMs: 70_000, kind: 'work', itemIndex: 2, side: 'L' },
			{ startMs: 70_000, endMs: 130_000, kind: 'work', itemIndex: 2, side: 'R' }
		]);
	});

	it('keeps a two-sided hold as one segment with no side', () => {
		expect(holdSegments(hold(45, false), 0, 0)).toEqual([
			{ startMs: 0, endMs: 45_000, kind: 'work', itemIndex: 0 }
		]);
	});
});
