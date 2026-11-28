import { describe, expect, it } from 'vitest';
import { mergeMuscles, muscleAdditionsSchema, musclesSchema } from './muscles';

describe('musclesSchema', () => {
	it('accepts primary and secondary groups', () => {
		const result = musclesSchema.safeParse({ primary: ['shoulders'], secondary: ['core', 'grip'] });

		expect(result.success).toBe(true);
	});

	it('rejects an unknown group', () => {
		const result = musclesSchema.safeParse({ primary: ['neck'], secondary: [] });

		expect(result.success).toBe(false);
	});

	it('rejects a group listed twice', () => {
		const result = musclesSchema.safeParse({ primary: ['core', 'core'], secondary: [] });

		expect(result.error?.issues[0].message).toBe('Each muscle group can be listed only once');
	});

	it('rejects a group that is both primary and secondary', () => {
		const result = musclesSchema.safeParse({ primary: ['core'], secondary: ['core'] });

		expect(result.error?.issues[0].message).toBe(
			"A muscle group can't be both primary and secondary: core"
		);
	});
});

describe('muscleAdditionsSchema', () => {
	it('accepts an empty object (a variation that adds nothing)', () => {
		expect(muscleAdditionsSchema.safeParse({}).success).toBe(true);
	});

	it('applies the same rules as musclesSchema', () => {
		const result = muscleAdditionsSchema.safeParse({ primary: ['quads'], secondary: ['quads'] });

		expect(result.success).toBe(false);
	});
});

describe('mergeMuscles', () => {
	const halo = { primary: ['shoulders' as const], secondary: ['grip' as const, 'core' as const] };

	it('returns the base muscles when there are no additions', () => {
		expect(mergeMuscles(halo)).toEqual(halo);
	});

	it('adds new groups from the variation', () => {
		const squatHalo = mergeMuscles(halo, { primary: ['quads', 'glutes'] });

		expect(squatHalo).toEqual({
			primary: ['shoulders', 'glutes', 'quads'],
			secondary: ['grip', 'core']
		});
	});

	it('promotes a secondary group to primary when the variation lists it as primary', () => {
		const result = mergeMuscles(halo, { primary: ['core'] });

		expect(result.primary).toContain('core');
		expect(result.secondary).not.toContain('core');
	});

	it('never demotes a primary group', () => {
		const result = mergeMuscles(halo, { secondary: ['shoulders'] });

		expect(result.primary).toContain('shoulders');
		expect(result.secondary).not.toContain('shoulders');
	});
});
