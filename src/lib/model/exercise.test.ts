import { describe, expect, it } from 'vitest';
import { effectiveMuscles, exerciseSchema, findVariation, type Exercise } from './exercise';

const halo: Exercise = {
	id: 'halo',
	name: 'Halo',
	category: 'kettlebell',
	defaultLoadKg: 12,
	muscles: { primary: ['shoulders'], secondary: ['grip', 'core'] },
	variations: [
		{ id: 'halo', name: 'Halo', perSide: false, tips: ['Keep the bell close to your head'] },
		{
			id: 'squat-halo',
			name: 'Squat halo',
			perSide: false,
			addsMuscles: { primary: ['quads', 'glutes'] }
		},
		{
			id: 'half-kneeling-rotation-halo',
			name: 'Half-kneeling halo with rotation',
			perSide: true,
			addsMuscles: { primary: ['core'], secondary: ['hips'] }
		},
		{ id: 'kneeling-halo', name: 'Kneeling halo', perSide: false }
	],
	defaultVariationId: 'halo'
};

function firstError(input: unknown): string | undefined {
	return exerciseSchema.safeParse(input).error?.issues[0].message;
}

describe('exerciseSchema', () => {
	it('accepts a halo with four variations', () => {
		expect(exerciseSchema.safeParse(halo).success).toBe(true);
	});

	it('trims names', () => {
		const parsed = exerciseSchema.parse({ ...halo, name: '  Halo  ' });

		expect(parsed.name).toBe('Halo');
	});

	it('rejects an empty name', () => {
		expect(firstError({ ...halo, name: '   ' })).toBe('Name is required');
	});

	it('rejects a name longer than 60 characters', () => {
		expect(firstError({ ...halo, name: 'x'.repeat(61) })).toBe(
			'Name must be 60 characters or fewer'
		);
	});

	it('rejects an exercise without variations', () => {
		expect(firstError({ ...halo, variations: [] })).toBe(
			'An exercise needs at least one variation'
		);
	});

	it('rejects a default variation that is not one of its own', () => {
		expect(firstError({ ...halo, defaultVariationId: 'goblet-squat' })).toBe(
			'The default variation must be one of the exercise’s variations'
		);
	});

	it('rejects two variations with the same id', () => {
		const duplicated = { ...halo, variations: [halo.variations[0], halo.variations[0]] };

		expect(firstError(duplicated)).toBe('Two variations have the same id');
	});

	it('rejects a negative or too heavy default load', () => {
		expect(firstError({ ...halo, defaultLoadKg: -1 })).toBe('Load cannot be negative');
		expect(firstError({ ...halo, defaultLoadKg: 201 })).toBe('Load must be 200 kg or less');
	});

	it('rejects an unknown category', () => {
		expect(exerciseSchema.safeParse({ ...halo, category: 'cardio' }).success).toBe(false);
	});
});

describe('findVariation', () => {
	it('finds a variation by id', () => {
		expect(findVariation(halo, 'kneeling-halo')?.name).toBe('Kneeling halo');
	});

	it('returns undefined for a variation of another exercise', () => {
		expect(findVariation(halo, 'one-arm-swing')).toBeUndefined();
	});
});

describe('effectiveMuscles', () => {
	it('is the exercise muscles for a variation that adds nothing', () => {
		expect(effectiveMuscles(halo, 'halo')).toEqual(halo.muscles);
	});

	it('adds the legs for a squat halo', () => {
		expect(effectiveMuscles(halo, 'squat-halo')).toEqual({
			primary: ['shoulders', 'glutes', 'quads'],
			secondary: ['grip', 'core']
		});
	});

	it('promotes core to primary for the half-kneeling halo with rotation', () => {
		expect(effectiveMuscles(halo, 'half-kneeling-rotation-halo')).toEqual({
			primary: ['shoulders', 'core'],
			secondary: ['grip', 'hips']
		});
	});

	it('throws for a variation that does not belong to the exercise', () => {
		expect(() => effectiveMuscles(halo, 'one-arm-swing')).toThrow(
			'Variation "one-arm-swing" does not belong to exercise "halo"'
		);
	});
});
