import { describe, expect, it } from 'vitest';
import { workoutSchema, type Workout } from './workout';

const emom: Workout = {
	id: 'morning-emom',
	name: 'Morning EMOM',
	mode: 'emom',
	config: { intervalSec: 60, intervals: 12 },
	items: [
		{
			kind: 'reps',
			exerciseId: 'swing',
			variationId: 'two-hand-swing',
			reps: 15,
			loadKg: 24,
			perSide: false
		},
		{
			kind: 'reps',
			exerciseId: 'halo',
			variationId: 'squat-halo',
			reps: 5,
			loadKg: 12,
			perSide: true
		}
	]
};

function firstError(input: unknown): string | undefined {
	return workoutSchema.safeParse(input).error?.issues[0].message;
}

describe('workoutSchema', () => {
	it('accepts an EMOM', () => {
		expect(workoutSchema.safeParse(emom).success).toBe(true);
	});

	it('accepts an AMRAP', () => {
		const amrap = { ...emom, mode: 'amrap', config: { durationSec: 1200 } };

		expect(workoutSchema.safeParse(amrap).success).toBe(true);
	});

	it('accepts intervals with no rest, and with rest between rounds', () => {
		const flow = { ...emom, mode: 'intervals', config: { workSec: 60, restSec: 0, rounds: 1 } };
		const tabata = {
			...emom,
			mode: 'intervals',
			config: { workSec: 20, restSec: 10, rounds: 8, restBetweenRoundsSec: 60 }
		};

		expect(workoutSchema.safeParse(flow).success).toBe(true);
		expect(workoutSchema.safeParse(tabata).success).toBe(true);
	});

	it('rejects a config that belongs to another mode', () => {
		const mismatched = { ...emom, mode: 'emom', config: { durationSec: 1200 } };

		expect(workoutSchema.safeParse(mismatched).success).toBe(false);
	});

	it('rejects a workout without exercises', () => {
		expect(firstError({ ...emom, items: [] })).toBe('A workout needs at least one exercise');
	});

	it('rejects an EMOM with zero intervals', () => {
		expect(firstError({ ...emom, config: { intervalSec: 60, intervals: 0 } })).toBe(
			'Intervals must be at least 1'
		);
	});

	it('rejects durations that are not whole seconds, or longer than an hour', () => {
		expect(firstError({ ...emom, config: { intervalSec: 1.5, intervals: 10 } })).toBe(
			'Durations must be whole seconds'
		);
		expect(firstError({ ...emom, config: { intervalSec: 3601, intervals: 1 } })).toBe(
			'Duration must be 1 hour or less'
		);
	});

	it('rejects negative rest', () => {
		const intervals = {
			...emom,
			mode: 'intervals',
			config: { workSec: 20, restSec: -10, rounds: 8 }
		};

		expect(firstError(intervals)).toBe('Rest cannot be negative');
	});
});

describe('workout items', () => {
	function withItem(item: object) {
		return { ...emom, items: [{ ...emom.items[0], ...item }] };
	}

	it('rejects zero reps and more than 999', () => {
		expect(firstError(withItem({ reps: 0 }))).toBe('Reps must be at least 1');
		expect(firstError(withItem({ reps: 1000 }))).toBe('Reps must be 999 or fewer');
	});

	it('rejects a load above 200 kg', () => {
		expect(firstError(withItem({ loadKg: 201 }))).toBe('Load must be 200 kg or less');
	});

	it('accepts a timed hold', () => {
		const hold = withItem({ kind: 'hold', reps: undefined, holdSec: 30, perSide: true });

		expect(workoutSchema.safeParse(hold).success).toBe(true);
	});

	it('rejects a hold without a duration', () => {
		expect(workoutSchema.safeParse(withItem({ kind: 'hold' })).success).toBe(false);
	});

	it('requires a variation on every item', () => {
		expect(firstError(withItem({ variationId: '' }))).toBe('Id is required');
	});

	describe('holds in an EMOM', () => {
		function emomWithHold(holdSec: number, perSide: boolean) {
			return withItem({ kind: 'hold', reps: undefined, holdSec, perSide });
		}

		it('accepts a per-side hold that fills the interval exactly', () => {
			expect(workoutSchema.safeParse(emomWithHold(30, true)).success).toBe(true);
		});

		it('rejects a per-side hold that does not fit the interval', () => {
			expect(firstError(emomWithHold(40, true))).toBe(
				'Row 1: the hold takes 80s but the interval is 60s'
			);
		});

		it('rejects a two-sided hold longer than the interval', () => {
			expect(firstError(emomWithHold(70, false))).toBe(
				'Row 1: the hold takes 70s but the interval is 60s'
			);
		});

		it('does not limit holds in other modes', () => {
			const intervals = {
				...emomWithHold(90, true),
				mode: 'intervals',
				config: { workSec: 20, restSec: 10, rounds: 1 }
			};

			expect(workoutSchema.safeParse(intervals).success).toBe(true);
		});
	});
});
