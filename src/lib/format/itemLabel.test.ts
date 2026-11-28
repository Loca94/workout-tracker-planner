import { describe, expect, it } from 'vitest';
import { itemLabel } from './itemLabel';
import type { ResolvedItem } from '#lib/model/resolveWorkout.ts';

const names = {
	exerciseId: 'halo',
	variationId: 'halo',
	exerciseName: 'Halo',
	variationName: 'Halo'
};

describe('itemLabel', () => {
	it('shows reps and load', () => {
		const item: ResolvedItem = { ...names, kind: 'reps', reps: 10, loadKg: 12, perSide: false };

		expect(itemLabel(item)).toBe('Halo ×10 · 12 kg');
	});

	it('marks per-side reps', () => {
		const item: ResolvedItem = { ...names, kind: 'reps', reps: 5, loadKg: 12, perSide: true };

		expect(itemLabel(item)).toBe('Halo ×5 / side · 12 kg');
	});

	it('leaves out the load when there is none', () => {
		const item: ResolvedItem = { ...names, kind: 'reps', reps: 8, perSide: false };

		expect(itemLabel(item)).toBe('Halo ×8');
	});

	it('shows the duration of a hold', () => {
		const item: ResolvedItem = {
			...names,
			variationName: 'Couch stretch',
			kind: 'hold',
			holdSec: 60,
			perSide: true
		};

		expect(itemLabel(item)).toBe('Couch stretch 60 s / side');
	});

	it('uses the variation name, not the exercise name', () => {
		const item: ResolvedItem = {
			...names,
			variationName: 'Squat halo',
			kind: 'reps',
			reps: 6,
			perSide: false
		};

		expect(itemLabel(item)).toBe('Squat halo ×6');
	});
});
