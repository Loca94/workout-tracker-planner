import { describe, expect, it } from 'vitest';
import { amrapSegments } from './amrapSegments';

describe('amrapSegments', () => {
	it('is one work segment lasting the whole AMRAP', () => {
		expect(amrapSegments({ durationSec: 1200 })).toEqual([
			{ startMs: 0, endMs: 1_200_000, kind: 'work' }
		]);
	});

	it('is not tied to a single item', () => {
		expect(amrapSegments({ durationSec: 600 })[0].itemIndex).toBeUndefined();
	});
});
