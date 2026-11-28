import { z } from 'zod';

export const MUSCLE_GROUPS = [
	'shoulders',
	'chest',
	'upper-back',
	'lats',
	'biceps',
	'triceps',
	'grip',
	'core',
	'glutes',
	'quads',
	'hamstrings',
	'calves',
	'hips'
] as const;

export const muscleGroupSchema = z.enum(MUSCLE_GROUPS);

export type MuscleGroup = z.infer<typeof muscleGroupSchema>;

const muscleListSchema = z
	.array(muscleGroupSchema)
	.refine((groups) => new Set(groups).size === groups.length, {
		message: 'Each muscle group can be listed only once'
	});

function noGroupInBothLists(
	muscles: { primary?: MuscleGroup[]; secondary?: MuscleGroup[] },
	ctx: z.RefinementCtx
) {
	const primary = muscles.primary ?? [];
	const both = (muscles.secondary ?? []).filter((group) => primary.includes(group));

	if (both.length > 0) {
		ctx.addIssue({
			code: 'custom',
			message: `A muscle group can't be both primary and secondary: ${both.join(', ')}`,
			path: ['secondary']
		});
	}
}

export const musclesSchema = z
	.object({
		primary: muscleListSchema,
		secondary: muscleListSchema
	})
	.superRefine(noGroupInBothLists);

export type Muscles = z.infer<typeof musclesSchema>;

export const muscleAdditionsSchema = z
	.object({
		primary: muscleListSchema.optional(),
		secondary: muscleListSchema.optional()
	})
	.superRefine(noGroupInBothLists);

export type MuscleAdditions = z.infer<typeof muscleAdditionsSchema>;

/** Primary wins over secondary; the result follows MUSCLE_GROUPS order. */
export function mergeMuscles(base: Muscles, additions: MuscleAdditions = {}): Muscles {
	const isPrimary = (group: MuscleGroup) =>
		base.primary.includes(group) || (additions.primary ?? []).includes(group);

	const isSecondary = (group: MuscleGroup) =>
		base.secondary.includes(group) || (additions.secondary ?? []).includes(group);

	const primary = MUSCLE_GROUPS.filter(isPrimary);
	const secondary = MUSCLE_GROUPS.filter((group) => isSecondary(group) && !isPrimary(group));

	return { primary, secondary };
}
