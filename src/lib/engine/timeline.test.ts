import { describe, expect, it } from 'vitest';
import { segmentAt, type Timeline } from './timeline';

const timeline: Timeline = {
	totalMs: 130_000,
	segments: [
		{ startMs: 0, endMs: 10_000, kind: 'prep' },
		{ startMs: 10_000, endMs: 70_000, kind: 'work', itemIndex: 0 },
		{ startMs: 70_000, endMs: 130_000, kind: 'work', itemIndex: 1 }
	],
	alerts: []
};

describe('segmentAt', () => {
	it('finds the segment that contains a time', () => {
		expect(segmentAt(timeline, 25_000)).toEqual({ segmentIndex: 1, elapsedInSegmentMs: 15_000 });
	});

	it('starts at the first segment', () => {
		expect(segmentAt(timeline, 0)).toEqual({ segmentIndex: 0, elapsedInSegmentMs: 0 });
	});

	it('puts a boundary in the next segment', () => {
		expect(segmentAt(timeline, 10_000)).toEqual({ segmentIndex: 1, elapsedInSegmentMs: 0 });
		expect(segmentAt(timeline, 70_000)).toEqual({ segmentIndex: 2, elapsedInSegmentMs: 0 });
	});

	it('keeps the end of the workout in the last segment', () => {
		expect(segmentAt(timeline, 130_000)).toEqual({ segmentIndex: 2, elapsedInSegmentMs: 60_000 });
	});

	it('clamps times before the start and after the end', () => {
		expect(segmentAt(timeline, -500)).toEqual({ segmentIndex: 0, elapsedInSegmentMs: 0 });
		expect(segmentAt(timeline, 999_000)).toEqual({ segmentIndex: 2, elapsedInSegmentMs: 60_000 });
	});

	it('throws on an empty timeline', () => {
		expect(() => segmentAt({ totalMs: 0, segments: [], alerts: [] }, 0)).toThrow(
			'The timeline has no segments'
		);
	});
});
