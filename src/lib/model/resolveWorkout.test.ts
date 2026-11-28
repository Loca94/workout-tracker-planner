import { describe, expect, it } from 'vitest';
import type { Exercise } from './exercise';
import { resolveWorkout } from './resolveWorkout';
import type { Workout } from './workout';

const halo: Exercise = {
	id: 'halo',
	name: 'Halo',
	category: 'kettlebell',
	muscles: { primary: ['shoulders'], secondary: ['grip', 'core'] },
	variations: [
		{ id: 'halo', name: 'Halo', perSide: false },
		{ id: 'squat-halo', name: 'Squat halo', perSide: false }
	],
	defaultVariationId: 'halo'
};

const swing: Exercise = {
	id: 'swing',
	name: 'Swing',
	category: 'kettlebell',
	muscles: { primary: ['glutes', 'hamstrings'], secondary: ['grip', 'core'] },
	variations: [
		{ id: 'two-hand-swing', name: 'Two-hand swing', perSide: false },
		{ id: 'one-arm-swing', name: 'One-arm swing', perSide: true }
	],
	defaultVariationId: 'two-hand-swing'
};

function workoutWith(items: Array<{ exerciseId: string; variationId: string }>): Workout {
	return {
		id: 'w',
		name: 'Test',
		mode: 'amrap',
		config: { durationSec: 600 },
		items: items.map((ids) => ({ kind: 'reps', reps: 10, perSide: false, ...ids }))
	};
}

describe('resolveWorkout', () => {
	it('attaches exercise and variation names to every item', () => {
		const result = resolveWorkout(
			workoutWith([
				{ exerciseId: 'swing', variationId: 'one-arm-swing' },
				{ exerciseId: 'halo', variationId: 'squat-halo' }
			]),
			[halo, swing]
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.resolved.items.map((item) => item.variationName)).toEqual([
			'One-arm swing',
			'Squat halo'
		]);
		expect(result.resolved.items[1].exerciseName).toBe('Halo');
	});

	it('reports an exercise that does not exist', () => {
		const result = resolveWorkout(workoutWith([{ exerciseId: 'snatch', variationId: 'snatch' }]), [
			halo
		]);

		expect(result).toEqual({
			ok: false,
			problems: ['Row 1: the exercise "snatch" doesn\'t exist']
		});
	});

	it('reports a variation that belongs to another exercise', () => {
		const result = resolveWorkout(
			workoutWith([{ exerciseId: 'halo', variationId: 'one-arm-swing' }]),
			[halo, swing]
		);

		expect(result).toEqual({
			ok: false,
			problems: ['Row 1: Halo has no variation "one-arm-swing"']
		});
	});

	it('reports every problem, not just the first', () => {
		const result = resolveWorkout(
			workoutWith([
				{ exerciseId: 'halo', variationId: 'halo' },
				{ exerciseId: 'snatch', variationId: 'snatch' },
				{ exerciseId: 'swing', variationId: 'kneeling-swing' }
			]),
			[halo, swing]
		);

		expect(result.ok).toBe(false);
		if (result.ok) return;

		expect(result.problems).toHaveLength(2);
		expect(result.problems[0]).toMatch(/^Row 2:/);
		expect(result.problems[1]).toMatch(/^Row 3:/);
	});
});
