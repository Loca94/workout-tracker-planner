import { z } from 'zod';
import { mergeMuscles, muscleAdditionsSchema, musclesSchema, type Muscles } from './muscles';

export const EXERCISE_CATEGORIES = ['kettlebell', 'mobility', 'bodyweight'] as const;

const idSchema = z.string().min(1, 'Id is required');

const nameSchema = z
	.string()
	.trim()
	.min(1, 'Name is required')
	.max(60, 'Name must be 60 characters or fewer');

const tipSchema = z.string().trim().min(1, 'A tip cannot be empty');

export const variationSchema = z.object({
	id: idSchema,
	name: nameSchema,
	perSide: z.boolean(),
	tips: z.array(tipSchema).optional(),
	addsMuscles: muscleAdditionsSchema.optional()
});

export type Variation = z.infer<typeof variationSchema>;

export const exerciseSchema = z
	.object({
		id: idSchema,
		name: nameSchema,
		category: z.enum(EXERCISE_CATEGORIES),
		defaultLoadKg: z
			.number()
			.min(0, 'Load cannot be negative')
			.max(200, 'Load must be 200 kg or less')
			.optional(),
		notes: z.string().trim().max(500, 'Notes must be 500 characters or fewer').optional(),
		muscles: musclesSchema,
		variations: z.array(variationSchema).min(1, 'An exercise needs at least one variation'),
		defaultVariationId: idSchema
	})
	.superRefine((exercise, ctx) => {
		const ids = exercise.variations.map((variation) => variation.id);

		if (new Set(ids).size !== ids.length) {
			ctx.addIssue({
				code: 'custom',
				message: 'Two variations have the same id',
				path: ['variations']
			});
		}

		if (!ids.includes(exercise.defaultVariationId)) {
			ctx.addIssue({
				code: 'custom',
				message: 'The default variation must be one of the exercise’s variations',
				path: ['defaultVariationId']
			});
		}
	});

export type Exercise = z.infer<typeof exerciseSchema>;

export function findVariation(exercise: Exercise, variationId: string): Variation | undefined {
	return exercise.variations.find((variation) => variation.id === variationId);
}

/** Throws on an unknown variation: workouts are validated before this is called, so it's a bug. */
export function effectiveMuscles(exercise: Exercise, variationId: string): Muscles {
	const variation = findVariation(exercise, variationId);

	if (!variation) {
		throw new Error(`Variation "${variationId}" does not belong to exercise "${exercise.id}"`);
	}

	return mergeMuscles(exercise.muscles, variation.addsMuscles);
}
